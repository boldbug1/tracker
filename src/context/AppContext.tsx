import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase, checkDbReady } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type Priority = "high" | "medium" | "low";
export type TaskCategory = "work" | "personal" | "health" | "focus";
export type NoteCategory = "work" | "personal" | "ideas" | "journal";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  time?: string;
  createdAt: string;
  linkedNoteId?: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  linkedTaskId?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string;
}

interface AppContextType {
  tasks: Task[];
  notes: Note[];
  user: User | null;
  loading: boolean;
  dbReady: boolean;
  // task ops
  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  // note ops
  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: number, updates: Partial<Pick<Note, "title" | "content" | "category" | "pinned">>) => void;
  deleteNote: (id: number) => void;
  // linked
  createLinked: (task: Omit<Task, "id" | "createdAt" | "linkedNoteId">, noteTitle: string) => { taskId: number; noteId: number };
  linkTaskToNote: (taskId: number, noteId: number) => void;
  // auth
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  // profile
  updateProfile: (updates: { name?: string; bio?: string }) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

// ── DB row ↔ frontend type mappers ────────────────────────────

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    text: row.text as string,
    completed: row.completed as boolean,
    priority: row.priority as Priority,
    category: row.category as TaskCategory,
    time: (row.time as string | null) ?? undefined,
    createdAt: row.created_at as string,
    linkedNoteId: (row.linked_note_id as number | null) ?? undefined,
  };
}

function mapNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as number,
    title: row.title as string,
    content: row.content as string,
    category: row.category as NoteCategory,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    pinned: row.pinned as boolean,
    linkedTaskId: (row.linked_task_id as number | null) ?? undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  const loadUserData = useCallback(async (session: Session) => {
    const authUser = session.user;

    const [profileRes, tasksRes, notesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", authUser.id).single(),
      supabase.from("tasks").select("*").eq("user_id", authUser.id).order("created_at", { ascending: true }),
      supabase.from("notes").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
    ]);

    const profile = profileRes.data;
    setUser({
      id: authUser.id,
      name: profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
      email: authUser.email ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      bio: profile?.bio ?? "",
    });

    setTasks(tasksRes.data ? tasksRes.data.map(mapTask) : []);
    setNotes(notesRes.data ? notesRes.data.map(mapNote) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkDbReady().then(setDbReady);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        loadUserData(session).catch(console.error);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setTasks([]);
        setNotes([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── Auth ──────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, name: string): Promise<{ error?: string; needsVerification?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) return { needsVerification: true };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ── Profile ───────────────────────────────────────────────────

  const updateProfile = async (updates: { name?: string; bio?: string }): Promise<{ error?: string }> => {
    if (!user) return { error: "Not logged in" };
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return { error: error.message };
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
    return {};
  };

  const uploadAvatar = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user) return { error: "Not logged in" };
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (upErr) return { error: upErr.message };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl + `?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", user.id);
    setUser((prev) => prev ? { ...prev, avatarUrl: url } : prev);
    return { url };
  };

  // ── Tasks (optimistic + DB sync) ──────────────────────────────

  const addTask = (t: Omit<Task, "id" | "createdAt">) => {
    if (!user) return;
    const id = Date.now();
    const now = new Date().toISOString();
    const newTask: Task = { ...t, id, createdAt: now };
    setTasks((prev) => [...prev, newTask]);
    supabase.from("tasks").insert({
      id,
      user_id: user.id,
      text: t.text,
      completed: t.completed,
      priority: t.priority,
      category: t.category,
      time: t.time ?? null,
      linked_note_id: t.linkedNoteId ?? null,
      created_at: now,
    }).then(({ error }) => { if (error) console.error("addTask sync:", error.message); });
  };

  const toggleTask = (id: number) => {
    let newVal = false;
    setTasks((prev) => prev.map((t) => {
      if (t.id === id) { newVal = !t.completed; return { ...t, completed: newVal }; }
      return t;
    }));
    supabase.from("tasks").update({ completed: newVal }).eq("id", id)
      .then(({ error }) => { if (error) console.error("toggleTask sync:", error.message); });
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabase.from("tasks").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("deleteTask sync:", error.message); });
  };

  // ── Notes (optimistic + DB sync) ─────────────────────────────

  const addNote = (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    const id = Date.now();
    const now = new Date().toISOString();
    const newNote: Note = { ...n, id, createdAt: now, updatedAt: now };
    setNotes((prev) => [newNote, ...prev]);
    supabase.from("notes").insert({
      id,
      user_id: user.id,
      title: n.title,
      content: n.content,
      category: n.category,
      pinned: n.pinned,
      linked_task_id: n.linkedTaskId ?? null,
      created_at: now,
      updated_at: now,
    }).then(({ error }) => { if (error) console.error("addNote sync:", error.message); });
  };

  const updateNote = (id: number, updates: Partial<Pick<Note, "title" | "content" | "category" | "pinned">>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );
    supabase.from("notes").update({ ...updates, updated_at: now }).eq("id", id)
      .then(({ error }) => { if (error) console.error("updateNote sync:", error.message); });
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    supabase.from("notes").delete().eq("id", id)
      .then(({ error }) => { if (error) console.error("deleteNote sync:", error.message); });
  };

  const createLinked = (taskBase: Omit<Task, "id" | "createdAt" | "linkedNoteId">, noteTitle: string) => {
    if (!user) return { taskId: 0, noteId: 0 };
    const now = new Date().toISOString();
    const noteId = Date.now();
    const taskId = noteId + 1;
    const newNote: Note = {
      id: noteId,
      title: noteTitle,
      content: `Notes for task: ${taskBase.text}\n\n`,
      category: (taskBase.category === "health" ? "personal" : taskBase.category) as NoteCategory,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      linkedTaskId: taskId,
    };
    const newTask: Task = { ...taskBase, id: taskId, createdAt: now, linkedNoteId: noteId };
    setNotes((prev) => [newNote, ...prev]);
    setTasks((prev) => [...prev, newTask]);
    supabase.from("notes").insert({
      id: noteId, user_id: user.id, title: newNote.title, content: newNote.content,
      category: newNote.category, pinned: false, linked_task_id: taskId,
      created_at: now, updated_at: now,
    }).then(({ error }) => { if (error) console.error("createLinked note sync:", error.message); });
    supabase.from("tasks").insert({
      id: taskId, user_id: user.id, text: taskBase.text, completed: taskBase.completed,
      priority: taskBase.priority, category: taskBase.category, time: taskBase.time ?? null,
      linked_note_id: noteId, created_at: now,
    }).then(({ error }) => { if (error) console.error("createLinked task sync:", error.message); });
    return { taskId, noteId };
  };

  const linkTaskToNote = (taskId: number, noteId: number) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, linkedNoteId: noteId } : t)));
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, linkedTaskId: taskId } : n)));
    supabase.from("tasks").update({ linked_note_id: noteId }).eq("id", taskId)
      .then(({ error }) => { if (error) console.error("linkTaskToNote task sync:", error.message); });
    supabase.from("notes").update({ linked_task_id: taskId }).eq("id", noteId)
      .then(({ error }) => { if (error) console.error("linkTaskToNote note sync:", error.message); });
  };

  return (
    <AppContext.Provider value={{
      tasks, notes, user, loading, dbReady,
      addTask, toggleTask, deleteTask,
      addNote, updateNote, deleteNote,
      createLinked, linkTaskToNote,
      login, signup, logout,
      updateProfile, uploadAvatar,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
