# PMAF Tool — Predictive Modelling & Forecasting Intake

## Overview
A web-based data preparation utility built with React and Vite. Users can upload CSV files, clean the data (trim whitespace, remove empty rows), and export the cleaned CSV. Features a glassmorphic UI with animated gradient backgrounds.

## Tech Stack
- **Frontend:** React 18, Vite 7
- **Styling:** Tailwind CSS 4 with `@tailwindcss/postcss`
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **CSV Processing:** PapaParse

## Project Structure
```
index.html          — HTML entry point
src/
  main.jsx          — React DOM mount
  App.jsx           — Main application component
  index.css         — Global styles (Tailwind v4 import)
public/
  assets/
    background.jpg  — Background image
vite.config.js      — Vite config (port 5000, allowedHosts: true)
postcss.config.js   — PostCSS config using @tailwindcss/postcss
tailwind.config.js  — Tailwind content paths
package.json        — Dependencies
```

## Development
The app runs on port 5000 via the "Start application" workflow.

## Replit Configuration Notes
- Vite is configured with `host: '0.0.0.0'`, `port: 5000`, and `allowedHosts: true` for Replit proxy compatibility.
- PostCSS uses `@tailwindcss/postcss` (required for Tailwind v4).
- CSS entry uses `@import "tailwindcss"` (Tailwind v4 syntax).
