import { formatFetchedAt } from "@/lib/catalog/parse-citation";
import { cn } from "@/lib/utils";

export function SourceStatus({
  source,
  fetchedAt,
  error,
  className,
}: {
  source: "github" | "seed" | "live";
  fetchedAt?: string;
  error?: string;
  className?: string;
}) {
  const live = source === "github" || source === "live";
  const stand = fetchedAt ? formatFetchedAt(fetchedAt) : "";
  const label = live
    ? stand
      ? `Live von GitHub, Stand ${stand}`
      : "Live von GitHub"
    : error || "Offline-Fallback-Daten";

  return (
    <p
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md bg-surface px-3 py-2 text-sm shadow-[var(--shadow-border)]",
        className,
      )}
      role="status"
    >
      <span
        className={live ? "size-2 shrink-0 rounded-full bg-accent" : "size-2 shrink-0 rounded-full bg-muted"}
        aria-hidden="true"
      />
      <span className={live ? "text-fg" : "text-muted"}>{label}</span>
    </p>
  );
}
