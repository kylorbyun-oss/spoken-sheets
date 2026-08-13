import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { NoteWorkspace } from "@/components/note-workspace";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search["id"] === "string" ? { id: search["id"] as string } : {},

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

/**
 * One desk, one notebook. The spread is always mounted;
 * its cover simply lies on top until the user opens it in place.
 */
function Desk() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();


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

  const handlePageChange = useCallback(
    (pageId: string | undefined) => {
      void navigate({ to: "/", search: pageId ? { id: pageId } : {}, replace: true });
    },
    [navigate],
  );

  const covered = phase !== "open";

  return (
    <NoteWorkspace
      noteId={id}
      onNoteCreated={handleNoteCreated}
      onPageChange={handlePageChange}
      covered={covered}
      opening={phase === "opening"}
      onOpen={open}
    />
  );
}
