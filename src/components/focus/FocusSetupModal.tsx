import { useEffect, useState } from "react";
import { useFocus, FocusMode } from "../../context/FocusContext";
import { useApp } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function FocusSetupModal() {
  const { session, closeSetup, startSession } = useFocus();
  const { tasks } = useApp();

  const [mode, setMode] = useState<FocusMode>("pomodoro");
  const [durationStr, setDurationStr] = useState<string>("25");
  const [taskId, setTaskId] = useState<number | undefined>(undefined);
  const [objective, setObjective] = useState("");

  // Sync state when modal opens
  useEffect(() => {
    if (session.status === "setup") {
      setTaskId(session.taskId);
    }
  }, [session.status, session.taskId]);

  // Global listener for Cmd+Shift+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        // The open logic might need to be hoisted if we want to open it from anywhere,
        // but this component mounts when the app loads, so it can just dispatch the open event via context.
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (session.status !== "setup") return null;

  const handleStart = () => {
    const min = parseInt(durationStr, 10) || 0;
    const targetSeconds = mode === "stopwatch" ? 0 : min * 60;
    startSession({ mode, targetDuration: targetSeconds, taskId, objective });
  };

  const openTasks = tasks.filter(t => !t.completed);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-display text-[var(--foreground)] mb-6">Focus Setup</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Mode</label>
              <div className="flex bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] rounded-lg p-1">
                {(["pomodoro", "deep_work", "stopwatch"] as FocusMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      mode === m
                        ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {m === "pomodoro" ? "Pomodoro" : m === "deep_work" ? "Deep Work" : "Stopwatch"}
                  </button>
                ))}
              </div>
            </div>

            {mode !== "stopwatch" && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Duration (min)</label>
                <div className="flex gap-2 flex-wrap">
                  {["15", "25", "45", "60", "90"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDurationStr(d)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        durationStr === d
                          ? "border-[var(--accent)] text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                          : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <input
                    type="number"
                    value={durationStr}
                    onChange={(e) => setDurationStr(e.target.value)}
                    className="w-16 bg-transparent border border-[var(--card-border)] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)]"
                    placeholder="Custom"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Focus Task (Optional)</label>
              <select
                value={taskId || ""}
                onChange={(e) => setTaskId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="">-- No task --</option>
                {openTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.text}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Focus Objective (Optional)</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What are you trying to achieve?"
                className="w-full bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[color-mix(in_srgb,var(--foreground)_2%,transparent)] px-6 py-4 border-t border-[var(--card-border)] flex justify-end gap-3">
          <button
            onClick={closeSetup}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Start Focus
          </button>
        </div>
      </motion.div>
    </div>
  );
}
