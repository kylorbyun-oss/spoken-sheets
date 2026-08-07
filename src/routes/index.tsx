import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { NoteWorkspace } from "@/components/note-workspace";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        name: "description",
        content:
          "닫혀 있던 노트가 제자리에서 천천히 펼쳐지고, 말하면 한 줄씩 적혀 내려갑니다. 오늘의 생각 한 페이지를 남겨보세요.",
      },
      { property: "og:title", content: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        property: "og:description",
        content: "닫혀 있던 노트가 제자리에서 펼쳐지는 한 페이지 음성 노트.",
      },
    ],
  }),
  component: Desk,
});

function useTodayLabel() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date()),
    );
  }, []);
  return label;
}

/**
 * One desk, one notebook. The workspace is always mounted underneath;
 * the cover simply opens in place — no route change, no in-between page.
 */
function Desk() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const today = useTodayLabel();

  // A note opened from the archive is already unfolded.
  const [phase, setPhase] = useState<"closed" | "opening" | "open">(id ? "open" : "closed");
  useEffect(() => {
    if (id) setPhase("open");
  }, [id]);

  const open = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    window.setTimeout(() => setPhase("open"), 2800);
  };

  const handleNoteCreated = useCallback(
    (newId: string) => {
      void navigate({ to: "/", search: { id: newId }, replace: true });
    },
    [navigate],
  );

  const covered = phase !== "open";

  return (
    <div className="relative">
      <div aria-hidden={covered}>
        <NoteWorkspace noteId={id} onNoteCreated={handleNoteCreated} />
      </div>

      {covered && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* the desk fades away as the cover lifts */}
          <div
            className={`desk-surface absolute inset-0 transition-opacity duration-[1600ms] ease-out ${
              phase === "opening" ? "opacity-0" : "opacity-100"
            }`}
          />

          <div className="relative flex h-full items-center justify-center px-5 py-10 sm:px-8">
            <div className="book-scene w-full max-w-3xl">
              <div
                className={`book-cover relative flex flex-col rounded-[1.6rem] px-7 py-10 sm:px-16 sm:py-14 ${
                  phase === "opening" ? "book-cover-open" : ""
                }`}
              >
                <p className="font-serif-display text-[0.7rem] tracking-[0.42em] text-primary-foreground/60">
                  VOICE BOOK
                </p>

                <div className="flex flex-1 flex-col items-start justify-center py-8">
                  <h1 className="text-balance-tight font-serif-display text-[2.25rem] leading-[3.4rem] text-primary-foreground sm:text-[3.2rem] sm:leading-[4.6rem]">
                    생각을 한 장의
                    <br />
                    페이지로 남긴다.
                  </h1>
                  <p className="mt-6 min-h-5 font-serif-display text-sm tracking-[0.16em] text-primary-foreground/55">
                    {today}
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={open}
                    className="self-start font-serif-display text-lg text-primary-foreground/90 transition-opacity hover:opacity-70"
                  >
                    {phase === "opening" ? "펼치는 중…" : "📖 빈 페이지 펼치기"}{" "}
                    <span aria-hidden="true">→</span>
                  </button>
                  <Link
                    to="/notes"
                    className="font-serif-display text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                  >
                    지난 페이지 넘겨보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
