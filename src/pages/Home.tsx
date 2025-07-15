import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ScooterProducts from "@/components/ScooterProducts";
import QuickSupport from "@/components/QuickSupport";
import OrderStatus from "@/components/OrderStatus";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ScooterProducts />
      {user && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <OrderStatus />
          </div>
        </section>
      )}
      <QuickSupport />
      <FloatingChatWidget />
    </div>
  );
};

export default Home;