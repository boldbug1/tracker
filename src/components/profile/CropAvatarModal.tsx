import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '../../lib/cropImage';

interface CropAvatarModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedFile: File) => void;
  fileName: string;
}

export function CropAvatarModal({ imageSrc, onClose, onSave, fileName }: CropAvatarModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      if (croppedBlob) {
        const ext = fileName.split('.').pop() || 'jpg';
        const file = new File([croppedBlob], `avatar.${ext}`, { type: croppedBlob.type });
        onSave(file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="font-medium text-[var(--foreground)]">Adjust Profile Picture</h2>
          <button 
            onClick={onClose} 
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full h-[300px] sm:h-[400px] bg-black/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={1}
            maxZoom={3}
          />
        </div>

        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setZoom(z => Math.max(1, z - 0.25))}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ZoomOut size={20} />
            </button>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--card-border)] rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--foreground)] [&::-webkit-slider-thumb]:rounded-full"
            />
            <button 
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-full border border-[var(--card-border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isProcessing ? 'Saving...' : 'Save & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
