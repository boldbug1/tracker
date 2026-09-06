import React, { useState } from "react";
import { useFocus } from "../../context/FocusContext";
import { FOCUS_SOUNDS } from "../../lib/sounds";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

export function FocusSounds() {
  const { audioState, setAudioState, isAudioPlaying, setIsAudioPlaying, session } = useFocus();
  const [hidePrompt, setHidePrompt] = useState(false);

  if (session.status === "complete") return null;

  if (!audioState.soundsEnabled) {
    if (hidePrompt) return null;
    return (
      <div className="flex flex-col items-center gap-3 mt-4 mb-8 text-center">
        <p className="text-[var(--foreground)] font-medium text-sm">Enhance your focus?</p>
        <p className="text-[var(--muted)] text-xs mb-2">Play a soft ambient sound while you work.</p>
        <div className="flex gap-4">
          <button
            className="text-xs px-4 py-2 rounded-full border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            onClick={() => setHidePrompt(true)}
          >
            Not now
          </button>
          <button
            className="text-xs px-4 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-medium transition-opacity"
            onClick={() => {
              setAudioState(s => ({ ...s, soundsEnabled: true }));
              setIsAudioPlaying(true);
            }}
          >
            Enable sounds
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = FOCUS_SOUNDS.findIndex(s => s.id === audioState.selectedSoundId);
  const currentSound = FOCUS_SOUNDS[currentIndex !== -1 ? currentIndex : 0];

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % FOCUS_SOUNDS.length;
    setAudioState(s => ({ ...s, selectedSoundId: FOCUS_SOUNDS[nextIndex].id }));
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + FOCUS_SOUNDS.length) % FOCUS_SOUNDS.length;
    setAudioState(s => ({ ...s, selectedSoundId: FOCUS_SOUNDS[prevIndex].id }));
  };

  const isPlaying = isAudioPlaying && session.status === "active";

  return (
    <div className="flex flex-col items-center mb-10 w-full">
      {/* Sound Label */}
      <select 
        className="bg-transparent text-sm font-medium text-[var(--foreground)] outline-none cursor-pointer appearance-none hover:opacity-80 transition-opacity mb-4 text-center"
        value={currentSound.id}
        onChange={(e) => setAudioState(s => ({ ...s, selectedSoundId: e.target.value }))}
      >
        {FOCUS_SOUNDS.map(s => (
          <option key={s.id} value={s.id} className="bg-[var(--background)] text-[var(--foreground)]">
            {s.name}
          </option>
        ))}
      </select>
      
      {/* Playback Row */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={handlePrev} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" aria-label="Previous sound">
          <SkipBack size={16} fill="currentColor" />
        </button>
        
        <button 
          onClick={() => setIsAudioPlaying(!isAudioPlaying)}
          className="text-[var(--foreground)] hover:scale-105 active:scale-95 transition-transform"
          aria-label={isAudioPlaying ? "Pause sound" : "Play sound"}
        >
          {isAudioPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        
        <button onClick={handleNext} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors" aria-label="Next sound">
          <SkipForward size={16} fill="currentColor" />
        </button>

        {/* Visualizer */}
        <div className="flex items-end justify-center gap-[3px] h-[16px] w-6 ml-2" aria-hidden="true">
          <div className={`w-[3px] bg-[var(--muted)] ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-[6px]'}`} style={{ animationDelay: '0.0s', height: isPlaying ? '100%' : '6px' }} />
          <div className={`w-[3px] bg-[var(--muted)] ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-[6px]'}`} style={{ animationDelay: '0.2s', height: isPlaying ? '100%' : '6px' }} />
          <div className={`w-[3px] bg-[var(--muted)] ${isPlaying ? 'animate-[bounce_0.8s_infinite]' : 'h-[6px]'}`} style={{ animationDelay: '0.4s', height: isPlaying ? '100%' : '6px' }} />
        </div>
      </div>
    </div>
  );
}
