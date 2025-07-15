import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/ProductCarousel";
import ScooterProducts from "@/components/ScooterProducts";
import OrderStatus from "@/components/OrderStatus";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();

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