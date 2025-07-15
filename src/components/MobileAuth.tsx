import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

const MobileAuth = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (phoneNumber) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      setStep('otp');
      setCountdown(30); // 30 second countdown for resend
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
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      setStep('success');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCountdown(30);
    setOtp(['', '', '', '', '', '']);
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
            {step === 'otp' && `We sent a 6-digit code to ${phoneNumber}`}
            {step === 'success' && 'Login successful! Redirecting to dashboard...'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm">
                    +1
                  </span>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
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