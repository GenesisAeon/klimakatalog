import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BridgeBadge } from "@/components/catalog/bridge-badge";
import { displayTitle, packageCode } from "@/lib/catalog/parse-citation";
import { THEME_LABEL } from "@/lib/catalog/themes";
import type { ClimatePackage } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function PackageCard({
  pkg,
  highlighted,
}: {
  pkg: ClimatePackage;
  highlighted?: boolean;
}) {
  const title = displayTitle(pkg.name, pkg.title);
  return (
    <article
      id={`pkg-${pkg.name}`}
      className={cn(
        "group flex h-full flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:shadow-[var(--shadow-border-hover)]",
        highlighted && "ring-2 ring-ring/70",
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wider text-accent tabular-nums">
          {packageCode(pkg.packageNumber)}
        </p>
        <BridgeBadge noUtacBridge={pkg.noUtacBridge} />
      </div>
      <h2 className="mt-3 font-display text-xl leading-snug tracking-tight text-fg">
        <Link
          to="/p/$name"
          params={{ name: pkg.name }}
          className="rounded-sm outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          {title}
        </Link>
      </h2>
      <p className="mt-1 font-mono text-[11px] text-subtle">{pkg.name}</p>
      {pkg.noUtacBridge ? (
        <p className="mt-3 text-xs leading-relaxed text-accent">
          Reine Zitat-Wissenschaft — ohne Framework-Anbindung
        </p>
      ) : null}
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{pkg.abstract}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {pkg.themes.slice(0, 3).map((theme) => (
          <Badge key={theme} variant="default">
            {THEME_LABEL[theme]}
          </Badge>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
          <BookOpen className="size-3.5" />
          {pkg.selfDoi
            ? `Paket-DOI · ${pkg.dois.length} Quellen`
            : `${pkg.dois.length} Quellen-DOI${pkg.dois.length === 1 ? "" : "s"}`}
        </span>
        <Link
          to="/p/$name"
          params={{ name: pkg.name }}
          className="inline-flex min-h-11 items-center gap-1 text-sm text-fg/90 outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          Quellen
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
