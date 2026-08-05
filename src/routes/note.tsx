import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, Check, Trash2, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { countWords, formatDate, getNote, saveNote } from "@/lib/notes";

export const Route = createFileRoute("/note")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "노트 쓰기 — VOICE BOOK" },
      {
        name: "description",
        content: "마이크를 켜고 말하면 실시간으로 한 페이지에 기록됩니다. 자동 저장됩니다.",
      },
      { property: "og:title", content: "노트 쓰기 — VOICE BOOK" },
      { property: "og:description", content: "말하는 동안 받아 적는 한 페이지 음성 노트." },
    ],
  }),
  component: NoteEditor,
});

function NoteEditor() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();

  const [noteId, setNoteId] = useState<string | undefined>(id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      const existing = getNote(id);
      if (existing) {
        setTitle(existing.title);
        setBody(existing.body);
        setSavedAt(existing.updatedAt);
      }
    }
    setHydrated(true);
  }, [id]);

  const appendFinal = useCallback((text: string) => {
    if (!text) return;
    setBody((prev) => {
      const needsSpace = prev && !/\s$/.test(prev);
      return `${prev}${needsSpace ? " " : ""}${text}`;
    });
  }, []);

  const { supported, listening, interim, error, toggle, stop } = useSpeechRecognition({
    lang: "ko-KR",
    onFinal: appendFinal,
  });

  const persist = useCallback(() => {
    if (!body.trim() && !title.trim()) return;
    const note = saveNote({ id: noteId, title, body });
    setNoteId(note.id);
    setSavedAt(note.updatedAt);
    if (!noteId) navigate({ to: "/note", search: { id: note.id }, replace: true });
  }, [body, title, noteId, navigate]);

  // Autosave shortly after typing/speaking stops.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(persist, 900);
    return () => clearTimeout(t);
  }, [body, title, hydrated, persist]);

  const clear = () => {
    stop();
    setBody("");
    setTitle("");
    textareaRef.current?.focus();
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-40 sm:px-5 sm:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">today's page</p>
          <p className="text-xs text-muted-foreground">
            {savedAt ? `저장됨 · ${formatDate(savedAt)}` : "아직 저장되지 않음"}
          </p>
        </div>

        <div className="paper-sheet ink-grain mt-4 overflow-hidden rounded-2xl">
          <div className="border-b border-border/60 px-6 pt-7 pb-4 sm:px-10">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 없는 페이지"
              className="w-full bg-transparent font-serif-display text-2xl text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
            />
          </div>

          <div className="paper-ruled px-6 py-4 sm:px-10">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="마이크를 켜고 이야기해 보세요. 또는 이곳에 직접 적어도 좋습니다."
              rows={14}
              className="min-h-[45vh] w-full resize-none bg-transparent font-serif-display text-[1.05rem] leading-[2.25rem] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            {interim && (
              <p className="font-serif-display text-[1.05rem] leading-[2.25rem] text-muted-foreground/80 italic">
                {interim}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground sm:px-10">
            <span>{countWords(body)} 단어</span>
            <div className="flex items-center gap-2">
              <button
                onClick={clear}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-secondary"
              >
                <Trash2 className="size-3.5" /> 비우기
              </button>
              <button
                onClick={persist}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Check className="size-3.5" /> 저장
              </button>
            </div>
          </div>
        </div>

        {(!supported || error) && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>
              {error ??
                "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge에서 열어 보세요. 직접 타이핑은 그대로 가능합니다."}
            </span>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          기록은 이 브라우저에만 저장됩니다 ·{" "}
          <Link to="/notes" className="underline underline-offset-4 hover:text-foreground">
            보관함 보기
          </Link>
        </p>
      </div>

      {/* Mic dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-8">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {listening && (
            <div className="flex h-6 items-end gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="wave-bar w-1 rounded-full bg-accent"
                  style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          )}
          <div className="relative">
            {listening && (
              <span className="pulse-ring absolute inset-0 rounded-full bg-accent/40" />
            )}
            <button
              onClick={toggle}
              disabled={!supported}
              aria-label={listening ? "음성 인식 멈추기" : "음성 인식 시작"}
              className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105 disabled:opacity-40 data-[listening=true]:bg-accent data-[listening=true]:text-accent-foreground"
              data-listening={listening}
            >
              {listening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </button>
          </div>
          <span className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            {listening ? "듣고 있어요…" : "탭하고 말하기"}
          </span>
        </div>
      </div>
    </PageShell>
  );
}
