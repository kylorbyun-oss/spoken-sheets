import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, BookOpen, Feather } from "lucide-react";

import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        name: "description",
        content:
          "말하면 그대로 기록되는 한 페이지 음성 노트. 브라우저 음성인식으로 생각을 놓치지 않고 한 장의 페이지에 담아보세요.",
      },
      { property: "og:title", content: "VOICE BOOK — 생각을 한 장의 페이지로 남긴다" },
      {
        property: "og:description",
        content: "말하면 실시간으로 기록되는 감성 음성 노트. 설치 없이 브라우저에서 바로.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Mic,
    title: "말한다",
    body: "마이크를 켜고 떠오르는 생각을 그대로 이야기하세요.",
  },
  {
    icon: Feather,
    title: "쓰여진다",
    body: "브라우저 음성인식이 실시간으로 문장을 노트에 옮깁니다.",
  },
  {
    icon: BookOpen,
    title: "남는다",
    body: "완성된 한 장은 보관함에 조용히 쌓입니다.",
  },
];

function Landing() {
  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-10 sm:pt-24">
        <p className="fade-up font-sans text-xs tracking-[0.4em] text-muted-foreground uppercase">
          one page note
        </p>
        <h1 className="fade-up mt-6 font-serif-display text-4xl leading-[1.25] text-balance-tight sm:text-6xl">
          생각을
          <br />
          한 장의 페이지로 남긴다.
        </h1>
        <p className="fade-up mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          목소리는 손보다 빠릅니다. VOICE BOOK은 당신이 말하는 동안 조용히 받아 적는 노트입니다.
          기록은 이 브라우저 안에만 머무릅니다.
        </p>

        <div className="fade-up mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/note"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-page)] transition-transform hover:-translate-y-0.5"
          >
            <Mic className="size-4" />
            지금 말하기 시작
          </Link>
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground/80 transition-colors hover:bg-secondary"
          >
            보관함 열기
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="paper-sheet ink-grain overflow-hidden rounded-2xl">
          <div className="paper-ruled px-7 py-10 sm:px-12 sm:py-14">
            <p className="font-serif-display text-2xl leading-[2.25rem] text-foreground/90 sm:text-[1.7rem]">
              “오늘 밤의 생각을 잊고 싶지 않았다.
              <br />
              그래서 그냥, 말했다.”
            </p>
            <p className="mt-[2.25rem] text-sm leading-[2.25rem] text-muted-foreground">
              — 어느 새벽의 한 페이지
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="rounded-xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                <Icon className="size-4" />
              </span>
              <h2 className="mt-4 font-serif-display text-lg">
                {i + 1}. {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        VOICE BOOK · 브라우저 음성인식 기반 한 페이지 노트
      </footer>
    </PageShell>
  );
}
