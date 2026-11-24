```text
   ______           __                       
  / ____/___ ______/ /__  ____  ________     
 / /   / __ `/ __  / _ \/ __ \/ ___/ _ \     
/ /___/ /_/ / /_/ /  __/ / / / /__/  __/     
\____/\__,_/\__,_/\___/_/ /_/\___/\___/      
```

> Lightweight habit tracker with GitHub-style contribution heatmaps, local JSON persistence, and a frosted glass UI.

---

### Overview

Cadence is a local, privacy-first habit tracking application. It replicates GitHub's contribution matrix to visualize daily consistency across individual habits and combined activity.

- **Zero dependencies**: Vanilla JavaScript, pure SVG rendering, CSS3.
- **Low footprint**: ~15-20 MB RAM in standalone mode, 0 MB when closed.
- **Local persistence**: Direct read/write to `data.json` via a lightweight background worker. No telemetry, no accounts.

---

### Features

- **GitHub Contribution Matrix**: 53-week rolling calendar rendered in pure SVG, accurate weekday offsets (Mon/Wed/Fri labels), and month alignment.
- **Individual & Global Views**: Global activity heatmap alongside dedicated sub-trackers for each habit.
- **Single-Click Log**: Instant completion toggle with synthetic Web Audio feedback.
- **Custom Palettes**: Claude Terracotta, GitHub Classic Green, Amber, and Azure.
- **Data Integrity**: State is stored locally in `data.json` and mirrored in `localStorage`. Code updates never overwrite existing logs.
- **Full Export/Import**: Portable JSON backups.

---

### Quick Start

#### Option 1: Standalone Window (Recommended on Windows)
Run `Lancer-Cadence.bat`. It starts the local persistence server and opens a dedicated borderless window via Edge App mode.

```cmd
Lancer-Cadence.bat
```

#### Option 2: Browser / Python Server
Start the local server manually:

```bash
python server.py
```
Then navigate to `http://localhost:5050`.

#### Option 3: Static File
Open `index.html` directly in any modern browser. Data will persist in `localStorage`.

---

### Project Structure

```text
Cadence/
├── index.html          # Main application structure
├── styles.css          # Frosted glass design system & layout
├── app.js              # Application logic, SVG generator, audio engine
├── server.py           # Atomic JSON persistence server (Python stdlib)
├── data.json           # Habit definitions and logged history
├── Lancer-Cadence.bat  # 1-click Windows launcher
├── manifest.json       # PWA manifest
└── sw.js               # Service Worker for offline capability
```

---

### Data Format (`data.json`)

Data is stored in plain JSON:

```json
{
  "habits": [
    {
      "id": "h1",
      "name": "Meditation",
      "emoji": "🧘",
      "color": "terracotta",
      "desc": "10 min morning session"
    }
  ],
  "logs": {
    "h1": {
      "2026-11-23": true,
      "2026-11-24": true
    }
  },
  "settings": {
    "theme": "glass",
    "palette": "terracotta",
    "sound": true
  }
}
```

---

### Shortcuts

| Key | Action |
| --- | --- |
| `Esc` | Close any open modal or context menu |
| `Right-Click` | Open habit quick-action menu (Validate, Edit, Delete) |

---

### License

MIT
