import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-wedding-hall-new.jpg";

const HeroSection = () => {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    bookingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-accent/30 rounded-full floating-animation"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-primary/20 rounded-full floating-animation" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-accent/40 rounded-full floating-animation" style={{ animationDelay: '4s' }}></div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 fade-in-up">
          KAV Fathima
          <span className="block text-3xl md:text-4xl font-normal text-accent mt-2 stagger-1">
            Wedding Hall
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed fade-in-up stagger-2">
          Where timeless elegance meets your perfect day. Create unforgettable memories in our luxurious venue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up stagger-3">
          <Button 
            onClick={scrollToBooking}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Book Your Date
          </Button>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            View Gallery
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;