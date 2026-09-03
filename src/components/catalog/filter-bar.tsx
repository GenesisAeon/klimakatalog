import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { CLUSTERS, type ClusterId } from "@/lib/catalog/cascade";
import { THEMES } from "@/lib/catalog/themes";
import { EMPTY_FILTERS, type CatalogFilters } from "@/lib/catalog/filter";
import type { ClimatePackage, ThemeId } from "@/lib/catalog/types";
import { displayTitle, packageCode } from "@/lib/catalog/parse-citation";
import { useLocale } from "@/lib/i18n/locale";

export function FilterBar({
  filters,
  packages,
  onChange,
}: {
  filters: CatalogFilters;
  packages: ClimatePackage[];
  onChange: (next: CatalogFilters) => void;
}) {
  const { t } = useLocale();
  const hasActive =
    filters.query ||
    filters.theme !== "alle" ||
    filters.cluster !== "alle" ||
    filters.selected ||
    filters.bridge !== "alle";
  return (
    <div className="grid gap-3 md:grid-cols-12">
      <label className="relative md:col-span-4">
        <span className="sr-only">{t.search}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder={t.searchPlaceholder}
          className="pl-10"
        />
      </label>

      <div className="md:col-span-2">
        <NativeSelect
          aria-label={t.themeFilter}
          value={filters.theme}
          onChange={(e) => onChange({ ...filters, theme: e.target.value as ThemeId | "alle" })}
        >
          <option value="alle">{t.allThemes}</option>
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {t.themes[theme.id]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="md:col-span-3">
        <NativeSelect
          aria-label={t.clusterFilter}
          value={filters.cluster}
          onChange={(e) =>
            onChange({ ...filters, cluster: e.target.value as ClusterId | "alle" })
          }
        >
          <option value="alle">{t.allClusters}</option>
          {CLUSTERS.map((cluster) => (
            <option key={cluster.id} value={cluster.id}>
              {cluster.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="md:col-span-2">
        <NativeSelect
          aria-label={t.pickPackage}
          value={filters.selected || "alle"}
          onChange={(e) =>
            onChange({ ...filters, selected: e.target.value === "alle" ? "" : e.target.value })
          }
        >
          <option value="alle">{t.allPackages}</option>
          {packages.map((pkg) => (
            <option key={pkg.name} value={pkg.name}>
              {packageCode(pkg.packageNumber)} · {displayTitle(pkg.name, pkg.title)}
            </option>
          ))}
        </NativeSelect>
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
          title={t.withoutUtacTitle}
        >
          {t.withoutUtac}
        </Button>
      </div>

      {hasActive ? (
        <div className="md:col-span-12">
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            <X className="size-3.5" />
            {t.resetFilters}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
