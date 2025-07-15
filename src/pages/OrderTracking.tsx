import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import AuthModal from "@/components/AuthModal";
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";

interface Order {
  id: string;
  order_id: string;
  model: string;
  status: string;
  order_date: string;
  delivery_eta: string | null;
  created_at: string;
}

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showAuthModal, setShowAuthModal, requireAuth, handleAuthSuccess } = useAuthProtection();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
        } else {
          setOrder(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [loading, user, setShowAuthModal]);

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-yellow-500',
          text: 'Processing',
          description: 'Your order is being prepared'
        };
      case 'shipping':
        return {
          icon: <Truck className="w-5 h-5" />,
          color: 'bg-blue-500',
          text: 'Shipping',
          description: 'Your order is on its way'
        };
      case 'delivered':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-500',
          text: 'Delivered',
          description: 'Your order has been delivered'
        };
      default:
        return {
          icon: <Package className="w-5 h-5" />,
          color: 'bg-gray-500',
          text: status,
          description: 'Order status'
        };
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 33;
      case 'shipping':
        return 66;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Please authenticate to view order details...</p>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => window.location.href = '/'}
          onSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const progressPercentage = getProgressPercentage(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Track your scooter order status</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Details */}
          <Card className="bg-gradient-product border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                <p className="text-lg font-mono text-foreground">{order.order_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Scooter Model</label>
                <p className="text-lg font-semibold text-foreground">{order.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <p className="text-foreground">{new Date(order.order_date).toLocaleDateString()}</p>
              </div>
              {order.delivery_eta && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Delivery</label>
                  <p className="text-foreground">{new Date(order.delivery_eta).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card className="bg-gradient-product border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {statusInfo.icon}
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                  {statusInfo.text}
                </Badge>
                <span className="text-muted-foreground">{statusInfo.description}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Order Timeline</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${order.status === 'processing' ? 'text-primary' : progressPercentage >= 33 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-3 h-3 rounded-full ${progressPercentage >= 33 ? 'bg-green-500' : order.status === 'processing' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                    <span className="text-sm">Order Processing</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'shipping' ? 'text-primary' : progressPercentage >= 66 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-3 h-3 rounded-full ${progressPercentage >= 66 ? 'bg-green-500' : order.status === 'shipping' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                    <span className="text-sm">In Transit</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'delivered' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="mt-6 bg-gradient-product border-border/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about your order, our support team is here to help.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;