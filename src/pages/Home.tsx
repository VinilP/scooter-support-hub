import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickSupport from "@/components/QuickSupport";
import FloatingChatWidget from "@/components/FloatingChatWidget";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <QuickSupport />
      <FloatingChatWidget />
    </div>
  );
};

export default Home;