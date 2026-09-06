import React from "react";
import { useFocus } from "../../context/FocusContext";
import { useApp } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize2, Square, CheckCircle, Music } from "lucide-react";
import { FOCUS_SOUNDS } from "../../lib/sounds";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function FocusMiniPlayer() {
  const { session, elapsedSeconds, remainingSeconds, isOverlayOpen, pauseSession, resumeSession, endSession, openOverlay, audioState, isAudioPlaying } = useFocus();
  const { tasks, toggleTask } = useApp();

  if (isOverlayOpen || session.status === "idle" || session.status === "setup") return null;

  const task = session.taskId ? tasks.find(t => t.id === session.taskId) : null;
  const displayTime = session.mode === "stopwatch" ? elapsedSeconds : remainingSeconds;

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger open if clicking the background, not buttons
    if ((e.target as HTMLElement).closest("button")) return;
    openOverlay();
  };

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task && !task.completed) {
      toggleTask(task.id);
    }
    endSession(true);
  };

  const handleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    endSession(true);
  };

  const modeText = session.mode === "pomodoro" ? "Pomodoro" : session.mode === "deep_work" ? "Deep Work" : "Stopwatch";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-[150] w-[280px] max-w-[calc(100vw-32px)] bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden text-left"
        onClick={handleCardClick}
        role="region"
        aria-label="Focus Mini Player"
      >
        <div className="p-4 flex flex-col gap-3 cursor-pointer">
          {session.status === "complete" ? (
            <>
              <div>
                <h3 className="text-[10px] font-mono-data tracking-wider uppercase text-[var(--accent)] mb-1">
                  Focus Complete
                </h3>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {session.objective || (task ? task.text : "Deep Work")}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')} focused
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {task && !task.completed && (
                  <button
                    onClick={handleMarkComplete}
                    className="flex-1 py-2 px-3 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]"
                    aria-label="Mark task complete"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Task Complete
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openOverlay(); }}
                    className="flex-1 py-2 px-3 rounded text-xs font-medium bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
                    aria-label="Open full focus view"
                  >
                    Open
                  </button>
                  <button
                    onClick={handleDone}
                    className="flex-1 py-2 px-3 rounded text-xs font-medium border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] transition-all flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
                    aria-label={task && !task.completed ? "Keep task open" : "Done"}
                  >
                    {task && !task.completed ? "Keep Open" : "Done"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-[10px] font-mono-data tracking-wider uppercase text-[var(--muted)] mb-1 flex items-center justify-between">
                  <span>Focus Session</span>
                  {audioState.soundsEnabled && isAudioPlaying && session.status === "active" && (
                    <span className="flex items-center gap-1 text-[var(--accent)] animate-pulse">
                      <Music size={10} />
                      {FOCUS_SOUNDS.find(s => s.id === audioState.selectedSoundId)?.name}
                    </span>
                  )}
                </h3>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {session.objective || (task ? task.text : "Focusing")}
                </p>
                <div className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-1">
                  <span>{modeText}</span>
                  {session.mode !== "stopwatch" && (
                    <>
                      <span>·</span>
                      <span>{session.targetDuration / 60} min</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-display tabular-nums tracking-tight text-[var(--foreground)]">
                    {formatTime(displayTime)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${session.status === 'active' ? 'bg-[var(--accent)] animate-pulse' : 'bg-[var(--muted)]'}`}></span>
                    <span className={session.status === 'active' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}>
                      {session.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {session.status === "active" ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); pauseSession(); }}
                    className="flex-1 py-1.5 rounded text-xs font-medium bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
                    aria-label="Pause session"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); resumeSession(); }}
                    className="flex-1 py-1.5 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    aria-label="Resume session"
                  >
                    <Play className="w-3.5 h-3.5" /> Resume
                  </button>
                )}
                
                <button
                  onClick={(e) => { e.stopPropagation(); openOverlay(); }}
                  className="flex-1 py-1.5 rounded text-xs font-medium bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
                  aria-label="Open full view"
                >
                  <Maximize2 className="w-3 h-3" /> Open
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); endSession(false); }}
                  className="flex-1 py-1.5 rounded text-xs font-medium border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]"
                  aria-label="End session"
                >
                  <Square className="w-3 h-3" /> End
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
