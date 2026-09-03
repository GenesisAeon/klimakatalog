import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function BridgeBadge({
  noUtacBridge,
  className,
}: {
  noUtacBridge: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  if (noUtacBridge) {
    return (
      <Badge variant="accent" className={cn("w-fit whitespace-nowrap", className)}>
        {t.noBridgeBadge}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={className}>
      {t.withBridgeBadge}
    </Badge>
  );
}

export function BridgeCallout({ noUtacBridge }: { noUtacBridge: boolean }) {
  const { t } = useLocale();
  if (noUtacBridge) {
    return (
      <aside className="mt-5 rounded-lg bg-accent/10 px-4 py-3 shadow-[var(--shadow-border)]">
        <p className="text-sm font-medium text-fg">{t.noBridgeBadge}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.noBridgeCallout}</p>
      </aside>
    );
  }
  return (
    <aside className="mt-5 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium text-fg">{t.withBridgeBadge}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t.withBridgeCallout}</p>
    </aside>
  );
}
