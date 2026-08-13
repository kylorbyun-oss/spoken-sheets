import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import type { ReactNode } from "react";

const TOOL_HOME_URL = "https://yellow-k-tools.kylorbyun.chatgpt.site/";

/** Charcoal + industrial-yellow shortcut back to Yellow K Tools. */
export function ToolHomeButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={TOOL_HOME_URL}
      rel="noopener"
      className={`tool-home-button inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs tracking-[0.08em] sm:px-4 sm:py-2 sm:text-[0.8rem] ${className}`}
    >
      <Wrench className="size-3.5" aria-hidden="true" />
      도구 홈
    </a>
  );
}

export function PageShell({
  children,
  quiet = false,
}: {
  children: ReactNode;
  quiet?: boolean;
}) {
  return (
    <div className="dawn-surface lamp-glow relative min-h-screen">
      <SiteHeader quiet={quiet} />
      <main>{children}</main>
    </div>
  );
}

export function SiteHeader({ quiet = false }: { quiet?: boolean }) {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-6 gap-y-3 px-6 pt-8 sm:px-8 sm:pt-10">
        <Link
          to="/"
          search={{}}
          className="font-serif-display text-[0.95rem] tracking-[0.34em] text-foreground/70 transition-colors hover:text-foreground"
        >
          VOICE BOOK
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {!quiet && (
            <nav className="flex items-baseline gap-4 font-serif-display text-sm sm:gap-6">
              <Link
                to="/"
                search={{}}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="pen-underline transition-colors hover:text-foreground"
              >
                오늘의 페이지
              </Link>
              <Link
                to="/notes"
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="pen-underline transition-colors hover:text-foreground"
              >
                지난 페이지
              </Link>
            </nav>
          )}
          <ToolHomeButton />
        </div>
      </div>
    </header>
  );
}
