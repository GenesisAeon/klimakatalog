import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppProviders } from "@/components/app-providers";
import appCss from "../styles.css?url";

const APP_NAME = "GenesisAeon Klimakatalog";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Katalog der GenesisAeon-Klimapakete. Quellen sind CITATION.cff und README je Repo — keine Universalgleichung.",
      },
      { name: "theme-color", content: "#0b0f0e" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: () => (
    <html
      lang="de"
      className="antialiased"
      suppressHydrationWarning
      style={{ background: "#0b0f0e", color: "#e8eee9" }}
    >
      <head>
        <HeadContent />
      </head>
      <body style={{ background: "#0b0f0e", color: "#e8eee9", minHeight: "100dvh" }}>
        <PreviewHostBridge />
        {/* Platform AuthProvider is a passthrough. This catalog does not use accounts,
            sessions or login (VITE_AUTH_ENABLED=false). Kept for the document shell;
            unused scaffolding, not a planned feature of the Klimakatalog. */}
        <AuthProvider>
          <AppProviders>
            <Outlet />
          </AppProviders>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
  errorComponent: RootError,
});

function RootError({ error }: { error: Error }) {
  return (
    <html lang="de">
      <body style={{ background: "#0b0f0e", color: "#e8eee9", fontFamily: "sans-serif", padding: 24 }}>
        <p style={{ fontSize: 20, margin: 0 }}>Klimakatalog — Anzeige unterbrochen</p>
        <p style={{ color: "#8a948c", marginTop: 8 }}>{error.message}</p>
        <p style={{ marginTop: 16 }}>
          <a href="/" style={{ color: "#9bb5a8" }}>
            Zurück zum Katalog
          </a>
        </p>
      </body>
    </html>
  );
}
