import { formatFetchedAt } from "@/lib/catalog/parse-citation";
import { useLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function SourceStatus({
  source,
  fetchedAt,
  className,
}: {
  source: "github" | "seed" | "live";
  fetchedAt?: string;
  error?: string;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const live = source === "github" || source === "live";
  const stand = fetchedAt ? formatFetchedAt(fetchedAt, locale) : "";
  const label = live ? t.liveFromGithub(stand) : t.offlineFallback;

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
