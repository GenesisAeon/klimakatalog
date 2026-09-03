import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, FileText, Github, ScrollText } from "lucide-react";
import { MarkdownExcerpt } from "@/components/catalog/markdown-excerpt";
import { CatalogBar } from "@/components/catalog/catalog-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BridgeBadge, BridgeCallout } from "@/components/catalog/bridge-badge";
import { SourceStatus } from "@/components/catalog/source-status";
import { RelatedPackages } from "@/components/catalog/related-packages";
import { fetchPackageSources } from "@/lib/catalog/api";
import { doiHref, displayTitle, packageCode } from "@/lib/catalog/parse-citation";
import { SEED_PACKAGES } from "@/lib/catalog/seed";
import { useLocale } from "@/lib/i18n/locale";

export const Route = createFileRoute("/p/$name")({
  loader: async ({ params }) => {
    const seed = SEED_PACKAGES.find((p) => p.name === params.name);
    const sources = await fetchPackageSources({ data: { name: params.name } });
    if (!seed && sources.source === "seed" && !sources.abstract) {
      throw notFound();
    }
    return { seed, sources };
  },
  component: PackagePage,
  notFoundComponent: NotFoundPackage,
});

function NotFoundPackage() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center text-fg">
      <p className="font-display text-2xl">{t.notFound}</p>
      <Link to="/" className="mt-4 text-sm text-accent hover:underline">
        {t.backHome}
      </Link>
    </main>
  );
}

function PackagePage() {
  const { t, locale } = useLocale();
  const { name } = Route.useParams();
  const { seed, sources } = Route.useLoaderData();
  const title = displayTitle(name, sources.title || seed?.title || name);
  const dois = sources.dois.length ? sources.dois : (seed?.dois ?? []);
  const selfDoi = sources.selfDoi || seed?.selfDoi || null;
  const keywords = sources.keywords.length ? sources.keywords : (seed?.keywords ?? []);
  const noBridge = sources.noUtacBridge || seed?.noUtacBridge;
  const refs = sources.references.filter((r) => r.title || r.doi);
  const readmeHref = `https://github.com/GenesisAeon/${name}/blob/${sources.branch}/README.md`;
  const whitepaperHref = sources.hasWhitepaper ? sources.whitepaperUrl : null;
  const preferWhitepaper = locale === "de" && Boolean(whitepaperHref);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <CatalogBar />
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {t.backToCatalog}
        </Link>

        <p className="mt-8 font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {packageCode(seed?.packageNumber ?? null)}
          {sources.version ? ` · v${sources.version}` : ""}
          {seed?.released ? ` · ${seed.released}` : ""}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-[-0.03em]">{title}</h1>
        <p className="mt-2 font-mono text-xs text-subtle">{name}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <BridgeBadge noUtacBridge={Boolean(noBridge)} />
          {(seed?.themes ?? []).map((theme) => (
            <Badge key={theme}>{t.themes[theme]}</Badge>
          ))}
          {seed?.license ? <Badge variant="outline">{seed.license}</Badge> : null}
        </div>

        <BridgeCallout noUtacBridge={Boolean(noBridge)} />

        <p className="mt-6 text-base leading-relaxed text-muted">{sources.abstract}</p>
        <div className="mt-4">
          <SourceStatus source={sources.source} fetchedAt={sources.fetchedAt} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {preferWhitepaper && whitepaperHref ? (
            <Button asChild>
              <a href={whitepaperHref} target="_blank" rel="noreferrer">
                <ScrollText className="size-4" />
                {t.whitepaper}
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          ) : (
            <Button asChild>
              <a href={readmeHref} target="_blank" rel="noreferrer">
                <FileText className="size-4" />
                README.md
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          )}
          {preferWhitepaper ? (
            <Button asChild variant="outline">
              <a href={readmeHref} target="_blank" rel="noreferrer">
                <FileText className="size-4" />
                README.md
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          ) : whitepaperHref ? (
            <Button asChild variant="outline">
              <a href={whitepaperHref} target="_blank" rel="noreferrer">
                <ScrollText className="size-4" />
                {t.whitepaper}
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <a href={seed?.citationUrl ?? `https://github.com/GenesisAeon/${name}`} target="_blank" rel="noreferrer">
              <FileText className="size-4" />
              CITATION.cff
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href={seed?.htmlUrl ?? `https://github.com/GenesisAeon/${name}`} target="_blank" rel="noreferrer">
              <Github className="size-4" />
              GitHub
              <ExternalLink className="size-3.5 opacity-60" />
            </a>
          </Button>
        </div>
        <p className="mt-2 text-xs text-subtle">
          {preferWhitepaper ? t.whitepaperHint : t.readmeHint}
        </p>

        <Separator className="my-10" />

        <section>
          <h2 className="font-display text-2xl tracking-tight">{t.packageDoi}</h2>
          {selfDoi ? (
            <p className="mt-3">
              <a
                href={doiHref(selfDoi)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center font-mono text-sm text-accent hover:underline"
              >
                {selfDoi}
              </a>
              <span className="mt-1 block text-xs text-subtle">{t.packageDoiHint}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">{t.noPackageDoi}</p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-tight">{t.sourceDois}</h2>
          {dois.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.noSourceDois}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {dois.map((doi) => (
                <li key={doi}>
                  <a
                    href={doiHref(doi)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center font-mono text-sm text-accent hover:underline"
                  >
                    {doi}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {refs.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">{t.literature}</h2>
            <ol className="mt-4 space-y-4">
              {refs.map((ref, i) => (
                <li key={`${ref.doi ?? ref.title}-${i}`} className="text-sm leading-relaxed">
                  <p className="text-fg">{ref.title}</p>
                  <p className="mt-0.5 text-subtle">
                    {[ref.journal, ref.year].filter(Boolean).join(", ")}
                  </p>
                  {ref.doi ? (
                    <a
                      href={doiHref(ref.doi)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {ref.doi}
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {keywords.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">{t.keywords}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <Badge key={kw} variant="default">
                  {kw}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {sources.disclaimer ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">{t.disclaimer}</h2>
            <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <MarkdownExcerpt text={sources.disclaimer} />
            </div>
          </section>
        ) : null}

        {sources.readme ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">{t.readme}</h2>
            <p className="mt-1 text-xs text-subtle">{t.readmeHint}</p>
            <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <MarkdownExcerpt text={sources.readme} />
            </div>
          </section>
        ) : (
          <p className="mt-10 text-sm text-subtle">{t.readmeMissing}</p>
        )}

        <RelatedPackages name={name} packages={SEED_PACKAGES} />
      </div>
    </main>
  );
}
