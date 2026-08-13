import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";
import {
  countWords,
  deleteNote,
  formatDate,
  loadNotes,
  UNTITLED_LABEL,
  type Note,
} from "@/lib/notes";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "보관함 — VOICE BOOK" },
      {
        name: "description",
        content: "말로 남긴 한 페이지들이 모이는 조용한 보관함. 언제든 다시 펼쳐 읽고 이어 쓰세요.",
      },
      { property: "og:title", content: "보관함 — VOICE BOOK" },
      { property: "og:description", content: "말로 남긴 한 페이지들이 모이는 조용한 보관함." },
    ],
  }),
  component: SavedNotes,
});

function SavedNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNotes(loadNotes());
    setReady(true);
  }, []);

  const remove = (id: string) => {
    deleteNote(id);
    setNotes(loadNotes());
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-5 pt-10 pb-24 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">archive</p>
            <h1 className="mt-3 font-serif-display text-3xl sm:text-4xl">보관함</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {ready ? `${notes.length}장의 페이지가 여기에 머물고 있습니다.` : "페이지를 펼치는 중…"}
            </p>
          </div>
          <Link
            to="/" search={{}}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Mic className="size-4" /> 새 페이지
          </Link>
        </div>

        {ready && notes.length === 0 && (
          <div className="paper-sheet mt-10 rounded-2xl px-8 py-16 text-center">
            <p className="font-serif-display text-xl text-foreground/90">아직 페이지가 없습니다.</p>
            <p className="mt-3 text-sm text-muted-foreground">
              첫 문장은 완성되지 않아도 괜찮습니다.
            </p>
            <Link
              to="/" search={{}}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              <Mic className="size-4" /> 떠오르는 대로 남기기
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {notes.map((note) => (
            <article
              key={note.id}
              className="paper-sheet ink-grain group relative overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
            >
              <Link to="/" search={{ id: note.id }} className="block px-6 py-6">
                <h2 className="font-serif-display text-xl leading-snug text-foreground">
                  {note.title || UNTITLED_LABEL}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {note.body || "여기에 생각이 머물렀어요."}
                </p>
                <p className="mt-5 text-xs text-muted-foreground/80">
                  {formatDate(note.updatedAt)} · {countWords(note.body)} 마디
                </p>
              </Link>
              <button
                onClick={() => remove(note.id)}
                aria-label="페이지 삭제"
                className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary focus-visible:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
