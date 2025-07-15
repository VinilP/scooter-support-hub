import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield } from "lucide-react";

const MobileAuth = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = () => {
    if (phoneNumber) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = () => {
    // Handle OTP verification logic here
    console.log('Verifying OTP:', otp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-primary">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'Login with Mobile' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your mobile number to receive a verification code'
              : `We sent a 6-digit code to ${phoneNumber}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm">
                    +1
                  </span>
                  <Input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendOTP}
                className="w-full"
                variant="electric"
                disabled={!phoneNumber}
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              
              <Button 
                onClick={handleVerifyOTP}
                className="w-full"
                variant="electric"
                disabled={otp.length !== 6}
              >
                Verify & Login
              </Button>
              
              <Button 
                onClick={() => setStep('phone')}
                variant="outline"
                className="w-full"
              >
                Back to Mobile Number
              </Button>
            </>
          )}
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure SMS verification</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuth;