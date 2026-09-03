import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, FileText, Github, ScrollText } from "lucide-react";
import { MarkdownExcerpt } from "@/components/catalog/markdown-excerpt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BridgeBadge, BridgeCallout } from "@/components/catalog/bridge-badge";
import { SourceStatus } from "@/components/catalog/source-status";
import { fetchPackageSources } from "@/lib/catalog/api";
import { doiHref, displayTitle, packageCode } from "@/lib/catalog/parse-citation";
import { SEED_PACKAGES } from "@/lib/catalog/seed";
import { THEME_LABEL } from "@/lib/catalog/themes";

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
  notFoundComponent: () => (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center text-fg">
      <p className="font-display text-2xl">Paket nicht gefunden</p>
      <Link to="/" className="mt-4 text-sm text-accent hover:underline">
        Zurück zum Katalog
      </Link>
    </main>
  ),
});

function PackagePage() {
  const { name } = Route.useParams();
  const { seed, sources } = Route.useLoaderData();
  const title = displayTitle(name, sources.title || seed?.title || name);
  const dois = sources.dois.length ? sources.dois : (seed?.dois ?? []);
  const selfDoi = sources.selfDoi || seed?.selfDoi || null;
  const keywords = sources.keywords.length ? sources.keywords : (seed?.keywords ?? []);
  const noBridge = sources.noUtacBridge || seed?.noUtacBridge;
  const refs = sources.references.filter((r) => r.title || r.doi);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Katalog
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
            <Badge key={theme}>{THEME_LABEL[theme]}</Badge>
          ))}
          {seed?.license ? <Badge variant="outline">{seed.license}</Badge> : null}
        </div>

        <BridgeCallout noUtacBridge={Boolean(noBridge)} />

        <p className="mt-6 text-base leading-relaxed text-muted">{sources.abstract}</p>
        <div className="mt-4">
          <SourceStatus source={sources.source} fetchedAt={sources.fetchedAt} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href={seed?.htmlUrl ?? `https://github.com/GenesisAeon/${name}`} target="_blank" rel="noreferrer">
              <Github className="size-4" />
              GitHub
              <ExternalLink className="size-3.5 opacity-60" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={seed?.citationUrl ?? `https://github.com/GenesisAeon/${name}`} target="_blank" rel="noreferrer">
              <FileText className="size-4" />
              CITATION.cff
            </a>
          </Button>
          {sources.hasWhitepaper && sources.whitepaperUrl ? (
            <Button asChild variant="outline">
              <a href={sources.whitepaperUrl} target="_blank" rel="noreferrer">
                <ScrollText className="size-4" />
                WHITEPAPER.md
                <ExternalLink className="size-3.5 opacity-60" />
              </a>
            </Button>
          ) : null}
        </div>

        <Separator className="my-10" />

        <section>
          <h2 className="font-display text-2xl tracking-tight">Paket-DOI</h2>
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
              <span className="mt-1 block text-xs text-subtle">
                Eigene Archiv-DOI dieses Repos (CITATION.cff / .zenodo.json), nicht die zitierten Studien.
              </span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Keine eigene Paket-DOI in CITATION.cff oder .zenodo.json.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-tight">Quellen-DOIs</h2>
          {dois.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              In der CITATION.cff dieses Pakets sind keine Paper-DOIs hinterlegt.
            </p>
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
            <h2 className="font-display text-2xl tracking-tight">Literatur je Paket</h2>
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
            <h2 className="font-display text-2xl tracking-tight">Schlagworte</h2>
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
            <h2 className="font-display text-2xl tracking-tight">Disclaimer</h2>
            <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <MarkdownExcerpt text={sources.disclaimer} />
            </div>
          </section>
        ) : null}

        {sources.readme ? (
          <section className="mt-10 pb-12">
            <h2 className="font-display text-2xl tracking-tight">README</h2>
            <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <MarkdownExcerpt text={sources.readme} />
            </div>
          </section>
        ) : (
          <p className="mt-10 pb-12 text-sm text-subtle">README derzeit nicht geladen.</p>
        )}
      </div>
    </main>
  );
}
