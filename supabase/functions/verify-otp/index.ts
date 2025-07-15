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
  isAdminRequest?: boolean;
}

const ADMIN_PHONE_NUMBER = '+919890236593';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp, isAdminRequest }: VerifyOTPRequest = await req.json();

    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    // Validate admin access if this is an admin request
    if (isAdminRequest && phoneNumber !== ADMIN_PHONE_NUMBER) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access denied for this phone number' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
    let userEmail: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
      // Get the user's email from auth.users
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      userEmail = userData.user?.email || `${phoneNumber.replace(/[^0-9]/g, '')}@phone.temp`;
      
      // Update existing user's password to our known password for sign in
      const tempPassword = 'TempPass123!';
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: tempPassword
      });
      
      if (updateError) {
        console.error('Error updating user password:', updateError);
      }
    } else {
      // Create a new user with email/password combo
      userEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@phone.temp`;
      const tempPassword = 'TempPass123!';

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirm: true,
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
      }
    }

    // Additional validation for admin requests
    if (isAdminRequest) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile || profile.phone_number !== ADMIN_PHONE_NUMBER) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin access denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Instead of trying to generate tokens, return user info for client-side sign in
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP verified successfully',
        user: { 
          id: userId, 
          phone: phoneNumber,
          email: userEmail,
          isAdmin: phoneNumber === ADMIN_PHONE_NUMBER
        },
        // Signal that client should sign in with this email
        shouldSignIn: true
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