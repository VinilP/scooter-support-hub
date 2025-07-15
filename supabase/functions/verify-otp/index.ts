import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp }: VerifyOTPRequest = await req.json();

    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    // For demo purposes, accept any 6-digit OTP
    const isValidOTP = /^\d{6}$/.test(otp);

    if (!isValidOTP) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // Create a new user using phone authentication
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone: phoneNumber,
        phone_confirm: true,
        user_metadata: {
          phone_number: phoneNumber
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        throw new Error('Failed to create user account');
      }

      userId = authData.user.id;

      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          phone_number: phoneNumber,
          display_name: phoneNumber,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway as the auth user was created
      }
    }

    // Generate access tokens for the user
    // Use a simple approach - create a temporary password reset link
    const tempEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@phone.temp`;
    
    // First, update the user to have this temp email
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email: tempEmail,
      email_confirm: true
    });

    if (updateError && !updateError.message.includes('already exists')) {
      console.error('Error updating user email:', updateError);
    }

    // Generate a recovery link to get session tokens
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: tempEmail,
    });

    if (linkError) {
      console.error('Error generating recovery link:', linkError);
      throw new Error('Failed to generate session tokens');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified successfully',
        user: { id: userId, phone: phoneNumber },
        access_token: linkData.properties?.access_token,
        refresh_token: linkData.properties?.refresh_token,
        expires_at: linkData.properties?.expires_at,
        token_type: 'bearer',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});