import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import CountryCodeSelector, { countries, type Country } from "./CountryCodeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MobileAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(country => country.code === 'IN') || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Check if this is an admin request (detect admin-related routes)
  const isAdminRequest = window.location.pathname.includes('/admin') || 
                        window.location.search.includes('admin=true') ||
                        phoneNumber === '9890236593';

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dial}${phoneNumber}`;
      
      const response = await fetch('https://hzkhillrqgssivrnufhg.supabase.co/functions/v1/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6a2hpbGxycWdzc2l2cm51ZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTQxMjIsImV4cCI6MjA2ODEzMDEyMn0.YwGn4Ne8qB6XEO7N4f9GEm0wu6zlcAjpid9z-DfepeY`,
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          isAdminRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setStep('otp');
      setCountdown(30);
      
      // Show appropriate message based on SMS delivery status
      if (data.smsSuccessful) {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${fullPhoneNumber}`,
        });
      } else {
        toast({
          title: "Demo Mode",
          description: "Enter any 6-digit code to continue (unverified number)",
          variant: "default",
        });
      }

      // For development, show the OTP in console
      if (data.otp) {
        console.log('Development OTP:', data.otp);
        toast({
          title: "Development Mode",
          description: `OTP: ${data.otp} (check console)`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dial}${phoneNumber}`;
      
      const response = await fetch('https://hzkhillrqgssivrnufhg.supabase.co/functions/v1/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6a2hpbGxycWdzc2l2cm51ZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTQxMjIsImV4cCI6MjA2ODEzMDEyMn0.YwGn4Ne8qB6XEO7N4f9GEm0wu6zlcAjpid9z-DfepeY`,
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          otp: otpValue,
          isAdminRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Handle the verification response
      console.log('OTP verification response:', data);
      
      if (data.shouldSignIn && data.user?.email) {
        console.log('Attempting to sign in with email:', data.user.email);
        
        // Simple approach: try to sign in with a known password
        const tempPassword = 'TempPass123!';
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.user.email,
          password: tempPassword
        });

        if (signInError) {
          console.error('Sign in failed, will try with admin update:', signInError);
          
          // If sign-in fails, it means we need to update the user's password
          // Since we can't do admin operations from client, let's try a different approach
          throw new Error('Authentication setup incomplete. Please contact support.');
        }
        
        console.log('Sign in successful:', signInData.user?.id);
      }

      setStep('success');
      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      });
      
      // Wait for auth state to update before redirecting
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dial}${phoneNumber}`;
      
      const response = await fetch('https://hzkhillrqgssivrnufhg.supabase.co/functions/v1/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6a2hpbGxycWdzc2l2cm51ZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTQxMjIsImV4cCI6MjA2ODEzMDEyMn0.YwGn4Ne8qB6XEO7N4f9GEm0wu6zlcAjpid9z-DfepeY`,
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          isAdminRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setCountdown(30);
      toast({
        title: "OTP Resent",
        description: `Verification code sent to ${fullPhoneNumber}`,
      });

      // For development, show the OTP in console
      if (data.otp) {
        console.log('Development OTP:', data.otp);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 6;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-secondary">
      <Card className="w-full max-w-md shadow-electric">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary animate-glow-pulse">
            {step === 'success' ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <Smartphone className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' && 'Login with Mobile'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'success' && 'Welcome Back!'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' && 'Enter your mobile number to receive a verification code'}
            {step === 'otp' && `We sent a 6-digit code to ${selectedCountry.dial}${phoneNumber}`}
            {step === 'success' && 'Login successful! Redirecting to dashboard...'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="flex">
                  <CountryCodeSelector
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    disabled={isLoading}
                  />
                  <Input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendOTP}
                className="w-full"
                variant="electric"
                disabled={!phoneNumber || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-4">
                <label className="text-sm font-medium text-center block">Verification Code</label>
                
                {/* OTP Input Grid */}
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleVerifyOTP}
                className="w-full"
                variant="electric"
                disabled={!isOtpComplete || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {countdown}s
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-primary"
                  >
                    Resend Code
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={() => setStep('phone')}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Mobile Number
              </Button>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="animate-fade-in">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Login Successful!</p>
                <p className="text-muted-foreground">You'll be redirected shortly...</p>
              </div>
            </div>
          )}
          
          {step !== 'success' && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure SMS verification</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuth;