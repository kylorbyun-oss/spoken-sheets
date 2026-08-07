import { createFileRoute, redirect } from "@tanstack/react-router";

// The notebook now lives on the desk at "/". Old links keep working.
export const Route = createFileRoute("/note")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search: { id: search.id }, replace: true });
  },
});
