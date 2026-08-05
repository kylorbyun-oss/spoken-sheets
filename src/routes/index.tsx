import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        name: "description",
        content:
          "말하면 그대로 쓰이는 한 장의 노트. 조용한 새벽처럼, 오늘의 생각 한 페이지를 남겨보세요.",
      },
      { property: "og:title", content: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        property: "og:description",
        content: "말하면 그대로 쓰이는 한 장의 노트. 오늘의 생각 한 페이지를 남겨보세요.",
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

  return (
    <PageShell quiet>
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center px-5 pt-12 pb-20 sm:px-8 sm:pt-16">
        <p className="fade-up font-serif-display text-sm tracking-[0.16em] text-muted-foreground/90 min-h-5">
          {today}
        </p>

        <div className="paper-sheet ink-grain page-fold fade-up mt-6 overflow-hidden rounded-[1.6rem]">
          <div className="paper-ruled paper-margin px-7 pt-[4.5rem] pb-[4.5rem] sm:px-16 sm:pt-[6.75rem] sm:pb-[6.75rem]">
            <h1 className="font-serif-display text-[2.05rem] leading-[4.5rem] text-balance-tight sm:text-[3rem] sm:leading-[6.75rem]">
              생각을 한 장의
              <br />
              페이지로 남긴다.
            </h1>

            <p className="mt-[2.25rem] font-serif-display text-[1.05rem] leading-[2.25rem] text-foreground/70 sm:mt-[4.5rem]">
              오늘은 무엇을 남기고 싶으신가요.
              <br />
              굳이 정리하지 않아도 괜찮습니다. 말하는 대로 이 종이에
              <br className="hidden sm:block" />
              그대로 쓰이고, 다 쓰이면 조용히 접어 둘 뿐입니다.
            </p>

            <p className="mt-[2.25rem] font-serif-display text-[0.95rem] leading-[2.25rem] text-muted-foreground">
              — 잠시 멈추고, 한 페이지만 이야기해 보세요.
            </p>
          </div>

          <div className="flex flex-col gap-5 border-t border-border/50 px-7 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-16">
            <Link
              to="/note"
              className="font-serif-display text-lg text-foreground transition-opacity hover:opacity-70"
            >
              펼쳐서 이야기하기 <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/notes"
              className="pen-underline font-serif-display text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              지난 페이지 넘겨보기
            </Link>
          </div>
        </div>

        <p className="fade-up mt-9 font-serif-display text-xs leading-[2.25rem] text-muted-foreground/80">
          말하면 쓰이고, 멈추면 남습니다. 이 노트는 당신의 브라우저 안에만 머무릅니다.
        </p>
      </section>
    </PageShell>
  );
}
