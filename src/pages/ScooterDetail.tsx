import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Battery, Zap, Award, Shield, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";

interface ScooterProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  features: string[];
  description: string;
  specifications: {
    range: string;
    speed: string;
    battery: string;
    weight: string;
    chargingTime: string;
    motor: string;
  };
  gallery: string[];
}

// Featured products data (matches carousel)
const featuredProducts: ScooterProduct[] = [
  {
    id: "1",
    name: "Vespa Elettrica",
    image: "https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6390,
    features: ["100km Range", "Premium Design", "Smart Features"],
    description: "Classic Italian design meets modern electric technology. The Vespa Elettrica combines the timeless elegance of the iconic Vespa with cutting-edge electric propulsion, delivering a silent, emission-free riding experience without compromising on style or performance.",
    specifications: {
      range: "100 km",
      speed: "45 km/h",
      battery: "4.2 kWh Lithium-ion",
      weight: "130 kg",
      chargingTime: "4 hours",
      motor: "4 kW Electric"
    },
    gallery: [
      "https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1623241207542-0a29432c0d1c?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1723235102273-17d6851f918b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    id: "2",
    name: "Lightning Sport",
    image: "https://images.unsplash.com/photo-1623241207542-0a29432c0d1c?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7890,
    features: ["120km Range", "Sport Mode", "Fast Charging"],
    description: "High-performance electric moped with sport styling. Built for thrill-seekers who demand speed, agility, and cutting-edge technology. Features advanced sport mode for maximum performance and ultra-fast charging for minimal downtime.",
    specifications: {
      range: "120 km",
      speed: "60 km/h",
      battery: "5.2 kWh Lithium-ion",
      weight: "145 kg",
      chargingTime: "3 hours",
      motor: "6 kW Electric"
    },
    gallery: [
      "https://images.unsplash.com/photo-1623241207542-0a29432c0d1c?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1723235102273-17d6851f918b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    id: "3",
    name: "Urban Classic 125",
    image: "https://images.unsplash.com/photo-1723235102273-17d6851f918b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4999,
    features: ["85km Range", "Retro Style", "City Ready"],
    description: "Retro-styled electric moped perfect for city commuting. Combines vintage aesthetics with modern electric technology, making it the ideal choice for urban professionals who value both style and sustainability.",
    specifications: {
      range: "85 km",
      speed: "50 km/h",
      battery: "3.5 kWh Lithium-ion",
      weight: "120 kg",
      chargingTime: "5 hours",
      motor: "3.5 kW Electric"
    },
    gallery: [
      "https://images.unsplash.com/photo-1723235102273-17d6851f918b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1623241207542-0a29432c0d1c?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  }
];

const ScooterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  const product = featuredProducts.find(p => p.id === id);

  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-muted"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-product rounded-2xl overflow-hidden">
              <img
                src={product.gallery[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={handleImageError}
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary shadow-lg shadow-primary/20' 
                      : 'border-transparent hover:border-muted'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                <Badge variant="secondary" className="px-3 py-1">
                  Free Shipping
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="grid grid-cols-1 gap-3">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {idx === 0 && <Battery className="w-5 h-5 text-primary" />}
                    {idx === 1 && <Award className="w-5 h-5 text-primary" />}
                    {idx === 2 && <Zap className="w-5 h-5 text-primary" />}
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Technical Specifications */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Battery className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Range</p>
                        <p className="font-semibold">{product.specifications.range}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Top Speed</p>
                        <p className="font-semibold">{product.specifications.speed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Battery</p>
                        <p className="font-semibold">{product.specifications.battery}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-semibold">{product.specifications.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Charging Time</p>
                        <p className="font-semibold">{product.specifications.chargingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Motor</p>
                        <p className="font-semibold">{product.specifications.motor}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Buttons */}
            <div className="space-y-4">
              <PaymentModal
                scooterName={product.name}
                price={product.price}
              >
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6 bg-gradient-primary hover:shadow-glow"
                >
                  Buy Now - ${product.price.toLocaleString()}
                </Button>
              </PaymentModal>
              <div className="flex gap-4">
                <Button variant="outline" size="lg" className="flex-1">
                  Schedule Test Ride
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  Download Brochure
                </Button>
              </div>
            </div>

            {/* Warranty Info */}
            <Card className="bg-muted/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">Warranty & Support</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 2-year comprehensive warranty</li>
                  <li>• 5-year battery warranty</li>
                  <li>• 24/7 roadside assistance</li>
                  <li>• Free first service</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ScooterDetail;