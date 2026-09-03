import { Link } from "@tanstack/react-router";
import {
  clustersForPackage,
  edgesForPackage,
  EDGE_TYPE_LABEL,
} from "@/lib/catalog/cascade";
import { displayTitle, packageCode } from "@/lib/catalog/parse-citation";
import { useLocale } from "@/lib/i18n/locale";
import type { ClimatePackage } from "@/lib/catalog/types";

function lookup(name: string, packages: ClimatePackage[]): ClimatePackage | undefined {
  return packages.find((p) => p.name === name);
}

function RelatedLink({
  name,
  packages,
}: {
  name: string;
  packages: ClimatePackage[];
}) {
  const pkg = lookup(name, packages);
  const title = displayTitle(name, pkg?.title ?? name);
  return (
    <Link
      to="/p/$name"
      params={{ name }}
      className="block min-h-11 rounded-lg bg-surface px-3 py-3 shadow-[var(--shadow-border)] outline-none transition-[box-shadow] hover:shadow-[var(--shadow-border-hover)] focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <span className="font-mono text-[11px] tracking-wider text-accent tabular-nums">
        {packageCode(pkg?.packageNumber ?? null)}
      </span>
      <span className="mt-1 block font-display text-base leading-snug text-fg">{title}</span>
      <span className="mt-0.5 block font-mono text-[11px] text-subtle">{name}</span>
    </Link>
  );
}

export function RelatedPackages({
  name,
  packages,
}: {
  name: string;
  packages: ClimatePackage[];
}) {
  const { t } = useLocale();
  const clusters = clustersForPackage(name);
  const edges = edgesForPackage(name);
  if (clusters.length === 0 && edges.length === 0) return null;

  return (
    <section className="mt-10 pb-12">
      <h2 className="font-display text-2xl tracking-tight">{t.relatedPackages}</h2>

      {clusters.map((cluster) => {
        const others = cluster.packageNames.filter((n) => n !== name);
        return (
          <div key={cluster.id} className="mt-6">
            <p className="text-sm font-medium text-fg">{cluster.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{cluster.note}</p>
            {others.length > 0 ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {others.map((other) => (
                  <li key={other}>
                    <RelatedLink name={other} packages={packages} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}

      {edges.length > 0 ? (
        <aside className="mt-8 rounded-lg bg-surface-2 px-4 py-4 shadow-[var(--shadow-border)]">
          <p className="text-sm font-medium text-fg">{t.contrastedWith}</p>
          <p className="mt-1 text-xs leading-relaxed text-subtle">{t.contrastedHint}</p>
          <ul className="mt-4 space-y-4">
            {edges.map((edge) => {
              const other = edge.from === name ? edge.to : edge.from;
              return (
                <li key={`${edge.from}-${edge.to}-${edge.type}`}>
                  <p className="font-mono text-[11px] tracking-wide text-subtle uppercase">
                    {EDGE_TYPE_LABEL[edge.type]}
                  </p>
                  <div className="mt-2">
                    <RelatedLink name={other} packages={packages} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{edge.note}</p>
                </li>
              );
            })}
          </ul>
        </aside>
      ) : null}
    </section>
  );
}
