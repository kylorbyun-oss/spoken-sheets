import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        name: "description",
        content:
          "닫혀 있던 노트가 천천히 펼쳐지고, 말하면 한 줄씩 적혀 내려갑니다. 오늘의 생각 한 페이지를 남겨보세요.",
      },
      { property: "og:title", content: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        property: "og:description",
        content: "닫혀 있던 노트가 천천히 펼쳐지는 한 페이지 음성 노트.",
      },
    ],
  }),
  component: Landing,
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

function Landing() {
  const today = useTodayLabel();
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => {
      void navigate({ to: "/note" });
    }, 3200);
  };

  return (
    <PageShell quiet>
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center px-5 pt-12 pb-20 sm:px-8 sm:pt-16">
        <p className="fade-up min-h-5 font-serif-display text-sm tracking-[0.16em] text-muted-foreground/90">
          {today}
        </p>

        <div className="book-scene fade-up mt-6">
          <div className="relative">
            {/* The page waiting underneath the cover */}
            <div
              className="paper-sheet paper-ruled paper-margin ink-grain overflow-hidden rounded-[1.6rem] px-7 py-[4.5rem] sm:px-16 sm:py-[6.75rem]"
              aria-hidden={!opening}
            >
              <p
                className={`font-serif-display text-[1.05rem] leading-[2.25rem] text-foreground/70 ${
                  opening ? "ink-line" : "opacity-0"
                }`}
              >
                오늘은 무엇을 남기고 싶으신가요.
                <br />
                완성되지 않아도 괜찮습니다. 말하는 대로 이 종이에
                <br className="hidden sm:block" />
                그대로 쓰이고, 다 쓰이면 조용히 접어 둘 뿐입니다.
              </p>
            </div>

            {/* The closed cover */}
            <div
              className={`book-cover absolute inset-0 flex flex-col rounded-[1.6rem] px-7 py-10 sm:px-16 sm:py-14 ${
                opening ? "book-cover-open" : ""
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
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={open}
                  className="self-start font-serif-display text-lg text-primary-foreground/90 transition-opacity hover:opacity-70"
                >
                  {opening ? "펼치는 중…" : "📖 빈 페이지 펼치기"}{" "}
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

        <p className="fade-up mt-9 font-serif-display text-xs leading-[2.25rem] text-muted-foreground/80">
          말하면 한 줄씩 쓰이고, 멈추면 남습니다. 완벽하지 않아도 이 노트는 당신의 생각을 그대로 받아둡니다.
        </p>
      </section>
    </PageShell>
  );
}
