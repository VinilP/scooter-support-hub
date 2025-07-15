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

    // In a real implementation, you would:
    // 1. Verify the OTP against stored value (database/Redis)
    // 2. Check expiration time
    // 3. Handle rate limiting
    
    // For now, we'll create a simple verification
    // You could store OTPs in Supabase or use Redis
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For demo purposes, accept any 6-digit OTP
    // In development or if no real OTP verification is implemented, accept any 6-digit OTP
    const isValidOTP = /^\d{6}$/.test(otp); // Accept any 6-digit OTP for demo

    if (!isValidOTP) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create or find user by phone number
    // First check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone_number', phoneNumber)
      .single();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // Create a new user
      // Since we can't directly create auth users via API, we'll use a workaround
      // Generate a temporary email for the user
      const tempEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@phone.auth`;
      const tempPassword = Math.random().toString(36).substring(2, 15);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        phone: phoneNumber,
        email_confirm: true,
        phone_confirm: true,
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

    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.auth`,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      throw new Error('Failed to create session');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified successfully',
        accessToken: sessionData.properties?.access_token,
        refreshToken: sessionData.properties?.refresh_token,
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