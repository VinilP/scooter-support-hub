import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import AuthModal from "@/components/AuthModal";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchOrderId, setSearchOrderId] = useState(orderId || "");
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { user } = useAuth();
  const { showAuthModal, setShowAuthModal, requireAuth, handleAuthSuccess } = useAuthProtection();
  const { toast } = useToast();

  // Load user's orders when authenticated
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user orders:', error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserOrders();
  }, [user]);

  // Handle direct orderId from URL
  useEffect(() => {
    if (orderId && user) {
      setSearchOrderId(orderId);
      handleSearchOrder(orderId);
    }
  }, [orderId, user]);

  const handleSearchOrder = async (orderIdToSearch?: string) => {
    const searchId = orderIdToSearch || searchOrderId;
    if (!searchId.trim()) {
      toast({
        title: "Please enter an Order ID",
        description: "Enter a valid order ID to track your order.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setSearchAttempted(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', searchId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
        toast({
          title: "Order not found",
          description: "The order ID you entered was not found or doesn't belong to your account.",
          variant: "destructive",
        });
      } else {
        setOrder(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setOrder(null);
      toast({
        title: "Error",
        description: "There was an error searching for your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated when component mounts
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user, setShowAuthModal]);

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

  const renderOrderCard = (orderData: Order) => {
    const statusInfo = getStatusInfo(orderData.status);
    const progressPercentage = getProgressPercentage(orderData.status);

    return (
      <Card key={orderData.id} className="bg-gradient-product border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Order #{orderData.order_id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Scooter Model</label>
              <p className="text-lg font-semibold text-foreground">{orderData.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Date</label>
              <p className="text-foreground">{new Date(orderData.order_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
              {statusInfo.text}
            </Badge>
            <span className="text-muted-foreground">{statusInfo.description}</span>
          </div>

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

          {orderData.delivery_eta && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimated Delivery</label>
              <p className="text-foreground">{new Date(orderData.delivery_eta).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please sign in to track your orders and view order details.
              </p>
              <Button onClick={() => setShowAuthModal(true)} className="w-full">
                Sign In to Track Orders
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Order Tracking</h1>
            <p className="text-muted-foreground">Track your scooter orders and view delivery status</p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Track a Specific Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="Enter your order ID (e.g., ORD-12345)"
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => handleSearchOrder()} disabled={loading}>
                    {loading ? "Searching..." : "Track Order"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Result */}
          {searchAttempted && order && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Search Result</h2>
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
                      {getStatusInfo(order.status).icon}
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusInfo(order.status).color} text-white px-3 py-1`}>
                        {getStatusInfo(order.status).text}
                      </Badge>
                      <span className="text-muted-foreground">{getStatusInfo(order.status).description}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{getProgressPercentage(order.status)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Order Timeline</h3>
                      <div className="space-y-3">
                        <div className={`flex items-center gap-3 ${order.status === 'processing' ? 'text-primary' : getProgressPercentage(order.status) >= 33 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-3 h-3 rounded-full ${getProgressPercentage(order.status) >= 33 ? 'bg-green-500' : order.status === 'processing' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                          <span className="text-sm">Order Processing</span>
                        </div>
                        <div className={`flex items-center gap-3 ${order.status === 'shipping' ? 'text-primary' : getProgressPercentage(order.status) >= 66 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-3 h-3 rounded-full ${getProgressPercentage(order.status) >= 66 ? 'bg-green-500' : order.status === 'shipping' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
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
            </div>
          )}

          {/* User's Orders */}
          {orders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(renderOrderCard)}
              </div>
            </div>
          )}

          {/* No Orders */}
          {orders.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any orders yet. Start shopping for your electric scooter!
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Scooters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Support */}
          <Card className="mt-8 bg-gradient-product border-border/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                If you have any questions about your order, our support team is here to help.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/support'}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;