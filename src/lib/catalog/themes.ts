import type { ThemeId } from "./types";

export const THEMES: { id: ThemeId; label: string; blurb: string }[] = [
  {
    id: "kryosphaere",
    label: "Kryosphäre",
    blurb: "Gletscher, Permafrost, Schnee, Eisschelfe",
  },
  { id: "ozean", label: "Ozean", blurb: "Zirkulation, Versauerung, Korallen, Hitzewellen" },
  {
    id: "biosphaere",
    label: "Biosphäre",
    blurb: "Wälder, Biodiversität, Bestäuber, invasive Arten",
  },
  {
    id: "atmosphaere",
    label: "Atmosphäre",
    blurb: "Wolkenfeedback, Aerosole, Methan",
  },
  {
    id: "hydrologie",
    label: "Hydrologie",
    blurb: "Peak Water, Speicher, Bodenfeuchte",
  },
  {
    id: "extreme",
    label: "Extreme & Kaskaden",
    blurb: "Kipppunkte, Brände, Hochwasser, Compound",
  },
  {
    id: "gesellschaft",
    label: "Gesellschaft & Anpassung",
    blurb: "Kosten, Governance, Gesundheit, Städte",
  },
  {
    id: "kohlenstoff",
    label: "Kohlenstoff",
    blurb: "Senken, Permafrost-C, Ruß-Albedo",
  },
];

export const THEME_LABEL: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((t) => [t.id, t.label]),
) as Record<ThemeId, string>;
