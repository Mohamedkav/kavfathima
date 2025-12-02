import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import CalendarSection from "@/components/CalendarSection";
import BookingSection from "@/components/BookingSection";
import InstallButton from "@/components/InstallButton";

const Index = () => {
  return (
    <main className="min-h-screen">
      <InstallButton />
      <Navigation />
      <HeroSection />
      <div id="about">
        <AboutSection />
      </div>
      <div id="gallery">
        <GallerySection />
      </div>
      <CalendarSection />
      <BookingSection />
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="font-serif text-2xl font-bold mb-2">KAV Fathima Wedding Hall</h3>
          <p className="text-background/80 mb-4">Where your perfect day begins</p>
          <p className="text-sm text-background/60">
            © 2024 KAV Fathima Wedding Hall. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;