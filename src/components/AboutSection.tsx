import { Card, CardContent } from "@/components/ui/card";
import { Users, Music, Utensils, Camera, Heart, Star } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Users,
      title: "Capacity",
      description: "Up to 300 guests in our grand ballroom"
    },
    {
      icon: Music,
      title: "Entertainment",
      description: "State-of-the-art sound and lighting systems"
    },
    {
      icon: Utensils,
      title: "Catering",
      description: "Exquisite cuisine from our award-winning chefs"
    },
    {
      icon: Camera,
      title: "Photography",
      description: "Stunning backdrops for unforgettable photos"
    },
    {
      icon: Heart,
      title: "Service",
      description: "Dedicated wedding coordinator for your special day"
    },
    {
      icon: Star,
      title: "Luxury",
      description: "Premium amenities and elegant décor"
    }
  ];

  return (
    <section className="py-20 px-4 hero-gradient">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-up">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your Dream Venue Awaits
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            KAV Fathima Wedding Hall combines timeless sophistication with modern luxury. 
            Our stunning venue offers everything you need to create the perfect wedding celebration.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-up border-border/50 bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rose-gold-gradient rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Venue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center fade-in-up">
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">300+</div>
            <div className="text-muted-foreground">Guest Capacity</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
            <div className="text-muted-foreground">Happy Couples</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">15+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">5★</div>
            <div className="text-muted-foreground">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;