import React, { useEffect, useRef } from 'react';

const CONFIG = {
  renderMode: "dither",
  bgMode: "solid",
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 27,
  coverage: 100,
  invert: false,
  brightness: 0,
  contrast: 115,
  tint: "#c01818",
  tintOpacity: 25,
  saturation: 100,
  grayscale: 0,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
  },
  animStyle: "pulse",
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
};

const SRC_VIDEO = "/aspen-lake-pixel-moewalls-com.mp4";

export default function RedshiftAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.src = SRC_VIDEO;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    // Play video and store ref
    video.play().catch(e => console.warn("Video autoplay failed", e));
    
    video.addEventListener("loadeddata", () => {
      videoRef.current = video;
      handleResize();
    });

    window.addEventListener('resize', handleResize);
    handleResize();

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      if (width === 0 || height === 0 || !offCtx || !videoRef.current || videoRef.current.readyState < 2) {
        if (width === 0) handleResize();
        return;
      }

      const cols = Math.floor(width / CONFIG.cellSize);
      const rows = Math.floor(height / CONFIG.cellSize);
      
      if (offCanvas.width !== cols || offCanvas.height !== rows) {
        offCanvas.width = cols;
        offCanvas.height = rows;
      }

      const vidRatio = videoRef.current.videoWidth / videoRef.current.videoHeight;
      const canvasRatio = width / height;
      let drawW = width, drawH = height, offsetX = 0, offsetY = 0;

      // CSS Cover style calculation for the background layer
      if (vidRatio > canvasRatio) {
        drawW = height * vidRatio;
        offsetX = (width - drawW) / 2;
      } else {
        drawH = width / vidRatio;
        offsetY = (height - drawH) / 2;
      }

      // Step 1: Draw the full video frame as the background
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(videoRef.current, offsetX, offsetY, drawW, drawH);

      // Draw downscaled frame to offscreen canvas for fast sampling
      let offDrawW = cols, offDrawH = rows, offOffsetX = 0, offOffsetY = 0;
      if (vidRatio > canvasRatio) {
        offDrawW = rows * vidRatio;
        offOffsetX = (cols - offDrawW) / 2;
      } else {
        offDrawH = cols / vidRatio;
        offOffsetY = (rows - offDrawH) / 2;
      }
      offCtx.drawImage(videoRef.current, offOffsetX, offOffsetY, offDrawW, offDrawH);
      const imgData = offCtx.getImageData(0, 0, cols, rows).data;

      // Pulse Animation logic
      const speedMultiplier = CONFIG.animSpeed.intensity / 100;
      const animIntensity = CONFIG.animIntensity.intensity / 100;
      const pulseTime = time * 0.002 * speedMultiplier;

      // Step 2 & 3: Grid Sampling & Halftone Dither Primitive
      ctx.fillStyle = '#050101'; // Dark/Black dot for the halftone effect

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Calculate Luminance
          let luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Contrast Adjustment
          const contrastFactor = (259 * (CONFIG.contrast + 255)) / (255 * (259 - CONFIG.contrast));
          luminance = Math.max(0, Math.min(255, contrastFactor * (luminance - 128) + 128));

          let normLum = luminance / 255;
          if (CONFIG.invert) normLum = 1 - normLum;

          // Animation Pulse (Wave across the grid)
          const wave = Math.sin(x * 0.1 + y * 0.1 + pulseTime) * 0.5 + 0.5;
          const animatedLum = Math.max(0, Math.min(1, normLum + (wave * animIntensity * 0.5 - 0.25)));

          // Halftone effect: Dark areas = large dark squares. Bright areas = small dark squares.
          const size = CONFIG.cellSize * Math.max(0, 1 - animatedLum) * (CONFIG.coverage / 100);
          
          if (size > 0.5) {
            const drawX = x * CONFIG.cellSize + (CONFIG.cellSize - size) / 2;
            const drawY = y * CONFIG.cellSize + (CONFIG.cellSize - size) / 2;
            
            // Draw the blocky primitive
            ctx.fillRect(drawX, drawY, size, size);
          }
        }
      }

      // Step 4: Color Tint Adjustment (Redshift)
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = CONFIG.tint;
      ctx.globalAlpha = CONFIG.tintOpacity / 100;
      ctx.fillRect(0, 0, width, height);

      // Step 5: Post Effects (Vignette)
      if (CONFIG.pfx.vignette.enabled) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${CONFIG.pfx.vignette.intensity / 100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block" 
      style={{ backgroundColor: '#000' }}
    />
  );
}
