# Flux Predictive — Advanced Forecasting Suite

## Overview
A high-performance predictive modeling dashboard built with React and Vite. Features a multi-module architecture including data optimization, model training, and execution interfaces.

## Current State
- **Branding:** Rebranded to "Flux Predictive".
- **Navigation:** Implemented a 3-button dashboard (Train, Run, Optimize).
- **Atlas Data Optimizer:** Fully functional CSV cleaning tool (trims whitespace, removes empty rows).
- **Footer:** Added attribution for Tanishq, Sanika Sadre, AIDS 3rd Year, and C2P2 Initiative.
- **Migration:** Successfully migrated from Replit Agent to Replit. Fixed invalid `database` icon import from lucide-react.

## Tech Stack
- **Frontend:** React 19, Vite 7
- **Styling:** Tailwind CSS 4 with `@tailwindcss/postcss`
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **CSV Processing:** PapaParse

## Project Structure
```
index.html          — Entry point
src/
  main.jsx          — React Mount
  App.jsx           — Dashboard Logic & Modules
  index.css         — Global Styles
public/
  assets/
    background.jpg  — Cinematic Background
vite.config.js      — Port 5000 / allowedHosts: true
postcss.config.js   — Tailwind v4 PostCSS
package.json        — Dependencies
```

## Run Command
The app runs via Vite dev server on port 5000:
```
npm install && npx vite --host 0.0.0.0 --port 5000
```

## Credits
Designed by Tanishq || Sanika Sadre || AIDS 3rd Year || C2P2 Initiative
