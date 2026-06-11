# Pavementa Frontend

The Pavementa frontend is a premium civic-tech SaaS interface for road infrastructure intelligence. It provides the application foundation for dashboards, image intake, reports, map planning, and organisation settings.

Stage 7 connects detection results to the FastAPI report persistence endpoints. Authentication, real maps, PDF export, and custom road-damage model training remain deferred.

## Technology

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- Responsive layout
- Reusable component structure

## Setup

From the `frontend` directory:

```powershell
npm install
Copy-Item .env.local.example .env.local
```

## Run

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── map/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── upload/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── AppShell.tsx
│       ├── BottomNav.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── Header.tsx
│       ├── SeverityBadge.tsx
│       ├── Sidebar.tsx
│       ├── StatCard.tsx
│       └── navigation.ts
├── .env.local.example
├── package.json
└── README.md
```

## Routes

- `/` landing page
- `/dashboard` operational dashboard
- `/upload` image upload and prototype detection UI connected to FastAPI
- `/results` detection results review workspace
- `/reports` searchable Damage Registry backed by the API
- `/reports/[publicId]` detailed official infrastructure report view
- `/map` placeholder GIS map page
- `/settings` organisation settings mock

## Environment

- `NEXT_PUBLIC_API_URL` controls the FastAPI backend URL used by uploads
- `NEXT_PUBLIC_MAPBOX_TOKEN` enables the interactive Mapbox GIS view
