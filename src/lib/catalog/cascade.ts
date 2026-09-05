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
      "mountain-governance-adaptation-utac",
      "black-carbon-albedo-utac",
      "freshwater-ecosystem-stressors-utac",
      "landscape-restoration-hydrology-utac",
      "urban-green-infrastructure-utac",
      "glacier-legacy-contaminants-utac",
      "snowpack-elevation-warming-utac",
      "tropical-glacier-ecosystem-rle-utac",
      "glacier-microbiome-succession-utac",
    ],
    note: "Die explizit im Ökosystem selbst so benannte 'P99-P103-Serie' (glacier-buffer -> glacier-buffer-replacement, 'companion to P99' -> distributed-buffer-resilience, 'companion to P99 and P100'), mit mountain-governance-adaptation-utac (P104) als selbstbezeichnetem 'governance/institutional closing chapter of the P99-P103 series'. black-carbon-albedo-utac (P105) ist explizit 'a new atmospheric-deposition lens on the P99-P104 series'. freshwater-ecosystem-stressors-utac (P106) ist explizit 'the ecological bridge between the P99-P102 physical series and the P103-P104 resilience/governance series'. landscape-restoration-hydrology-utac (P107) 'extends the P99/P103 distributed-buffer series'; urban-green-infrastructure-utac (P108) ist explizit 'companion to landscape-restoration-hydrology-utac (P107)'. glacier-legacy-contaminants-utac (P109) 'bridges glacier-buffer-utac (P99), black-carbon-albedo-utac (P105), and freshwater-ecosystem-stressors-utac (P106)'. snowpack-elevation-warming-utac (P110) 'quantifies distributed-buffer-resilience-utac's (P103) unquantified snow buffer category and extends glacier-buffer-utac's (P99) peak-water framing'. tropical-glacier-ecosystem-rle-utac (P123) erweitert den Puffer-Verlust-Mechanismus in Richtung IUCN-RLE-Kollaps-Diagnostik. glacier-microbiome-succession-utac (P129) benennt sich selbst als verwandt zu, aber unterschieden von, P99/P106/P123 (siehe sein eigenes relative_change_honesty_check-Modul) -- dokumentiert die Physikochemie und das Mikrobiom des Gletscherbachs selbst, nicht Abflussmenge, Ökosystem-Stress oder RLE-Status. Alle Zitate stammen wörtlich aus den jeweiligen Paket-Abstracts.",
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
  {
    from: "black-carbon-albedo-utac",
    to: "aerosol-masking-utac",
    type: "CONTRAST",
    note: "black-carbon-albedo-utac (P105) beschreibt sich selbst explizit als Kontrast zu aerosol-masking-utac's (P88) globalem Kühleffekt -- Ruß erwärmt/verdunkelt lokal, Sulfat-Aerosole kühlen global durch Maskierung.",
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
