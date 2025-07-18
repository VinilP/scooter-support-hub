import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuickSupport from "@/components/QuickSupport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail, Clock, Star, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-scooter.jpg";

const Support = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");

  const handleChatClick = () => {
    // Scroll to bottom to make chat widget visible and trigger it
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    // Small delay to let scroll complete, then trigger chat
    setTimeout(() => {
      const chatButton = document.querySelector('[data-chat-trigger]') as HTMLButtonElement;
      if (chatButton) {
        chatButton.click();
      }
    }, 500);
  };

  const supportCategories = [
    { id: "general", label: "General Support", icon: MessageSquare },
    { id: "technical", label: "Technical Issues", icon: Zap },
    { id: "billing", label: "Billing & Orders", icon: Star },
    { id: "emergency", label: "Emergency", icon: Phone },
  ];

  const quickActions = [
    { title: "Track Order", description: "Check your order status", icon: Star, href: "/order-tracking" },
    { title: "User Manual", description: "Download user guides", icon: MessageSquare, href: "/user-manual" },
    { title: "Warranty Info", description: "Learn about warranty", icon: Users, href: "/warranty" },
    { title: "Schedule Service", description: "Book maintenance", icon: Clock, href: "/schedule-service" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-glow/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Support Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    How can we help you today?
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Get instant support for your electric scooter. Our team is here to help with any questions or issues you might have.
                </p>
              </div>

              {/* Support Categories */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {supportCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedCategory === category.id 
                          ? 'ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          selectedCategory === category.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className="text-sm font-medium">{category.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Contact Options */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleChatClick}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <a href="tel:1231231231">
                      <Phone className="w-4 h-4" />
                      Call Support
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <a href="mailto:support@scootsupport.com">
                      <Mail className="w-4 h-4" />
                      Email Us
                    </a>
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Average response time: 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Hero Image */}
            <div className="space-y-8">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Electric Scooter Support"
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">24/7 Support</h3>
                  <p className="text-sm opacity-90">We're here when you need us</p>
                </div>
              </div>

              <Card className="bg-gradient-product border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common support tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link 
                        key={index}
                        to={action.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* QuickSupport Section */}
      <div className="pt-0">
        <QuickSupport />
      </div>
      
      <Footer />
    </div>
  );
};

export default Support;