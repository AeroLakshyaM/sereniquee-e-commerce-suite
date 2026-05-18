import { useEffect } from 'react';
import { Instagram, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INSTAGRAM_USERNAME = 'sereniquee.candles.co';
const INSTAGRAM_URL = 'https://www.instagram.com/sereniquee.candles.co';

export function InstagramFeed() {
  useEffect(() => {
    // Dynamically load the Elfsight script when the component mounts
    const script = document.createElement('script');
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up if the component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-card overflow-hidden border-t border-b border-border/30 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container-luxury max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50 shadow-sm">
            <Instagram className="h-4 w-4 text-pink-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Join Our Community</span>
          </div>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground !leading-tight">
              Follow us on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 italic">
                Instagram
              </span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Immerse yourself in the world of luxury fragrances. Discover our latest collections, behind-the-scenes moments, and exclusive styling inspiration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all group">
                <Instagram className="h-5 w-5 mr-2" />
                <span className="font-medium text-base">@{INSTAGRAM_USERNAME}</span>
                <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </Button>
            </a>
          </div>
        </div>

        {/* Elfsight Widget Integration Container */}
        <div className="w-full relative mt-10 md:mt-16 mx-auto px-2 min-h-[300px]">
          {/* A slight loading pulse behind the widget in case it takes a moment to load */}
          <div className="absolute inset-0 bg-secondary/20 animate-pulse rounded-2xl -z-10" />
          
          {/* The Elfsight app markup */}
          <div className="elfsight-app-44541b54-dadb-44d8-9f83-527049d9fed1" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
}
