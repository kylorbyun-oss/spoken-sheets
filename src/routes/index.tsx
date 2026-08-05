import { createFileRoute, Link } from "@tanstack/react-router";

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

function today() {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function Landing() {
  return (
    <PageShell quiet>
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center px-5 pt-10 pb-16 sm:px-8">
        <p className="fade-up font-serif-display text-sm text-muted-foreground/90">{today()}</p>

        <div className="paper-sheet ink-grain fade-up mt-5 overflow-hidden rounded-[1.4rem]">
          <div className="paper-ruled px-7 pt-10 pb-9 sm:px-14 sm:pt-14 sm:pb-12">
            <h1 className="font-serif-display text-[1.9rem] leading-[2.25rem] text-balance-tight sm:text-[2.5rem] sm:leading-[4.5rem]">
              생각을 한 장의
              <br />
              페이지로 남긴다.
            </h1>

            <p className="mt-[2.25rem] font-serif-display text-[1.05rem] leading-[2.25rem] text-foreground/75">
              오늘은 무엇을 남기고 싶으신가요.
              <br />
              굳이 정리하지 않아도 괜찮습니다. 말하는 대로 이 종이에 그대로
              <br className="hidden sm:block" />
              쓰이고, 다 쓰이면 조용히 접어 둘 뿐입니다.
            </p>

            <p className="mt-[2.25rem] font-serif-display text-[1.05rem] leading-[2.25rem] text-muted-foreground">
              — 이 노트는 당신의 브라우저 안에만 머무릅니다.
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-border/60 px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-14">
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

        <p className="fade-up mt-8 font-serif-display text-xs leading-relaxed text-muted-foreground/80">
          말하면 쓰이고, 멈추면 남습니다. 한 번에 한 페이지면 충분합니다.
        </p>
      </section>
    </PageShell>
  );
}
