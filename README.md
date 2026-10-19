# UrbanPulse

**AI-Powered Civic Issue Reporting and Auto-Escalation System**

UrbanPulse is a college mini project designed to help citizens report civic issues, track complaint progress, and help department administrators manage complaints. The planned system uses machine learning to classify complaints, rules to assess urgency, and SLA-based escalation for overdue complaints.

## Current status

This repository contains the initial frontend foundation:
- Responsive, editorial-style landing page
- Login page UI (not connected to authentication yet), using a restrained forest-green and lime palette
- React + Vite setup
- Initial architecture and API contract documentation

Authentication, database persistence, complaint submission, ML inference, and SLA escalation are not implemented yet.

## Planned stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- ML service: Python + Flask + scikit-learn
- Mapping: Leaflet or Google Maps (to be selected)

## Run the frontend

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build check

```bash
npm run build
```

## Project structure

```text
UrbanPulse/
├── client/                 # React frontend
├── server/                 # Planned Express backend
├── ml-service/             # Planned Flask inference service
└── docs/                   # Architecture and API notes
```

## Team workflow

Create feature branches from `main` and use pull requests. Avoid editing the same shared files concurrently. See `docs/development-roadmap.md`.

## Security note

The current login form is only a UI prototype. Do not enter real credentials. Do not commit `.env` files, API keys, passwords, or private user data.
