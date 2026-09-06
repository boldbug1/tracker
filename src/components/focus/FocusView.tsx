import { useFocus } from "../../context/FocusContext";
import { useApp } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CircularNavigation } from "../ui/circular-navigation-bar";
import { Menu, Home, BarChart2, FileText, ListTodo, Settings, Network } from "lucide-react";
import { FocusSounds } from "./FocusSounds";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const navItems = [
  { name: "Tracker", icon: Home, href: "/dashboard" },
  { name: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
  { name: "Notes", icon: FileText, href: "/dashboard/notes" },
  { name: "Todos", icon: ListTodo, href: "/dashboard/todos" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  { name: "Graph", icon: Network, href: "/dashboard/graph" },
];

export function FocusView() {
  const { session, elapsedSeconds, remainingSeconds, isOverlayOpen, closeOverlay, pauseSession, resumeSession, endSession } = useFocus();
  const { tasks, toggleTask } = useApp();
  const [isNavOpen, setIsNavOpen] = useState(false);

  if (!isOverlayOpen || session.status === "idle" || session.status === "setup") return null;

  const task = session.taskId ? tasks.find(t => t.id === session.taskId) : null;
  const displayTime = session.mode === "stopwatch" ? elapsedSeconds : remainingSeconds;
  const progress = session.targetDuration > 0 ? elapsedSeconds / session.targetDuration : 0;
  
  // Format for completed summary
  const mFocused = Math.floor(elapsedSeconds / 60);
  const sFocused = elapsedSeconds % 60;

  const handleEnd = () => {
    // If not completed, it will save actual elapsed time
    endSession(false);
  };

  const handleMarkComplete = () => {
    if (task && !task.completed) {
      toggleTask(task.id);
    }
    endSession(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col items-center justify-center p-6"
      >
        {/* Top-right exit button */}
        <div className="absolute top-6 right-8 flex items-center gap-4 z-[150]">
          <button
            onClick={() => setIsNavOpen(true)}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none flex items-center justify-center p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
            title="Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={closeOverlay}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium focus:outline-none"
          >
            Exit View
          </button>
        </div>

        <CircularNavigation
          navItems={navItems}
          isOpen={isNavOpen}
          toggleMenu={() => setIsNavOpen(!isNavOpen)}
          onNavigate={closeOverlay}
        />

        {session.status === "complete" ? (
          <div className="max-w-md w-full text-center space-y-8">
            <div>
              <h1 className="text-3xl font-display text-[var(--foreground)] mb-2">SESSION COMPLETE</h1>
              <p className="text-[var(--accent)] text-lg">{mFocused}m {sFocused}s focused</p>
            </div>

            {task && (
              <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-left">
                <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Task</p>
                <p className="text-[var(--foreground)]">{task.text}</p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              {task && !task.completed && (
                <button
                  onClick={handleMarkComplete}
                  className="w-full py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Mark Task Complete
                </button>
              )}
              {session.mode === "pomodoro" ? (
                <button
                  onClick={() => endSession(true)}
                  className="w-full py-3 rounded-lg text-sm font-medium bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] transition-all"
                >
                  Start 5 min Break (Coming Soon) / Done
                </button>
              ) : (
                <button
                  onClick={() => endSession(true)}
                  className="w-full py-3 rounded-lg text-sm font-medium bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] transition-all"
                >
                  Keep Task Open / Done
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xl w-full flex flex-col items-center">
            {/* Title / Objective */}
            <div className="text-center mb-10 md:mb-12 px-4">
              <h2 className="text-xs font-mono-data tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Focus Session</h2>
              <p className="text-2xl md:text-3xl font-display text-[var(--foreground)] max-w-lg mx-auto leading-tight">
                {session.objective || (task ? task.text : "Deep Work")}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm" style={{ color: "var(--muted)" }}>
                <span>{session.mode === "pomodoro" ? "Pomodoro" : session.mode === "deep_work" ? "Deep Work" : "Stopwatch"}</span>
                {session.mode !== "stopwatch" && (
                  <>
                    <span>·</span>
                    <span>{session.targetDuration / 60} min</span>
                  </>
                )}
              </div>
            </div>

            {/* Timer */}
            <div className="relative flex items-center justify-center mb-8 md:mb-12 w-full max-w-sm mx-auto">
              {session.mode !== "stopwatch" ? (
                <>
                  <svg viewBox="0 0 280 280" className="-rotate-90 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px]">
                    <circle
                      cx="140" cy="140" r="132"
                      fill="none"
                      stroke="var(--card-border)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="140" cy="140" r="132"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 132}
                      strokeDashoffset={2 * Math.PI * 132 * (1 - progress)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className={`absolute text-5xl sm:text-6xl md:text-7xl font-display tabular-nums tracking-tight ${session.status === "paused" ? "opacity-50" : ""}`} style={{ color: "var(--foreground)" }}>
                    {formatTime(displayTime)}
                  </div>
                </>
              ) : (
                <div className={`text-6xl md:text-8xl font-display tabular-nums tracking-tight ${session.status === "paused" ? "opacity-50" : ""}`} style={{ color: "var(--foreground)" }}>
                  {formatTime(displayTime)}
                </div>
              )}
            </div>

            <FocusSounds />

            {/* Controls */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              {session.status === "active" ? (
                <button
                  onClick={pauseSession}
                  className="px-8 py-3 rounded-full bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] active:scale-95 transition-all text-sm font-medium"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="px-8 py-3 rounded-full bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm text-sm font-medium"
                >
                  Resume
                </button>
              )}
              
              <button
                onClick={handleEnd}
                className="px-8 py-3 rounded-full bg-transparent border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] active:scale-95 transition-all text-sm font-medium"
              >
                End
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
