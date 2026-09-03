# klimakatalog

[![GenesisAeon](https://img.shields.io/badge/GenesisAeon-Katalog-blue)](https://github.com/GenesisAeon)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Editorialer Katalog der [GenesisAeon](https://github.com/GenesisAeon)-Klimapakete.

Jedes Paket steht für ein eigenes, zitierbares Stück Klimawissenschaft. Quellen
sind `CITATION.cff`, README und — wo vorhanden — `WHITEPAPER.md` je Repository,
nicht eine Universalgleichung.

Die Oberfläche gruppiert Pakete nach Themen (Kryosphäre, Ozean, Biosphäre, …),
trennt **Paket-DOI** (Zenodo/CITATION) von **Quellen-DOIs** (zitierte Studien)
und kennzeichnet Pakete ohne UTAC/CREP/AFET-Bridge als reine Zitat-Wissenschaft.

Live-Daten kommen von der GitHub-API mit einem lokalen CITATION.cff-Kern als
Offline-Fallback.

## Lokal starten

Voraussetzung: Node.js 22+.

```bash
git clone https://github.com/GenesisAeon/klimakatalog.git
cd klimakatalog
npm install
npm run dev
```

Die App läuft dann unter <http://localhost:8080>.

```bash
npm run build      # Produktions-Build
npm test           # inkl. Parser-Tests gegen echte CITATION.cff-Dateien
npm run typecheck
```

## Was dieser Katalog nicht ist

Kein Fachpaket und keine Simulations-Engine. Modelle, Daten und Grenzen stehen
in den jeweiligen Repos unter [github.com/GenesisAeon](https://github.com/GenesisAeon).

## Auth (derzeit ungenutzt)

Das Scaffolding unter `src/lib/auth` (better-auth, PGlite) ist **nicht aktiv**.
Es gibt keine Konten, keine Login-Seite und keine serverseitige Nutzerdaten.

Belassen für mögliche spätere Funktionen (gespeicherte Listen, Kommentare,
Kuratierung der Paket-Daten) — nicht Teil des aktuellen Katalogs.

## Lizenz

[MIT](LICENSE). Passend zum Rest des GenesisAeon-Ökosystems.
