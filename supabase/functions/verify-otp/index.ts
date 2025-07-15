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

    // Generate session tokens by creating a sign-in session
    // Use admin.createUser with auto-confirm to get immediate session
    let sessionData;
    
    if (existingProfile) {
      // For existing users, generate a session directly
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.temp`,
        options: {
          redirectTo: 'http://localhost:3000'
        }
      });
      
      if (error) {
        console.error('Error generating session for existing user:', error);
        throw new Error('Failed to generate session');
      }
      sessionData = data;
    } else {
      // For new users, the createUser response already contains session data
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.temp`,
        password: Math.random().toString(36).substring(2, 15),
        options: {
          redirectTo: 'http://localhost:3000'
        }
      });
      
      if (error) {
        console.error('Error generating session for new user:', error);
        throw new Error('Failed to generate session');
      }
      sessionData = data;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified successfully',
        user: { id: userId, phone: phoneNumber },
        access_token: sessionData.properties?.access_token,
        refresh_token: sessionData.properties?.refresh_token,
        expires_at: sessionData.properties?.expires_at,
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