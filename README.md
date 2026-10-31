# Rebel Repair

> **Weltraum-Reparaturspiel am Rande der Galaxis**

Ein humorvolles 2D-PWA-Spiel, in dem du als Reparaturstation-Betreiber alte Raumschiffe wieder flugtchtig machst. Diagnostiziere Fehlfunktionen, repariere mit den richtigen Ersatzteilen und teste die Schiffe in einem Action-geladenen Testflug.

![Rebel Repair](https://img.shields.io/badge/Status-Prototyp-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## ber das Spiel

### Spielidee
Du betreibst **Rebel Repair**, eine Reparaturstation am Rand der Galaxis. Deine Aufgabe: Alte, kaputte Raumschiffe wieder flugtchtig machen. Jeder Kunde bringt sein Schiff mit spezifischen Problemen zu dir, und du musst:

1. **Die Symptome analysieren** - Der Kunde beschreibt, was nicht funktioniert
2. **Die Ursache diagnostizieren** - Untersuche das Schiff und finde heraus, was wirklich kaputt ist
3. **Das richtige Ersatzteil auswhlen** - Whle aus deinem Lager das passende Teil
4. **Testflug absolvieren** - Beweise, dass das Schiff wieder funktioniert
5. **Belohnung kassieren** - Erhalte Credits und verbessere deine Statistik

### Humor & Stil
Das Spiel ist mit deutschem Technik-Nerdhumor gefllt:
- "Der Hersteller untersttzt den Bordcomputer nicht mehr. Der Rest des Schiffs funktioniert noch einwandfrei."
- "Fehlermeldung: Segmentation Fault (Core Dumped)"
- "Plasma-Gerusche aus dem Antrieb"

### Spielumfang (Prototyp)
- 3 Schiffstypen: Galaxie-Spher, Lastesel 3000, Rebellen-Jger
- 3 Fehlerarten: Antriebsstottern, Waffenfehlfunktion, Bordcomputer-Crash
- 6 Ersatzteile mit Lagerverwaltung
- 30-Sekunden-Testflug mit Hindernissen und Feinden
- Credits-System mit Belohnungen und Kosten
- Spielstand-Speicherung mit Export/Import

## Installation & Start

### Voraussetzungen
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Repository klonen
git clone https://github.com/linuXamer/rebel-repair.git
cd rebel-repair

# Abhngigkeiten installieren
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Das Spiel ist dann unter `http://localhost:3000` verfgbar.

### Produktions-Build erstellen

```bash
npm run build
```

Die gebaute Version findet sich im `dist/` Ordner.

### Tests ausfhren

```bash
npm test
```

### TypeScript-Prfung

```bash
npm run typecheck
```

### Icons generieren (optional)

```bash
npm run generate-icons
```

## Bedienung

### Tastatur

| Taste | Aktion |
|-------|--------|
| W /  | Nach vorne bewegen |
| A /  | Nach links bewegen |
| S /  | Nach hinten bewegen |
| D /  | Nach rechts bewegen |
| Leertaste | Schieen |
| ESC | Zurck / Men |

### Touch (Mobile)
- **Linke Bildschirmhlfte**: Bewegungssteuerung (Berhren und ziehen)
- **Rechte Bildschirmhlfte**: Schieen (Tippen)
- **Buttongs**: Alle UI-Elemente sind touch-optimiert

### Maus
- Klicken auf Buttons und Menpunkte
- Mausbewegung fr Hover-Effekte

## PWA-Funktionen

### Offline-Betrieb
- Das Spiel ldt alle bentigten Ressourcen beim ersten Besuch
- Danach ist es vollstndig offline spielbar
- Service Worker sorgt fr schnelles Laden und Offline-Funktionalitt

### Installation
1. ffne das Spiel in Chrome, Edge oder einem anderen PWA-kompatiblen Browser
2. Klicke auf das Installations-Icon in der Adressleiste
3. Besttige die Installation
4. Das Spiel kann nun als eigenständige App gestartet werden

### Updates
- Bei neuen Versionen wird ein Hinweis angezeigt
- Klicke auf den Hinweis, um die neue Version zu laden
- Ein laufender Testflug wird nicht unterbrochen

## Spielmechanik

### Auftragsablauf

1. **Auftrag annehmen**
   - Whle einen verfügbaren Auftrag aus der Liste
   - Jeder Auftrag hat ein Schiff, ein Problem und eine Belohnung

2. **Diagnose durchfhren**
   - Der Kunde beschreibt die Symptome seines Schiffs
   - Du erhältst Untersuchungshinweise
   - Whle die richtige Fehlerursache (Antrieb, Waffen, Bordcomputer)
   - Falsche Diagnosen sind korrigierbar

3. **Reparatur durchfhren**
   - Whle ein passendes Ersatzteil aus deinem Lager
   - Bezahle das Teil mit deinen Credits
   - Das Teil wird aus deinem Lager entfernt

4. **Testflug absolvieren**
   - Steuere das Schiff durch einen 30-Sekunden-Parcours
   - Weiche Hindernissen aus
   - Schiee auf Feinde
   - Sammle Bonuspunkte ein
   - berlebe bis zum Ende

5. **Auftrag abschlieen**
   - Erhalte die Belohnung
   - Die Belohnung hängt von deinem Testflug-Ergebnis ab
   - Statistik wird aktualisiert
   - Neuer Auftrag wird freigeschaltet

### Wirtschaftssystem

- **Credits**: Whrung des Spiels
  - Start: 5.000 Credits
  - Belohnungen: 1.000 - 5.000+ Credits pro Auftrag
  - Kosten: Ersatzteile kosten 300 - 2.000 Credits

- **Ersatzteile**: Lagerverwaltung
  - Jedes Teil hat einen Lagerbestand
  - Teile werden nach dem Kauf verbraucht
  - Neue Teile können durch erfolgreiche Missionen freigeschaltet werden

- **Preise**: Dynamische Belohnungen
  - Belohnung hängt von Schiffswert und Fehler-Schwierigkeit ab
  - Bonus für schnelle und präzise Testflüge
  - Strafe für falsche Reparaturen

### Diagnose-System

Jeder Fehler hat einzigartige Symptome und Hinweise:

| Fehler | Symptome | Richtige Diagnose |
|--------|----------|-------------------|
| Antriebsstottern | Ruckeln, Plasma-Gerusche, berhitzung | Antrieb |
| Waffenfehlfunktion | Schsse daneben, berhitzung, Zielcomputer-Fehler | Waffen |
| Bordcomputer-Crash | Systemabstrze, Fehlermeldungen, Datenverlust | Bordcomputer |

### Testflug-Bewertung

- **Punkte**: Sammle Punkte durch:
  - berleben (Grundpunkte)
  - Feinde zerstören (+50 Punkte)
  - Sammelbare Items (+100 Punkte)
  - Unversehrtes Schiff (+500 Punkte)

- **Zeit**: 30 Sekunden pro Testflug
- **Gesundheit**: Schiffshülle basierend auf dem Schiffstyp
- **Steuerung**: Unterschiedliche Geschwindigkeit und Wendigkeit pro Schiff

## Technische Details

### Architektur

```
src/
├── assets/           # Grafiken, Sounds
│   ├── images/
│   └── sounds/
├── data/            # Spiel-Daten
│   ├── ships.ts     # Schiffstypen
│   ├── faults.ts    # Fehlerarten
│   ├── parts.ts     # Ersatzteile
│   └── missions.ts  # Missions-Generierung
├── game/           # Spiel-Logik
│   ├── GameStateManager.ts  # Spielstand-Verwaltung
│   └── TestFlight.ts        # Testflug-Logik
├── types/          # TypeScript-Typen
│   └── index.ts
├── ui/             # Benutzeroberfläche
│   └── Renderer.ts  # PIXI.js-Renderer
└── utils/          # Hilfsfunktionen
    └── storage.ts   # Spielstand-Speicherung
```

### Technologie-Stack

| Komponente | Technologie |
|------------|-------------|
| Framework | Vite + TypeScript |
| Rendering | PIXI.js (WebGL) |
| Audio | Howler.js |
| Build | Vite |
| Tests | Vitest |
| PWA | Service Worker API |

### Dateistruktur

```
rebel-repair/
├── public/               # Statische Dateien
│   ├── manifest.json     # PWA-Manifest
│   ├── sw.js             # Service Worker
│   └── icons/            # App-Icons
├── src/                  # Quellcode
│   ├── assets/           # Assets
│   ├── data/             # Spiel-Daten
│   ├── game/             # Spiel-Logik
│   ├── types/            # Typen
│   ├── ui/               # UI
│   ├── utils/            # Utilities
│   ├── main.ts           # Haupteinstiegspunkt
│   └── style.css         # Styles
├── tests/                # Tests
├── scripts/              # Build-Skripte
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Bekannte Einschränkungen

### Prototyp-Status
- **Grafik**: Einfache Platzhalter-Grafiken (PIXI.js-Formen)
- **Sound**: Keine Soundeffekte implementiert (Howler.js ist bereit)
- **Animationen**: Grundlegende Animationen, keine komplexen Effekte
- **Balance**: Belohnungen und Kosten sind noch nicht perfekt ausbalanciert
- **Content**: Begrenzte Anzahl an Schiffen, Fehlern und Teilen

### Technische Einschränkungen
- **Service Worker**: Funktioniert nur in Produktions-Build
- **Offline**: Erst nach dem ersten vollständigen Laden verfügbar
- **Touch**: Optimiert für Tablets, aber auch auf kleinen Bildschirmen spielbar
- **Performance**: Auf sehr alten Geräten könnte es zu Performance-Problemen kommen

### Nicht implementierte Features
- **Multiplayer**: Kein Online-Multiplayer
- **Crafting**: Kein komplexes Crafting-System
- **Open World**: Keine offene Welt, nur lineare Missionen
- **Upgrades**: Keine Werkstatt-Upgrades
- **Story**: Keine durchgehende Storyline

## Beitragen

### Entwicklungsrichtlinien

1. **TypeScript**: Immer Typen verwenden
2. **Tests**: Neue Funktionen sollten mit Tests abgedeckt sein
3. **Code-Style**: ESLint-konform
4. **Commits**: Klare, beschreibende Commit-Nachrichten
5. **Branches**: Feature-Branches für größere Änderungen

### Build & Test

```bash
# TypeScript prüfen
npm run typecheck

# Tests ausführen
npm test

# Tests mit Coverage
npm test -- --coverage

# Produktions-Build
npm run build
```

### Debugging

- **Browser DevTools**: F12 oder Ctrl+Shift+I
- **Vite Dev Server**: Hot Module Replacement (HMR)
- **TypeScript Errors**: Werden direkt in der Konsole angezeigt

## Lizenz

MIT License - Siehe [LICENSE](LICENSE) Datei.

## Danksagungen

- **PIXI.js**: Für das schnelle 2D-Rendering
- **Howler.js**: Für die Audio-Unterstützung
- **Vite**: Für das schnelle Build-System
- **TypeScript**: Für die Typsicherheit

## Changelog

### v1.0.0 (Prototyp)
- Grundlegender Spielablauf implementiert
- 3 Schiffstypen, 3 Fehlerarten, 6 Ersatzteile
- Diagnose-System mit Hinweisen
- Testflug mit Hindernissen und Feinden
- Credits-System und Lagerverwaltung
- Spielstand-Speicherung mit Export/Import
- PWA-Funktionen (Offline, Installation, Updates)
- Touch- und Tastatur-Steuerung
- Responsive Design
- Automatisierte Tests

---

**Viel Spaß beim Reparieren!** 

*"Der Hersteller unterstützt dieses Spiel nicht mehr. Der Rest funktioniert noch einwandfrei."*
