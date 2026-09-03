import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, RefreshCw } from "lucide-react";
import { CatalogBar } from "@/components/catalog/catalog-bar";
import { FilterBar } from "@/components/catalog/filter-bar";
import { PackageCard } from "@/components/catalog/package-card";
import { SourceStatus } from "@/components/catalog/source-status";
import { Button } from "@/components/ui/button";
import { EMPTY_FILTERS, filterPackages, CLUSTER_IDS, type CatalogFilters } from "@/lib/catalog/filter";
import { CLUSTERS, type ClusterId } from "@/lib/catalog/cascade";
import { listClimatePackages } from "@/lib/catalog/api";
import { SEED_PACKAGES } from "@/lib/catalog/seed";
import type { ThemeId } from "@/lib/catalog/types";
import { THEME_IDS } from "@/lib/catalog/types";
import { useLocale } from "@/lib/i18n/locale";

type Search = {
  q?: string;
  theme?: string;
  cluster?: string;
  pkg?: string;
  bridge?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
    theme: typeof search.theme === "string" ? search.theme : undefined,
    cluster: typeof search.cluster === "string" ? search.cluster : undefined,
    pkg: typeof search.pkg === "string" ? search.pkg : undefined,
    bridge: typeof search.bridge === "string" ? search.bridge : undefined,
  }),
  loader: () => listClimatePackages(),
  component: Home,
});

function searchToFilters(search: Search): CatalogFilters {
  const theme =
    search.theme && (THEME_IDS as readonly string[]).includes(search.theme)
      ? (search.theme as ThemeId)
      : "alle";
  const cluster =
    search.cluster && (CLUSTER_IDS as readonly string[]).includes(search.cluster)
      ? (search.cluster as ClusterId)
      : "alle";
  return {
    query: search.q ?? "",
    theme,
    cluster,
    selected: search.pkg ?? "",
    bridge: search.bridge === "ohne" ? "ohne" : "alle",
  };
}

function Home() {
  const { t } = useLocale();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const loaderData = Route.useLoaderData();
  const filters = searchToFilters(search);

  const query = useQuery({
    queryKey: ["climate-packages"],
    queryFn: () => listClimatePackages(),
    initialData: loaderData,
    refetchOnMount: "always",
    refetchInterval: (q) => (q.state.data?.source === "github" ? false : 15_000),
  });

  const payload = query.data ?? {
    source: "seed" as const,
    fetchedAt: "",
    packages: SEED_PACKAGES,
    liveCount: 0,
  };
  const visible = filterPackages(payload.packages, filters);
  const activeCluster =
    filters.cluster === "alle" ? undefined : CLUSTERS.find((c) => c.id === filters.cluster);
  const ohne = payload.packages.filter((p) => p.noUtacBridge).length;
  const dois = new Set(payload.packages.flatMap((p) => p.dois)).size;

  function setFilters(next: CatalogFilters) {
    void navigate({
      search: {
        q: next.query || undefined,
        theme: next.theme === "alle" ? undefined : next.theme,
        cluster: next.cluster === "alle" ? undefined : next.cluster,
        pkg: next.selected || undefined,
        bridge: next.bridge === "alle" ? undefined : next.bridge,
      },
    });
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_7%,transparent),transparent)]" />
      <header className="relative mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14">
        <CatalogBar />
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] tracking-[-0.03em] text-fg sm:text-5xl">
          {t.catalogTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {t.catalogLead}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-subtle">
          <span className="font-mono tabular-nums text-fg">
            {t.packagesCount(payload.packages.length)}
          </span>
          <span>{t.withoutBridgeCount(ohne)}</span>
          <span>{t.sourceDoisCount(dois)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-subtle"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            {t.refresh}
          </Button>
        </div>
        <div className="mt-4">
          <SourceStatus source={payload.source} fetchedAt={payload.fetchedAt} />
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <FilterBar filters={filters} packages={payload.packages} onChange={setFilters} />
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {activeCluster ? (
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted">
            <span className="text-fg">{activeCluster.label}. </span>
            {activeCluster.note}
          </p>
        ) : null}
        {visible.length === 0 ? (
          <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-border)]">
            <Leaf className="mx-auto size-6 text-muted" />
            <p className="mt-3 font-display text-xl text-fg">{t.noHits}</p>
            <p className="mt-2 text-sm text-muted">{t.noHitsHint}</p>
            <Button className="mt-6" variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              {t.clearFilters}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((pkg) => (
              <PackageCard
                key={pkg.name}
                pkg={pkg}
                highlighted={filters.selected === pkg.name}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
