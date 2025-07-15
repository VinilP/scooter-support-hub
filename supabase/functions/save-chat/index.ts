import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface SaveChatRequest {
  message: string;
  conversationId?: string;
  fileContext?: string;
  // Legacy support for direct save
  userId?: string;
  question?: string;
  answer?: string;
  fileUrl?: string;
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

    const requestBody: SaveChatRequest = await req.json();
    
    // Handle legacy direct save format
    if (requestBody.question && requestBody.answer && requestBody.userId) {
      return await handleDirectSave(supabase, user, requestBody);
    }

    // Handle new chat completion format
    const { message, conversationId, fileContext } = requestBody;

    if (!message) {
      throw new Error('Message is required');
    }

    const startTime = Date.now();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    } else {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        })
        .select()
        .single();
      
      if (error) throw error;
      conversation = data;
    }

    // Save user message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        sender: 'user'
      });

    // Get conversation history for context
    const { data: messages } = await supabase
      .from('messages')
      .select('content, sender')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Prepare context for AI
    const conversationContext = messages?.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    let systemPrompt = `You are a helpful customer support assistant for ScootSupport, a scooter support service. 
    Be friendly, concise, and helpful. Focus on scooter-related issues, maintenance, troubleshooting, and customer service.`;

    if (fileContext) {
      systemPrompt += `\n\nThe user has uploaded a file with the following content/context: ${fileContext}`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext.slice(-6), // Last 6 messages for context
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: aiResponse,
        sender: 'assistant'
      });

    // Log analytics
    const responseTime = Date.now() - startTime;
    await supabase
      .from('chat_analytics')
      .insert({
        user_id: user.id,
        conversation_id: conversation.id,
        query_text: message,
        response_time_ms: responseTime,
        file_processed: !!fileContext
      });

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        conversationId: conversation.id,
        success: true
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

// Legacy function for direct save (backwards compatibility)
async function handleDirectSave(supabase: any, user: any, requestBody: SaveChatRequest) {
  const { userId, question, answer, fileUrl, conversationId } = requestBody;

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
      sender: 'assistant',
      created_at: timestamp
    });

  if (answerError) throw answerError;

  // Save to analytics
  await supabase
    .from('chat_analytics')
    .insert({
      user_id: userId,
      conversation_id: conversation.id,
      query_text: question,
      response_time_ms: 0,
      file_processed: !!fileUrl,
      created_at: timestamp
    });

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
}