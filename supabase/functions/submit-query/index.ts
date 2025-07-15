import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface SubmitQueryRequest {
  conversationId: string;
  originalQuestion: string;
  aiResponse: string;
  fileUrl?: string;
  userFeedback?: string;
  escalationReason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const {
      conversationId,
      originalQuestion,
      aiResponse,
      fileUrl,
      userFeedback,
      escalationReason = 'not_helpful'
    }: SubmitQueryRequest = await req.json();

    // Validate required fields
    if (!conversationId || !originalQuestion || !aiResponse) {
      throw new Error('Missing required fields: conversationId, originalQuestion, and aiResponse are required');
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Insert escalated query
    const { data: escalatedQuery, error: insertError } = await supabase
      .from('escalated_queries')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        original_question: originalQuestion,
        ai_response: aiResponse,
        file_url: fileUrl || null,
        user_feedback: userFeedback || null,
        escalation_reason: escalationReason,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to submit query: ${insertError.message}`);
    }

    // Log for admin notification (you could add email notification here)
    console.log(`New escalated query submitted by user ${user.id}:`, {
      queryId: escalatedQuery.id,
      question: originalQuestion,
      reason: escalationReason
    });

    return new Response(
      JSON.stringify({
        success: true,
        queryId: escalatedQuery.id,
        message: 'Your query has been submitted for review. Our team will get back to you soon.',
        timestamp: escalatedQuery.created_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-query function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});