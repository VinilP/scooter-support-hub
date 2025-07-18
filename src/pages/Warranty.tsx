import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, FileText, AlertCircle, CheckCircle } from "lucide-react";

const Warranty = () => {
  const warrantyFeatures = [
    {
      title: "24-Month Battery Warranty",
      description: "Complete coverage for battery defects and performance issues",
      duration: "24 months"
    },
    {
      title: "12-Month Motor Warranty",
      description: "Full motor replacement for manufacturing defects",
      duration: "12 months"
    },
    {
      title: "6-Month Parts Warranty",
      description: "Coverage for all mechanical components and parts",
      duration: "6 months"
    }
  ];

  const coveredItems = [
    "Manufacturing defects",
    "Battery performance degradation",
    "Motor failures",
    "Electronic component failures",
    "Frame structural issues",
    "Charging system defects"
  ];

  const notCovered = [
    "Damage from accidents or misuse",
    "Normal wear and tear",
    "Water damage from submersion",
    "Unauthorized modifications",
    "Damage from extreme weather",
    "Cosmetic damages"
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
                Warranty Information
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your scooter is protected by our comprehensive warranty coverage
            </p>
          </div>

          {/* Warranty Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Warranty Coverage</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {warrantyFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Shield className="w-8 h-8 text-primary" />
                      <span className="text-lg font-bold text-primary">
                        {feature.duration}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Coverage Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  What's Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {coveredItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  What's Not Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {notCovered.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Warranty Terms */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Important Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Warranty Activation</h4>
                <p className="text-sm text-muted-foreground">
                  Warranty coverage begins from the date of purchase. Please register your scooter within 30 days to activate warranty coverage.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Claim Process</h4>
                <p className="text-sm text-muted-foreground">
                  To file a warranty claim, contact our support team with your purchase receipt and detailed description of the issue.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Repair vs Replacement</h4>
                <p className="text-sm text-muted-foreground">
                  We will determine whether to repair or replace defective parts based on the nature of the issue and part availability.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-secondary border-primary/20">
              <CardHeader>
                <CardTitle>Register Your Scooter</CardTitle>
                <CardDescription>
                  Activate your warranty coverage and receive important updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Register Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary border-primary/20">
              <CardHeader>
                <CardTitle>File a Warranty Claim</CardTitle>
                <CardDescription>
                  Need to report an issue covered under warranty?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Claim Process
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

export default Warranty;