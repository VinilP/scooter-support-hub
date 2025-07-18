import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Video, Settings, Battery, Zap } from "lucide-react";

const UserManual = () => {
  const manualSections = [
    {
      title: "Getting Started",
      icon: Settings,
      description: "Initial setup and first ride",
      topics: ["Unboxing", "Assembly", "First charge", "Safety checks"]
    },
    {
      title: "Battery & Charging",
      icon: Battery,
      description: "Battery care and charging guidelines",
      topics: ["Charging cycles", "Battery maintenance", "Range optimization", "Storage tips"]
    },
    {
      title: "Performance & Safety",
      icon: Zap,
      description: "Riding tips and safety guidelines",
      topics: ["Speed modes", "Brake system", "Weather conditions", "Traffic rules"]
    }
  ];

  const downloadResources = [
    {
      title: "Complete User Manual",
      description: "Comprehensive guide covering all features",
      format: "PDF",
      size: "2.5 MB"
    },
    {
      title: "Quick Start Guide",
      description: "Essential setup steps for new users",
      format: "PDF",
      size: "850 KB"
    },
    {
      title: "Maintenance Schedule",
      description: "Recommended service intervals",
      format: "PDF",
      size: "420 KB"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                User Manual & Guides
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about your electric scooter
            </p>
          </div>

          {/* Download Resources */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Download Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {downloadResources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <FileText className="w-8 h-8 text-primary" />
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {resource.format}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{resource.size}</span>
                      <Button size="sm" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Manual Sections */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Manual Sections</h2>
            <div className="space-y-6">
              {manualSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {section.topics.map((topic, topicIndex) => (
                          <div
                            key={topicIndex}
                            className="p-3 bg-muted/50 rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                          >
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
            <Card className="bg-gradient-secondary border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 w-5 text-primary" />
                  Coming Soon
                </CardTitle>
                <CardDescription>
                  We're creating comprehensive video tutorials to help you get the most out of your scooter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled>
                  Video Library Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserManual;