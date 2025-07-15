import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Package, Clock, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OrderSupportChat } from "./OrderSupportChat";

interface Order {
  id: string;
  order_id: string;
  model: string;
  order_date: string;
  delivery_eta: string | null;
  status: string;
}

const OrderStatus = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-orders', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedOrder) {
    return (
      <OrderSupportChat 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
      />
    );
  }

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Order Status</h2>
        <Badge variant="outline" className="text-sm">
          {orders.length} Orders
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">You haven't placed any scooter orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{order.order_id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{order.model}</span>
                    <span className="text-sm text-muted-foreground">
                      Ordered: {formatDate(order.order_date)}
                    </span>
                  </div>
                  
                  {order.delivery_eta && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expected Delivery:</span>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(order.delivery_eta)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => setSelectedOrder(order)}
                      className="w-full"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask About This Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;