import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  phoneNumber: string;
  isAdminRequest?: boolean;
}

const ADMIN_PHONE_NUMBER = '+919890236593';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, isAdminRequest }: SendOTPRequest = await req.json();

    if (!phoneNumber) {
      throw new Error('Phone number is required');
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

    // Create Supabase client for additional validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists and validate admin status for admin requests
    if (isAdminRequest) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (existingProfile && existingProfile.phone_number !== ADMIN_PHONE_NUMBER) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin access denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory with expiration (5 minutes)
    // In production, you'd want to use a database or Redis
    const otpData = {
      otp,
      phoneNumber,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    const message = `Your verification code is: ${otp}. Valid for 5 minutes.`;
    
    const body = new URLSearchParams({
      To: phoneNumber,
      From: '+17622390928', // You'll need to replace this with your Twilio number
      Body: message,
    });

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio error:', error);
      throw new Error(`Failed to send SMS: ${error}`);
    }

    const twilioResult = await twilioResponse.json();
    console.log('SMS sent successfully:', twilioResult.sid);

    // For demo purposes, we'll return the OTP in development
    // In production, remove this and only return success status
    const isDevelopment = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // Only include OTP in development for testing
        ...(isDevelopment && { otp })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});