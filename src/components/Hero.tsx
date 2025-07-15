import { MessageCircle, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-scooter.jpg";

const Hero = () => {
  const quickActions = [
    {
      icon: MessageCircle,
      title: "Start Chat",
      description: "Get instant help from our AI assistant",
      action: "Chat Now"
    },
    {
      icon: Search,
      title: "Track Order",
      description: "Check your scooter delivery status",
      action: "Track Now"
    },
    {
      icon: Phone,
      title: "Emergency",
      description: "24/7 support for urgent issues",
      action: "Call Now"
    }
  ];

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          How can we help you today?
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
          Fast, friendly support for your electric scooter journey
        </p>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-12 animate-slide-up">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/20 transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm opacity-80 mb-4">{action.description}</p>
                </div>
                <Button variant="hero" className="w-full">
                  {action.action}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;