# Marine AI Frontend

A React + Vite + TypeScript environmental intelligence dashboard for marine pollution monitoring, cleanup prioritization, and demo-only AI review workflows.

## Overview

This application presents an operational dashboard interface for shoreline monitoring in a marine pollution context. It includes:

- Overview and monitoring summary cards
- Media upload and local preview for a future AI detection workflow
- Interactive hotspot map with risk markers and review filters
- Explainable risk assessment page using a transparent heuristic model
- Detection history with sort, search, and CSV export
- Cleanup planning and task management
- Analytics and printable report views
- Browser-local settings, observations, and cleanup-task persistence

## Demo-only boundary

The backend and AI models are not connected. There are no real inference requests and no live observation API calls. Local observations and tasks are only browser-stored records, not server persistence.

The public landing, About, Contact, Login, and Sign Up pages use the existing Marine AI public-site components. The Login form accepts the frontend demo credentials `demo@marineai.com` / `MarineAI@123`; successful login creates a `sessionStorage` marker for the current tab and opens the dashboard. Logout clears that marker and returns to the public Login page.

This demo login is not secure production authentication. The credentials are embedded in frontend code and the session marker can be changed by a user in browser developer tools. Do not use it to protect real data or as a substitute for server-side authentication.

The app is designed for:

- UI/UX demonstration
- Workflow and interaction prototyping
- Future integration with a backend API layer
- A clearly labeled, user-triggered demonstration dataset

The application starts with empty observation and task lists. On the Settings page, **Load demonstration data** explicitly switches to the bundled sample records, which remain clearly labeled as demonstration data and are kept separate from browser-local records. **Exit demonstration mode** returns to the local records.

Uploading media only creates a local preview. No detection result, confidence, bounding box, location, or risk score is generated because model inference is not available.

## Tech stack

- React 19
- TypeScript
- Vite
- Material UI
- React Router
- Leaflet + React Leaflet
- Chart.js + react-chartjs-2
- date-fns

## Local development

From the project root:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

## Notes for future integration

The current frontend is isolated from production services. The planned future integration boundary includes:

- FastAPI backend service for observation ingestion and persistence
- YOLO11-based debris detection pipeline
- MobileNetV3-Large condition classification
- PostGIS-backed spatial analysis and hotspot queries
- Azure-friendly configuration through a dedicated API client boundary

## Important

Bundled fixture risk scores and classifications appear only when the demonstration dataset is explicitly loaded. The risk assessment page applies an illustrative client-side heuristic and is not a validated scientific model or operational recommendation.
