import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, Battery, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CarouselProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  features: string[];
  description: string;
}

const featuredProducts: CarouselProduct[] = [
  {
    id: "1",
    name: "Vespa Elettrica",
    image: "https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6390,
    features: ["100km Range", "Premium Design", "Smart Features"],
    description: "Classic Italian design meets modern electric technology"
  },
  {
    id: "2", 
    name: "Lightning Sport",
    image: "https://images.unsplash.com/photo-1623241207542-0a29432c0d1c?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7890,
    features: ["120km Range", "Sport Mode", "Fast Charging"],
    description: "High-performance electric moped with sport styling"
  },
  {
    id: "3",
    name: "Urban Classic 125",
    image: "https://images.unsplash.com/photo-1723235102273-17d6851f918b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    price: 4999,
    features: ["85km Range", "Retro Style", "City Ready"],
    description: "Retro-styled electric moped perfect for city commuting"
  }
];

const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? featuredProducts.length - 1 : prev - 1);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    setIsAutoPlaying(false);
  };

  const currentProduct = featuredProducts[currentIndex];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/10 to-background overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Featured Collection
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover our premium electric scooters
          </p>
        </div>

        <div className="relative">
          {/* Main Carousel */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-product">
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="w-full flex-shrink-0 relative">
                  <div className="grid md:grid-cols-2 gap-8 items-center h-full p-8">
                    {/* Product Image */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-xl transform rotate-3"></div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="relative w-full h-80 object-cover rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-bold text-foreground mb-2">
                          {product.name}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {product.description}
                        </p>
                      </div>

                      {/* Features */}
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

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between pt-4">
                        <div>
                          <span className="text-3xl font-bold text-primary">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                        <Button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 hover:shadow-lg hover:shadow-primary/25">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background hover:border-primary shadow-lg"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background hover:border-primary shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          {featuredProducts.map((product, index) => (
            <Card 
              key={product.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                index === currentIndex 
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
            >
              <CardContent className="p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567627342315-ce882c9286f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                  }}
                />
                <h4 className="font-semibold text-sm text-foreground">{product.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">${product.price.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;