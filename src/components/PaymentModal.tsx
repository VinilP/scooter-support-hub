import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";

interface PaymentModalProps {
  scooterName: string;
  price: number;
  children: React.ReactNode;
}

const PaymentModal = ({ scooterName, price, children }: PaymentModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const { toast } = useToast();

  const handleBuyNow = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setOpen(true);
  };

  const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order ID
      const orderId = generateOrderId();
      
      // Store order in database
      if (user) {
        const { error } = await supabase
          .from('orders')
          .insert({
            order_id: orderId,
            model: scooterName,
            status: 'processing',
            user_id: user.id,
            order_date: new Date().toISOString(),
            delivery_eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          });

        if (error) {
          console.error('Error saving order:', error);
          throw new Error('Failed to save order');
        }
      }
      
      setLoading(false);
      setOpen(false);
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Your ${scooterName} has been ordered successfully. Order ID: ${orderId}`,
      });
      
      // Reset form
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });

      // Redirect to order tracking page
      setTimeout(() => {
        window.location.href = `/order-tracking/${orderId}`;
      }, 2000);
      
    } catch (error) {
      setLoading(false);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = formData.cardNumber.length >= 19 && 
                     formData.expiryDate.length >= 5 && 
                     formData.cvv.length >= 3 && 
                     formData.cardholderName.length >= 2;

  return (
    <>
      <div onClick={handleBuyNow}>
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Complete Your Purchase
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-foreground">{scooterName}</h3>
              <p className="text-2xl font-bold text-primary">${price.toLocaleString()}</p>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="pl-10"
                  />
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              disabled={!isFormValid || loading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay $${price.toLocaleString()}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default PaymentModal;