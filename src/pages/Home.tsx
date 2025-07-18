import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/ProductCarousel";
import ScooterProducts from "@/components/ScooterProducts";
import OrderStatus from "@/components/OrderStatus";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/orders");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <ProductCarousel />
      <ScooterProducts />
      {user && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <OrderStatus />
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
};

export default Home;