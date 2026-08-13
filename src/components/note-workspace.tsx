import { Link } from "@tanstack/react-router";
import { AlertCircle, BookOpen, Check, ChevronLeft, ChevronRight, Feather, Mic, MicOff, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { ToolHomeButton } from "@/components/page-shell";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { adjacentNoteId, countWords, formatDate, getNote, saveNote } from "@/lib/notes";

export type NoteWorkspaceProps = {
  /** Existing note to continue writing, if any. */
  noteId?: string | undefined;
  /** Called when a brand new note gets its id, so the host can sync the URL. */
  onNoteCreated?: (id: string) => void;
  /** Keeps the URL aligned when swiping between saved and blank pages. */
  onPageChange?: (id: string | undefined) => void;
  /** The notebook is still closed — its cover lies over the spread. */
  covered?: boolean;
  /** The cover is currently swinging open. */
  opening?: boolean;
  /** Asked to open the notebook. */
  onOpen?: () => void;
};

/**
 * The open notebook spread: left control panel + the writing pages.
 * Kept as a component so it can live inside any route without a page switch.
 */
export function NoteWorkspace({
  noteId: initialId,
  onNoteCreated,
  onPageChange,
  covered = false,
  opening = false,
  onOpen,
}: NoteWorkspaceProps) {
  const [noteId, setNoteId] = useState<string | undefined>(initialId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [turning, setTurning] = useState<"older" | "newer" | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    startedAt: number;
    axis: "horizontal" | "vertical" | null;
  } | null>(null);
  const suppressAutosaveRef = useRef(false);

  useEffect(() => {
    setNoteId(initialId);
    if (initialId) {
      const existing = getNote(initialId);
      if (existing) {
        setTitle(existing.title);
        setBody(existing.body);
        setSavedAt(existing.updatedAt);
      }
    } else {
      setTitle("");
      setBody("");
      setSavedAt(null);
    }
    setHydrated(true);
  }, [initialId]);

  // Spoken thoughts land on their own line, so the page fills up line by line.
  const [writtenFrom, setWrittenFrom] = useState(Number.MAX_SAFE_INTEGER);
  const appendFinal = useCallback((text: string) => {
    const line = text.trim();
    if (!line) return;
    setBody((prev) => {
      const lines = prev ? prev.split("\n") : [];
      setWrittenFrom(lines.length);
      return prev ? `${prev.replace(/\s+$/, "")}\n${line}` : line;
    });
  }, []);

  const { supported, listening, interim, error, toggle, stop } = useSpeechRecognition({
    lang: "ko-KR",
    onFinal: appendFinal,
  });

  const persist = useCallback(() => {
    if (!body.trim() && !title.trim()) return;
    const note = saveNote({ ...(noteId ? { id: noteId } : {}), title, body });
    setNoteId(note.id);
    setSavedAt(note.updatedAt);
    if (!noteId) onNoteCreated?.(note.id);
  }, [body, title, noteId, onNoteCreated]);

  // Autosave shortly after typing/speaking stops.
  useEffect(() => {
    if (!hydrated) return;
    if (suppressAutosaveRef.current) {
      suppressAutosaveRef.current = false;
      return;
    }
    const t = setTimeout(persist, 900);
    return () => clearTimeout(t);
  }, [body, title, hydrated, persist]);

  const clear = () => {
    stop();
    setBody("");
    setTitle("");
    textareaRef.current?.focus();
  };

  const canGoOlder = Boolean(adjacentNoteId(noteId, "older"));
  const canGoNewer = Boolean(adjacentNoteId(noteId, "newer"));
  const canOpenNewer = canGoNewer || Boolean(noteId || title.trim() || body.trim());

  const saveCurrentPage = () => {
    if (!body.trim() && !title.trim()) return;
    saveNote({ ...(noteId ? { id: noteId } : {}), title, body });
  };

  const turnPage = (direction: "older" | "newer") => {
    if (turning) return;
    const nextId = adjacentNoteId(noteId, direction);
    if (!nextId) return;
    const nextNote = getNote(nextId);
    if (!nextNote) return;
    stop();
    saveCurrentPage();
    suppressAutosaveRef.current = true;
    setTurning(direction);
    window.setTimeout(() => {
      setNoteId(nextNote.id);
      setTitle(nextNote.title);
      setBody(nextNote.body);
      setSavedAt(nextNote.updatedAt);
      setTurning(null);
      onPageChange?.(nextNote.id);
    }, 360);
  };

  const openNewPage = () => {
    if (turning || (!noteId && !title.trim() && !body.trim())) return;
    stop();
    saveCurrentPage();
    suppressAutosaveRef.current = true;
    setTurning("newer");
    window.setTimeout(() => {
      setNoteId(undefined);
      setTitle("");
      setBody("");
      setSavedAt(null);
      setTurning(null);
      onPageChange?.(undefined);
    }, 360);
  };

  const goNewerOrOpen = () => {
    if (canGoNewer) turnPage("newer");
    else openNewPage();
  };

  const returnToToday = () => {
    if (!noteId) return;
    openNewPage();
  };

  const resetSwipe = () => {
    swipeRef.current = null;
    setSwiping(false);
    setSwipeOffset(0);
  };

  const handleSwipeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (covered || opening || turning) return;
    const target = event.target as HTMLElement;
    if (event.pointerType === "mouse" && target.closest("input, textarea, button, a")) return;
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startedAt: performance.now(),
      axis: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSwipeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = swipeRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    gesture.lastX = event.clientX;

    if (!gesture.axis && Math.hypot(dx, dy) >= 10) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "horizontal" : "vertical";
      if (gesture.axis === "horizontal") setSwiping(true);
    }
    if (gesture.axis !== "horizontal") return;

    event.preventDefault();
    const directionAvailable = dx > 0 ? canGoOlder : canOpenNewer;
    const resisted = directionAvailable ? dx : dx * 0.16;
    const limit = Math.min(bookRef.current?.clientWidth ?? 720, 720) * 0.42;
    setSwipeOffset(Math.max(-limit, Math.min(limit, resisted)));
  };

  const handleSwipeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = swipeRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = gesture.lastX - gesture.startX;
    const elapsed = Math.max(performance.now() - gesture.startedAt, 1);
    const width = bookRef.current?.clientWidth ?? 720;
    const crossedDistance = Math.abs(dx) >= Math.min(96, width * 0.16);
    const crossedVelocity = Math.abs(dx) / elapsed >= 0.55 && Math.abs(dx) >= 42;
    const shouldTurn = gesture.axis === "horizontal" && (crossedDistance || crossedVelocity);

    resetSwipe();
    if (!shouldTurn) return;
    if (dx > 0 && canGoOlder) turnPage("older");
    if (dx < 0 && canOpenNewer) goNewerOrOpen();
  };

  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
        new Date(),
      ),
    );
  }, []);

  return (
    <div className="desk-surface min-h-screen">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-10 px-5 py-10 lg:flex-row lg:gap-14 lg:px-10 lg:py-16">
        {/* ── Left control panel ───────────────────────── */}
        <aside className="w-full shrink-0 lg:w-[268px]">
          <div className="lg:sticky lg:top-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-serif-display text-[0.95rem] tracking-[0.34em] text-foreground/75">
                VOICE BOOK
              </span>
              <ToolHomeButton />
            </div>


            <h1 className="mt-7 font-serif-display text-2xl text-foreground">
              오늘의 <span className="marker-highlight">한 페이지</span>
            </h1>
            <p className="hand mt-1 text-lg leading-tight text-muted-foreground">
              말하면, 종이에 그대로 남습니다.
            </p>

            {/* Mic */}
            <button
              onClick={toggle}
              disabled={!supported}
              aria-label={listening ? "음성 인식 멈추기" : "음성 인식 시작"}
              className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-5 py-4 text-accent-foreground shadow-[var(--shadow-page)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              <span className="font-serif-display text-base">
                {listening ? "듣는 중…" : "말하기 시작"}
              </span>
            </button>

            <div className="mt-5 flex h-6 items-end justify-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full bg-accent transition-opacity ${
                    listening ? "wave-bar" : "opacity-25"
                  }`}
                  style={{ height: listening ? "100%" : "35%", animationDelay: `${i * 0.09}s` }}
                />
              ))}
            </div>

            {/* Quiet meta */}
            <dl className="mt-9 space-y-3 border-t border-border/70 pt-6 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">오늘</dt>
                <dd className="hand text-lg text-foreground">{today || "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">적은 마디</dt>
                <dd className="hand text-lg text-foreground">{countWords(body)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">기록</dt>
                <dd className="text-right text-xs text-muted-foreground">
                  {savedAt ? `남겨둠 · ${formatDate(savedAt)}` : "아직 남기지 않음"}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-2 border-t border-border/70 pt-6">
              <button
                onClick={persist}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Check className="size-4" /> 이 페이지 남기기
              </button>
              <button
                onClick={clear}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Trash2 className="size-4" /> 페이지 비우기
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => turnPage("older")}
                  disabled={!canGoOlder || Boolean(turning)}
                  className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="size-4" /> 지난 페이지
                </button>
                <button
                  onClick={goNewerOrOpen}
                  disabled={!canOpenNewer || Boolean(turning)}
                  className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {canGoNewer ? "다음 페이지" : "새 페이지"} <ChevronRight className="size-4" />
                </button>
              </div>
              {noteId && (
                <button
                  onClick={returnToToday}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <RotateCcw className="size-3.5" /> 오늘의 페이지
                </button>
              )}
              <Link
                to="/notes"
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary"
              >
                <BookOpen className="size-3.5" /> 전체 페이지 보기
              </Link>
            </div>

            {(!supported || error) && (
              <div className="mt-7 flex items-start gap-2 rounded-xl border border-border/70 bg-card/70 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <span>
                  {error ??
                    "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge에서 열어 보세요. 직접 타이핑은 그대로 가능합니다."}
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* ── The notebook on the desk ─────────────────── */}
        <section className="min-w-0 flex-1">
          <div className="book-scene relative mx-auto max-w-[980px]">
            {covered && (
              <div
                className={`book-cover absolute inset-0 z-30 flex flex-col rounded-[1.1rem] px-7 py-10 sm:px-14 sm:py-14 ${
                  opening ? "book-cover-open" : ""
                }`}
              >
                <p className="font-serif-display text-[0.7rem] tracking-[0.42em] text-industrial-yellow">
                  VOICE BOOK
                </p>

                <div className="flex flex-1 flex-col items-start justify-center py-8">
                  <h2 className="text-balance-tight font-serif-display text-[1.9rem] leading-[2.9rem] text-steel-foreground sm:text-[2.8rem] sm:leading-[4rem]">
                    생각을 한 장의
                    <br />
                    페이지로 남긴다.
                  </h2>
                  <span className="mt-6 block h-px w-16 bg-industrial-yellow" />
                  <p className="mt-5 min-h-5 font-serif-display text-sm tracking-[0.16em] text-steel-foreground/60">
                    {today}
                  </p>
                </div>

                <button
                  onClick={onOpen}
                  className="self-start rounded-full border border-industrial-yellow/60 px-5 py-2.5 font-serif-display text-base text-steel-foreground transition-colors hover:border-industrial-yellow hover:bg-industrial-yellow/15 sm:text-lg"
                >
                  {opening ? "펼치는 중…" : "📖 빈 페이지 펼치기"}{" "}
                  <span aria-hidden="true">→</span>
                </button>

              </div>
            )}

            <div
              ref={bookRef}
              className={`book-body relative ${turning ? "page-turn-" + turning : ""} ${swiping ? "swipe-dragging" : ""}`}
              style={{
                "--swipe-x": `${swipeOffset}px`,
                "--swipe-tilt": `${Math.max(-5, Math.min(5, swipeOffset / 70))}deg`,
              } as CSSProperties}
              onPointerDown={handleSwipeStart}
              onPointerMove={handleSwipeMove}
              onPointerUp={handleSwipeEnd}
              onPointerCancel={resetSwipe}
              aria-label="노트 페이지. 왼쪽으로 밀면 다음 또는 새 페이지, 오른쪽으로 밀면 지난 페이지가 열립니다."
            >
            {/* ribbon */}
            <span className="ribbon-tail absolute -bottom-9 left-[46%] hidden h-12 w-6 rounded-b-sm lg:block" />

            <div className="book-paper ink-grain relative overflow-hidden">
              {/* center gutter */}
              <span className="book-gutter pointer-events-none absolute inset-y-0 left-1/2 hidden w-16 -translate-x-1/2 lg:block" />

              <div className="grid lg:grid-cols-2">
                {/* Left page — heading + writing */}
                <div className="paper-margin relative px-7 pt-9 pb-8 sm:px-12 lg:pr-10">
                  <div className="flex items-baseline justify-between gap-4 pl-6 sm:pl-10">
                    <span className="hand text-lg text-accent-foreground/60">012</span>
                    <span className="hand text-lg text-muted-foreground">Date. {today}</span>
                  </div>

                  <div className="mt-4 pl-6 sm:pl-10">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목 없음"
                      aria-label="제목 (선택)"
                      className="hand w-full bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-4xl"
                    />
                    <span className="mt-2 block h-px w-full bg-border/80" />
                  </div>

                  <div className="paper-ruled mt-5 pl-6 sm:pl-10">
                    {listening ? (
                      <div
                        onClick={stop}
                        className="hand min-h-[46vh] w-full text-[1.4rem] leading-[2.25rem] text-foreground lg:min-h-[52vh]"
                      >
                        {body ? (
                          body.split("\n").map((line, i) => (
                            <p key={i} className={i >= writtenFrom ? "ink-line-instant" : undefined}>
                              {line || "\u00a0"}
                            </p>
                          ))
                        ) : (
                          <p className="text-muted-foreground/60">
                            완성되지 않아도 괜찮아요. 떠오르는 대로 이야기해 보세요.
                          </p>
                        )}
                        {interim && <p className="text-muted-foreground/70 italic">{interim}</p>}
                      </div>
                    ) : (
                      <textarea
                        ref={textareaRef}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="마이크를 켜고 떠오르는 대로 이야기해 보세요. 문장이 완성되지 않아도 괜찮습니다."
                        rows={14}
                        className="hand min-h-[46vh] w-full resize-none bg-transparent text-[1.4rem] leading-[2.25rem] text-foreground outline-none placeholder:text-muted-foreground/50 lg:min-h-[52vh]"
                      />
                    )}
                  </div>
                </div>

                {/* Right page — quiet continuation */}
                <div className="relative hidden flex-col px-7 pt-9 pb-8 sm:px-12 lg:flex lg:pl-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="hand text-lg text-muted-foreground">
                      {listening ? "지금 적히는 중" : "남겨진 흔적"}
                    </span>
                    <span className="hand text-lg text-accent-foreground/60">013</span>
                  </div>

                  <div className="paper-ruled mt-8 flex-1">
                    <p className="hand text-[1.4rem] leading-[2.25rem] text-muted-foreground/80">
                      {body
                        ? body.split("\n").slice(-6).join(" ").slice(0, 220)
                        : "이 페이지는 잘 쓰기 위한 곳이 아닙니다. 그냥 머물러도 괜찮습니다."}
                    </p>
                  </div>

                  <div className="mt-8 rounded-lg border border-accent/50 bg-accent/10 px-5 py-4">
                    <p className="hand flex items-center gap-2 text-lg text-foreground">
                      <Feather className="size-4 text-accent-foreground/70" /> 오늘의 한 줄
                    </p>
                    <p className="hand mt-1 text-[1.35rem] leading-[2rem] text-foreground/85">
                      생각을 한 장의 페이지로 남긴다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {!covered && (
            <div className="swipe-guide" aria-hidden="true">
              <span>← 왼쪽으로 밀기 · {canGoNewer ? "다음 페이지" : "새 페이지"}</span>
              <span>오른쪽으로 밀기 · 지난 페이지 →</span>
            </div>
          )}

          <p className="mt-10 text-center text-xs text-muted-foreground">
            완벽하지 않아도 괜찮습니다. 기록은 이 브라우저에만 머무릅니다.
          </p>
        </section>
      </div>
    </div>
  );
}
