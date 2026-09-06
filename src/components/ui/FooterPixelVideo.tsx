import { useEffect, useState } from "react";

export function FooterPixelVideo() {
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAutoPlay(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAutoPlay(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
      }}
    >
      <video
        src="/footer-video.mp4"
        autoPlay={shouldAutoPlay}
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-15 mix-blend-screen"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />
    </div>
  );
}
