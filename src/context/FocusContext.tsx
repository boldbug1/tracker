import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useApp } from "./AppContext";
import { FOCUS_SOUNDS } from "../lib/sounds";

export type FocusMode = "pomodoro" | "deep_work" | "stopwatch";
export type FocusStatus = "idle" | "setup" | "active" | "paused" | "complete";

export interface FocusSessionState {
  status: FocusStatus;
  mode: FocusMode;
  taskId?: number;
  noteId?: number;
  objective?: string;
  targetDuration: number; // in seconds, 0 for stopwatch
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
}

export interface FocusAudioState {
  soundsEnabled: boolean;
  selectedSoundId: string;
  volume: number;
  muted: boolean;
}

const DEFAULT_SESSION: FocusSessionState = {
  status: "idle",
  mode: "pomodoro",
  targetDuration: 25 * 60,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
};

const DEFAULT_AUDIO_STATE: FocusAudioState = {
  soundsEnabled: false,
  selectedSoundId: "rain",
  volume: 0.3,
  muted: false,
};

interface FocusContextType {
  session: FocusSessionState;
  elapsedSeconds: number;
  remainingSeconds: number;
  isOverlayOpen: boolean;
  
  audioState: FocusAudioState;
  setAudioState: React.Dispatch<React.SetStateAction<FocusAudioState>>;
  isAudioPlaying: boolean;
  setIsAudioPlaying: (playing: boolean) => void;

  openSetup: (taskId?: number) => void;
  closeSetup: () => void;
  startSession: (options: { mode: FocusMode; targetDuration: number; taskId?: number; noteId?: number; objective?: string }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (completed?: boolean) => Promise<void>;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

const STORAGE_KEY = "dailys_focus_session";
const AUDIO_STORAGE_KEY = "dailys_focus_audio";

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  
  // Load initial state from localStorage if exists
  const [session, setSession] = useState<FocusSessionState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_SESSION;
  });

  const [audioState, setAudioState] = useState<FocusAudioState>(() => {
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (stored) return { ...DEFAULT_AUDIO_STATE, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_AUDIO_STATE;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioState));
  }, [audioState]);

  // Handle audio volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState.muted ? 0 : audioState.volume;
    }
  }, [audioState.volume, audioState.muted]);

  // Handle audio playback sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only actually play if the session is active, the user wants it playing, and sounds are enabled
    const shouldPlay = session.status === "active" && isAudioPlaying && audioState.soundsEnabled;

    if (shouldPlay) {
      audio.play().catch(e => {
        console.error("Autoplay failed:", e);
        // If autoplay fails, we just pause the audio state so the user can manually hit play
        setIsAudioPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [session.status, isAudioPlaying, audioState.soundsEnabled, audioState.selectedSoundId]);

  // Timer Math
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const tick = () => {
      if (session.status === "active" && session.startedAt) {
        const now = Date.now();
        const elapsed = Math.floor((now - session.startedAt - session.totalPausedMs) / 1000);
        setElapsedSeconds(elapsed);

        // Auto-complete for Pomodoro and Deep Work
        if (session.mode !== "stopwatch" && session.targetDuration > 0 && elapsed >= session.targetDuration) {
          setSession((s) => ({ ...s, status: "complete" }));
        }
      } else if (session.status === "paused" && session.startedAt && session.pausedAt) {
        // Compute static elapsed time based on when we paused
        const elapsed = Math.floor((session.pausedAt - session.startedAt - session.totalPausedMs) / 1000);
        setElapsedSeconds(elapsed);
      }
    };

    if (session.status === "active") {
      tick(); // Immediate update
      interval = setInterval(tick, 1000);
    } else {
      tick(); // One final tick to correct state when paused/complete
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.status, session.startedAt, session.pausedAt, session.totalPausedMs, session.mode, session.targetDuration]);

  // Actions
  const openSetup = useCallback((taskId?: number) => {
    if (session.status === "idle") {
      setSession((s) => ({ ...s, status: "setup", taskId }));
    } else if (session.status === "setup" && taskId !== undefined) {
      setSession((s) => ({ ...s, taskId }));
    }
  }, [session.status]);

  const closeSetup = useCallback(() => {
    if (session.status === "setup") {
      setSession(DEFAULT_SESSION);
    }
  }, [session.status]);

  const startSession = useCallback((options: { mode: FocusMode; targetDuration: number; taskId?: number; noteId?: number; objective?: string }) => {
    setSession({
      status: "active",
      mode: options.mode,
      targetDuration: options.targetDuration,
      taskId: options.taskId,
      noteId: options.noteId,
      objective: options.objective,
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
    });
    setElapsedSeconds(0);
    setIsOverlayOpen(true);
  }, []);

  const pauseSession = useCallback(() => {
    if (session.status === "active") {
      setSession((s) => ({ ...s, status: "paused", pausedAt: Date.now() }));
    }
  }, [session.status]);

  const resumeSession = useCallback(() => {
    if (session.status === "paused" && session.pausedAt) {
      const now = Date.now();
      const pauseDuration = now - session.pausedAt;
      setSession((s) => ({
        ...s,
        status: "active",
        pausedAt: null,
        totalPausedMs: s.totalPausedMs + pauseDuration,
      }));
    }
  }, [session.status, session.pausedAt]);

  const endSession = useCallback(async (completed = false) => {
    const finalElapsed = session.status === "paused" && session.pausedAt && session.startedAt
      ? Math.floor((session.pausedAt - session.startedAt - session.totalPausedMs) / 1000)
      : session.startedAt
        ? Math.floor((Date.now() - session.startedAt - session.totalPausedMs) / 1000)
        : 0;

    // Save to DB
    if (user && session.startedAt) {
      await supabase.from("focus_sessions").insert({
        user_id: user.id,
        task_id: session.taskId || null,
        note_id: session.noteId || null,
        mode: session.mode,
        started_at: new Date(session.startedAt).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: finalElapsed,
        completed: completed,
      });
    }

    setSession(DEFAULT_SESSION);
    setElapsedSeconds(0);
    setIsOverlayOpen(false);
    setIsAudioPlaying(false);
  }, [user, session]);

  const openOverlay = useCallback(() => setIsOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setIsOverlayOpen(false), []);

  const remainingSeconds = session.targetDuration > 0 ? Math.max(0, session.targetDuration - elapsedSeconds) : 0;
  
  const currentSound = FOCUS_SOUNDS.find(s => s.id === audioState.selectedSoundId) || FOCUS_SOUNDS[0];

  return (
    <FocusContext.Provider
      value={{
        session,
        elapsedSeconds,
        remainingSeconds,
        isOverlayOpen,
        audioState,
        setAudioState,
        isAudioPlaying,
        setIsAudioPlaying,
        openSetup,
        closeSetup,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        openOverlay,
        closeOverlay,
      }}
    >
      {children}
      {audioState.soundsEnabled && (
        <audio
          ref={audioRef}
          src={currentSound.src}
          loop
          preload="auto"
        />
      )}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used within FocusProvider");
  return ctx;
}
