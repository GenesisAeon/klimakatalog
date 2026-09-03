import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEMES } from "@/lib/catalog/themes";
import type { CatalogFilters } from "@/lib/catalog/filter";
import type { ClimatePackage, ThemeId } from "@/lib/catalog/types";
import { displayTitle, packageCode } from "@/lib/catalog/parse-citation";

export function FilterBar({
  filters,
  packages,
  onChange,
}: {
  filters: CatalogFilters;
  packages: ClimatePackage[];
  onChange: (next: CatalogFilters) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-12">
      <label className="relative md:col-span-5">
        <span className="sr-only">Suche</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Suche nach Paket, Thema, Autor, DOI…"
          className="pl-10"
        />
      </label>

      <div className="md:col-span-3">
        <Select
          value={filters.theme}
          onValueChange={(value) =>
            onChange({ ...filters, theme: value as ThemeId | "alle" })
          }
        >
          <SelectTrigger aria-label="Themenfilter">
            <SelectValue placeholder="Thema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Themen</SelectItem>
            {THEMES.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-3">
        <Select
          value={filters.selected || "alle"}
          onValueChange={(value) =>
            onChange({ ...filters, selected: value === "alle" ? "" : value })
          }
        >
          <SelectTrigger aria-label="Paket wählen">
            <SelectValue placeholder="Paket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Pakete</SelectItem>
            {packages.map((pkg) => (
              <SelectItem key={pkg.name} value={pkg.name}>
                {packageCode(pkg.packageNumber)} · {displayTitle(pkg.name, pkg.title)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex md:col-span-1">
        <Button
          type="button"
          variant={filters.bridge === "ohne" ? "default" : "secondary"}
          className="w-full min-w-[7.5rem] px-2 text-xs leading-tight md:min-w-0"
          onClick={() =>
            onChange({
              ...filters,
              bridge: filters.bridge === "ohne" ? "alle" : "ohne",
            })
          }
          aria-pressed={filters.bridge === "ohne"}
          title="Nur Pakete ohne UTAC-Brücke"
        >
          ohne UTAC
        </Button>
      </div>

      {(filters.query || filters.theme !== "alle" || filters.selected || filters.bridge !== "alle") && (
        <div className="md:col-span-12">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ query: "", theme: "alle", selected: "", bridge: "alle" })
            }
          >
            <X className="size-3.5" />
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  );
}
