import { createFileRoute, redirect } from "@tanstack/react-router";

// The notebook now lives on the desk at "/". Old links keep working.
export const Route = createFileRoute("/note")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search["id"] === "string" ? { id: search["id"] as string } : {},
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/",
      search: search.id ? { id: search.id } : {},
      replace: true,
    });
  },
});
