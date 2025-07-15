import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  is_active?: boolean;
  display_order?: number;
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

    const url = new URL(req.url);
    const method = req.method;
    const faqId = url.searchParams.get('id');

    switch (method) {
      case 'GET':
        if (faqId) {
          // Get single FAQ
          const { data: faq, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('id', faqId)
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data: faq }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all FAQs
          const { data: faqs, error } = await supabase
            .from('faqs')
            .select('*')
            .order('display_order', { ascending: true });

          if (error) throw error;

          return new Response(
            JSON.stringify({ success: true, data: faqs }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        // Create new FAQ
        const newFaq: FAQ = await req.json();
        
        if (!newFaq.question || !newFaq.answer) {
          throw new Error('Question and answer are required');
        }

        const { data: createdFaq, error: createError } = await supabase
          .from('faqs')
          .insert({
            question: newFaq.question,
            answer: newFaq.answer,
            category: newFaq.category || 'general',
            is_active: newFaq.is_active ?? true,
            display_order: newFaq.display_order || 0
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ success: true, data: createdFaq }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        // Update FAQ
        if (!faqId) {
          throw new Error('FAQ ID is required for update');
        }

        const updateFaq: FAQ = await req.json();

        const { data: updatedFaq, error: updateError } = await supabase
          .from('faqs')
          .update({
            question: updateFaq.question,
            answer: updateFaq.answer,
            category: updateFaq.category,
            is_active: updateFaq.is_active,
            display_order: updateFaq.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', faqId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, data: updatedFaq }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete FAQ
        if (!faqId) {
          throw new Error('FAQ ID is required for deletion');
        }

        const { error: deleteError } = await supabase
          .from('faqs')
          .delete()
          .eq('id', faqId);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, message: 'FAQ deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Method not allowed');
    }

  } catch (error) {
    console.error('Error in manage-faqs function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});