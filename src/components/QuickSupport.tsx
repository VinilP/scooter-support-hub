import { MessageSquare, Upload, Zap, Battery, MapPin, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const QuickSupport = () => {
  const supportCategories = [
    {
      icon: Battery,
      title: "Battery Issues",
      description: "Charging problems, battery life, range questions",
      color: "text-green-600"
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Speed, acceleration, motor issues",
      color: "text-blue-600"
    },
    {
      icon: MapPin,
      title: "GPS & App",
      description: "Location tracking, app connectivity",
      color: "text-purple-600"
    },
    {
      icon: Wrench,
      title: "Maintenance",
      description: "Service schedules, repairs, parts",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Quick Support</h2>
        <p className="text-muted-foreground text-lg">
          Get help with common scooter issues instantly
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {supportCategories.map((category, index) => (
          <Link key={index} to="/support">
            <Card className="hover:shadow-electric transition-all duration-300 cursor-pointer group h-full">
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-secondary group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Support Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-gradient-secondary border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Ask a Question</span>
            </CardTitle>
            <CardDescription>
              Describe your issue in natural language and get instant help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="electric" 
              className="w-full"
              onClick={() => {
                // Scroll to bottom to make the floating chat widget more visible
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              Use Chat Widget Below
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-secondary border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Files</span>
            </CardTitle>
            <CardDescription>
              Share photos or videos to help us diagnose your issue faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Upload Files
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickSupport;