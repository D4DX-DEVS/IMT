import { Loader2 } from "lucide-react";

/** Shown instantly while an admin page loads, so moving between sections never feels stuck. */
export default function PanelPageLoading() {
  return (
    <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink/55">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </p>
  );
}
