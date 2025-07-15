import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminFAQs from "./pages/AdminFAQs";
import AdminOrders from "./pages/AdminOrders";
import AdminEscalatedQueries from "./pages/AdminEscalatedQueries";
import OrderTracking from "./pages/OrderTracking";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/faqs" element={<AdminFAQs />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/escalated-queries" element={<AdminEscalatedQueries />} />
            <Route path="/support" element={<Support />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingChatWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
