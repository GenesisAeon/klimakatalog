import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BridgeBadge({
  noUtacBridge,
  className,
}: {
  noUtacBridge: boolean;
  className?: string;
}) {
  if (noUtacBridge) {
    return (
      <Badge variant="accent" className={cn("w-fit whitespace-nowrap", className)}>
        Kein UTAC/CREP/AFET-Bridge
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={className}>
      mit UTAC/CREP-Bridge
    </Badge>
  );
}

export function BridgeCallout({ noUtacBridge }: { noUtacBridge: boolean }) {
  if (noUtacBridge) {
    return (
      <aside className="mt-5 rounded-lg bg-accent/10 px-4 py-3 shadow-[var(--shadow-border)]">
        <p className="text-sm font-medium text-fg">Kein UTAC/CREP/AFET-Bridge</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Reine Zitat-Wissenschaft: dieses Paket stellt Fachliteratur ohne
          Framework-Anbindung dar.
        </p>
      </aside>
    );
  }
  return (
    <aside className="mt-5 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium text-fg">mit UTAC/CREP-Bridge</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Dieses Paket koppelt die zitierte Fachliteratur an das UTAC/CREP-Framework.
        Die Paper-DOIs bleiben davon getrennt.
      </p>
    </aside>
  );
}
