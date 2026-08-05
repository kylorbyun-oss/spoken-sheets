// Note storage layer. Swap this module for a server/db implementation later —
// the rest of the app only depends on these exported functions.

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "voicebook.notes.v1";

function canStore() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadNotes(): Note[] {
  if (!canStore()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function persist(notes: Note[]) {
  if (!canStore()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNote(id: string): Note | undefined {
  return loadNotes().find((n) => n.id === id);
}

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function deriveTitle(body: string) {
  const first = body.trim().split("\n")[0]?.trim() ?? "";
  if (!first) return "제목 없는 페이지";
  return first.length > 40 ? `${first.slice(0, 40)}…` : first;
}

export function saveNote(input: { id?: string; title?: string; body: string }): Note {
  const notes = loadNotes();
  const now = Date.now();
  const existingIndex = input.id ? notes.findIndex((n) => n.id === input.id) : -1;

  const note: Note = {
    id: input.id ?? createId(),
    title: (input.title?.trim() || deriveTitle(input.body)).slice(0, 120),
    body: input.body,
    createdAt: existingIndex >= 0 ? notes[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) notes[existingIndex] = note;
  else notes.unshift(note);

  persist(notes);
  return note;
}

export function deleteNote(id: string) {
  persist(loadNotes().filter((n) => n.id !== id));
}

export function formatDate(ts: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function countWords(body: string) {
  const t = body.trim();
  return t ? t.split(/\s+/).length : 0;
}
