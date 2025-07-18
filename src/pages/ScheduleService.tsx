import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const ScheduleService = () => {
  const [selectedService, setSelectedService] = useState("");

  const serviceTypes = [
    {
      id: "routine",
      title: "Routine Maintenance",
      description: "Regular checkup and preventive maintenance",
      duration: "1-2 hours",
      icon: CheckCircle,
      items: ["Battery health check", "Brake adjustment", "Tire inspection", "General cleaning"]
    },
    {
      id: "repair",
      title: "Repair Service",
      description: "Fix specific issues or problems",
      duration: "2-4 hours",
      icon: Wrench,
      items: ["Diagnostic check", "Part replacement", "Performance testing", "Quality assurance"]
    },
    {
      id: "emergency",
      title: "Emergency Service",
      description: "Urgent repairs for safety issues",
      duration: "Same day",
      icon: AlertTriangle,
      items: ["Priority handling", "Same-day service", "Safety inspection", "Emergency repairs"]
    }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
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
                Schedule Service
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Book professional maintenance and repair services for your scooter
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Service Type</h2>
                <div className="space-y-4">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedService === service.id 
                            ? 'ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedService === service.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{service.title}</CardTitle>
                              <CardDescription>{service.description}</CardDescription>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {service.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {selectedService === service.id && (
                          <CardContent>
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-2">Service Includes:</h4>
                              <ul className="space-y-1">
                                {service.items.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-3 h-3 text-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Book Your Service</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div>
                    <Label htmlFor="scooterModel">Scooter Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your scooter model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urban-glide">Urban Glide Pro</SelectItem>
                        <SelectItem value="city-cruiser">City Cruiser Elite</SelectItem>
                        <SelectItem value="speed-demon">Speed Demon X</SelectItem>
                        <SelectItem value="eco-rider">Eco Rider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceDate">Preferred Date</Label>
                      <Input id="serviceDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="serviceTime">Preferred Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time.toLowerCase().replace(/[:\s]/g, '')}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Service Location</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service center" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="downtown">Downtown Service Center</SelectItem>
                        <SelectItem value="north">North Side Location</SelectItem>
                        <SelectItem value="south">South Side Location</SelectItem>
                        <SelectItem value="mobile">Mobile Service (Additional fee)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Issue Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Please describe any specific issues or concerns..."
                      rows={3}
                    />
                  </div>

                  <Button className="w-full" disabled={!selectedService}>
                    {selectedService ? "Schedule Service" : "Please select a service type"}
                  </Button>
                </CardContent>
              </Card>

              {/* Service Center Info */}
              <Card className="mt-6 bg-gradient-secondary border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Service Center Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ScheduleService;