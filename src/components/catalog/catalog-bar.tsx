import { Github } from "lucide-react";
import { LocaleSwitch } from "@/components/catalog/locale-switch";

export function CatalogBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">GenesisAeon</p>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <LocaleSwitch />
        <a
          href="https://github.com/GenesisAeon"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <Github className="size-4" />
          github.com/GenesisAeon
        </a>
      </div>
    </div>
  );
}
