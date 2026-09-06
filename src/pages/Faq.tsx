import FAQ from "@/components/ui/faq";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { BackgroundPixelStars } from "@/components/ui/background-pixel-stars";
import Footer from "@/components/Footer";

export default function FaqPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAIElEQVR42mIUEhJiwAbevXuHVZyJgUQwqmEUDB0AEGAADd8DEPTX6ksAAAAASUVORK5CYII=')] bg-[size:10px] text-white selection:bg-white/20 flex flex-col z-0">
      <BackgroundPixelStars />
      
      {/* Simple Header for navigation back */}
      <header className="relative z-10 shrink-0 flex h-16 items-center px-6 border-b border-[#222]/30 backdrop-blur-sm">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main FAQ Content */}
      <main className="relative z-10 flex-1 flex w-full items-start justify-center py-12 md:py-24 animate-in fade-in duration-300">
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
