import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Placeholder images - in a real app, these would be actual gallery photos
  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1549417229-aa67cfbf6c06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Elegant bridal suite"
    },
    {
      src: "https://images.unsplash.com/photo-1511795409834-432f7d318bb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Outdoor ceremony space"
    },
    {
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Reception hall dance floor"
    }
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-up">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Gallery
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take a glimpse into the elegance and beauty that awaits you at our venue
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg cursor-pointer fade-in-up hover:shadow-2xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(image.src)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-100 text-white text-center">
                  <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">View Larger</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Gallery image"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default GallerySection;