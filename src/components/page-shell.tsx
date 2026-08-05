import { Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen dawn-surface">
      <SiteHeader />
      <main>{children}</main>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent/25 text-accent-foreground">
            <Mic className="size-4" />
          </span>
          <span className="font-serif-display text-lg tracking-[0.18em] text-foreground">
            VOICE BOOK
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/note"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground"
          >
            노트 쓰기
          </Link>
          <Link
            to="/notes"
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="rounded-full px-3 py-1.5 transition-colors hover:text-foreground"
          >
            보관함
          </Link>
        </nav>
      </div>
    </header>
  );
}
