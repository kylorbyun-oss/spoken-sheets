import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-6 px-6 pt-8 sm:px-8 sm:pt-10">
        <Link
          to="/"
          className="font-serif-display text-[0.95rem] tracking-[0.34em] text-foreground/70 transition-colors hover:text-foreground"
        >
          VOICE BOOK
        </Link>
        {!quiet && (
          <nav className="flex items-baseline gap-6 font-serif-display text-sm">
            <Link
              to="/note"
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
      </div>
    </header>
  );
}
