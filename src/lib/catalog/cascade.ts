/**
 * Reale, verifizierte Querverbindungen zwischen GenesisAeon-Klimapaketen.
 *
 * Kompiliert aus den tatsächlichen Paket-Texten (Docstrings, README,
 * DISCLAIMER) -- keine erfundenen/spekulativen Kanten. Jeder Cluster und
 * jede Kante trägt eine kurze Begründung, WO die Verbindung tatsächlich
 * dokumentiert ist, nicht nur eine thematische Ähnlichkeit.
 *
 * Bewusst kein vollständiger Graph über alle ~90 Klimapakete -- nur die
 * Verbindungen, die in mindestens einem Paket selbst real belegt sind.
 * Wird erweitert, sobald neue Pakete neue echte Querverweise bringen
 * (siehe LITERATURE_WATCH.md im Workspace-Root für die laufende Pflege).
 */

export type ClusterId =
  | "marine-physiology"
  | "landuse-biodiversity-driver"
  | "glacier-cryosphere"
  | "intervention-despite-decline"
  | "polar-system";

export type Cluster = {
  id: ClusterId;
  label: string;
  packageNames: string[];
  note: string;
};

export const CLUSTERS: Cluster[] = [
  {
    id: "marine-physiology",
    label: "Marine Physiologie",
    packageNames: [
      "ocean-deoxygenation-utac",
      "coral-reef-utac",
      "marine-heatwave-utac",
      "marine-compound-stressors-utac",
      "ocean-acidification-utac",
    ],
    note: "marine-compound-stressors-utac (P124) ist der explizite Verbinder über den Metabolic Index (Deutsch et al. 2015), koppelt ocean-deoxygenation/coral-reef/marine-heatwave. ocean-acidification-utac (P122) und P124 beschreiben denselben Versauerungstrend aus zwei Blickwinkeln (Planetary-Boundary- vs. Compound-Event-Statistik).",
  },
  {
    id: "landuse-biodiversity-driver",
    label: "Landnutzung & Biodiversitätstreiber",
    packageNames: [
      "amazon-utac",
      "freshwater-ecosystem-stressors-utac",
      "mixed-forest-resilience-utac",
      "biodiversity-utac",
      "climate-landuse-biodiversity-nexus-utac",
    ],
    note: "climate-landuse-biodiversity-nexus-utac (P126) ist der explizite Verbinder über das offizielle IPBES-Nexus-Treiber-Framework, ordnet amazon/freshwater/mixed-forest/biodiversity ihrem jeweiligen Haupttreiber zu.",
  },
  {
    id: "glacier-cryosphere",
    label: "Gletscher & Kryosphäre",
    packageNames: [
      "glacier-buffer-utac",
      "glacier-buffer-replacement-utac",
      "glacial-seismicity-utac",
      "paraglacial-hazard-utac",
      "distributed-buffer-resilience-utac",
      "glacier-legacy-contaminants-utac",
      "tropical-glacier-ecosystem-rle-utac",
    ],
    note: "tropical-glacier-ecosystem-rle-utac (P123) erweitert den Puffer-Verlust-Mechanismus der Gletscher-Serie in Richtung IUCN-RLE-Kollaps-Diagnostik.",
  },
  {
    id: "intervention-despite-decline",
    label: "Gezielte Maßnahmen wirken trotz Gesamtrückgang",
    packageNames: ["coral-reef-utac", "biodiversity-utac", "assisted-gene-flow-utac"],
    note: "Dieselbe reale Befundform in drei Paketen (Walker et al. 2023 für coral-reef, Simkins et al. 2025 für biodiversity, prospektiv/interventionell für assisted-gene-flow) -- bisher nicht gegenseitig verlinkt in den Paketen selbst.",
  },
  {
    id: "polar-system",
    label: "Polares System",
    packageNames: ["antarctic-ice-shelf-utac", "arctic-climate-utac", "polar-biodiversity-utac"],
    note: "Explizites Geschwister-Trio, nach demselben Verfahren gebaut (sechs parallele unabhängige Recherchen pro Paket). arctic-climate-utac vergleicht sich durchgehend strukturell mit antarctic-ice-shelf-utac (Grönland- vs. Antarktis-Massenverlustmechanismus, SAM-Kontroverse vs. Antarktis-Polarwirbel-Analogie-Versagen). Echte Autoren-Verbindung: Aku Riihelä ko-autiert sowohl die Antarktis- als auch die Arktis-Meereis-Albedo-Studie.",
  },
];

export type CrossClusterEdgeType =
  | "CONTRAST"
  | "ASSOCIATED_NON_OVERLAPPING";

export type CrossClusterEdge = {
  from: string;
  to: string;
  type: CrossClusterEdgeType;
  note: string;
};

export const CROSS_CLUSTER_EDGES: CrossClusterEdge[] = [
  {
    from: "black-carbon-albedo-utac",
    to: "arctic-climate-utac",
    type: "CONTRAST",
    note: "Explizit unterschiedliche Geographie (Tibetisches Hochland vs. Arktis), keine Überschneidung -- im Arctic-Paket dokumentiert.",
  },
  {
    from: "black-carbon-albedo-utac",
    to: "antarctic-ice-shelf-utac",
    type: "CONTRAST",
    note: "Explizit unterschiedliche Geographie (Tibetisches Hochland vs. Antarktische Halbinsel) -- im Antarctic-Paket dokumentiert.",
  },
  {
    from: "el-nino-amplification-utac",
    to: "antarctic-ice-shelf-utac",
    type: "ASSOCIATED_NON_OVERLAPPING",
    note: "Gleiches Oberthema (ENSO), dokumentierte bewusste Nicht-Überschneidung im ENSO-Modul von antarctic-ice-shelf-utac.",
  },
  {
    from: "marine-heatwave-utac",
    to: "antarctic-ice-shelf-utac",
    type: "ASSOCIATED_NON_OVERLAPPING",
    note: "Gleiche Abgrenzung wie oben, dokumentiert im ENSO-Modul von antarctic-ice-shelf-utac.",
  },
];

export const EDGE_TYPE_LABEL: Record<CrossClusterEdgeType, string> = {
  CONTRAST: "Explizit gegenübergestellt",
  ASSOCIATED_NON_OVERLAPPING: "Gleiches Thema, dokumentiert nicht überschneidend",
};

/** All clusters a given package name belongs to. */
export function clustersForPackage(name: string): Cluster[] {
  return CLUSTERS.filter((c) => c.packageNames.includes(name));
}

/** All cross-cluster edges touching a given package name. */
export function edgesForPackage(name: string): CrossClusterEdge[] {
  return CROSS_CLUSTER_EDGES.filter((e) => e.from === name || e.to === name);
}
