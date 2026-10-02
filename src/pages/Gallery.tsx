import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { GalleryImage, galleryImages } from '@/data/galleryImages';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Products', 'Lifestyle', 'Studio'];

  const filteredImages = filter === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  // Prepare items for CircularGallery
  const circularGalleryItems = galleryImages.map(img => ({
    image: img.url,
    text: img.caption
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-50/20 to-background dark:from-background dark:via-amber-950/10 dark:to-background">
      <SeoHelmet
        title="Gallery - Handmade Candle Photography - Sereniquee"
        description="Explore our visual collection showcasing the art of handmade candles. See behind-the-scenes studio shots, lifestyle imagery, and the beauty of our soy candle creations."
        keywords="candle gallery, handmade candle photos, candle photography, studio behind the scenes, luxury candle images, candle lifestyle"
        url="/gallery"
      />
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-background to-stone-100/20 dark:from-amber-950/10 dark:via-background dark:to-stone-950/20">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-luxury relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Visual Journey
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium mb-4 sm:mb-6">
              Our Gallery
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Step into our world of handcrafted candles, behind-the-scenes moments, 
              and the beauty of artisan craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* Circular Gallery Section */}
      <section className="container-luxury py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
            Interactive Gallery Experience
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Scroll or drag to explore our collection in a unique circular view
          </p>
        </div>
        <div style={{ height: '600px', position: 'relative' }} className="rounded-2xl overflow-hidden">
          <CircularGallery 
            items={circularGalleryItems}
            bend={3} 
            textColor="#000000" 
            borderRadius={0.05} 
            scrollEase={0.02}
          />
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="container-luxury py-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all ${
                filter === category
                  ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-lg scale-105'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container-luxury pb-16 sm:pb-20 md:pb-24">
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-border/50 group-hover:border-amber-500/50 transition-all duration-300">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {image.category}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center backdrop-blur-sm">
                      <Camera className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    {image.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Camera className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No images found in this category.</p>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80 mb-3">
                {selectedImage.category}
              </span>
              <p className="text-white text-base sm:text-lg">{selectedImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
