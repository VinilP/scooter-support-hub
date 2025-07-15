import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface SaveChatRequest {
  userId: string;
  question: string;
  answer: string;
  fileUrl?: string;
  conversationId?: string;
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

    const { userId, question, answer, fileUrl, conversationId }: SaveChatRequest = await req.json();

    // Validate required fields
    if (!userId || !question || !answer) {
      throw new Error('Missing required fields: userId, question, and answer are required');
    }

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      throw new Error('User ID mismatch');
    }

    const timestamp = new Date().toISOString();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();
      
      if (error) throw error;
      conversation = data;
    }

    // Save user question
    const { error: questionError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: question,
        sender: 'user',
        file_url: fileUrl || null,
        created_at: timestamp
      });

    if (questionError) throw questionError;

    // Save AI answer
    const { error: answerError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: answer,
        sender: 'bot',
        created_at: timestamp
      });

    if (answerError) throw answerError;

    // Save to analytics
    const { error: analyticsError } = await supabase
      .from('chat_analytics')
      .insert({
        user_id: userId,
        conversation_id: conversation.id,
        query_text: question,
        response_time_ms: 0, // Since this is a manual save
        file_processed: !!fileUrl,
        created_at: timestamp
      });

    if (analyticsError) {
      console.error('Analytics save error:', analyticsError);
      // Don't fail the request if analytics fails
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: timestamp })
      .eq('id', conversation.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        conversationId: conversation.id,
        timestamp: timestamp,
        message: 'Chat interaction saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-chat function:', error);
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