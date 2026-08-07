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
    <NoteWorkspace
      noteId={id}
      onNoteCreated={handleNoteCreated}
      covered={covered}
      opening={phase === "opening"}
      onOpen={open}
    />
  );
}
