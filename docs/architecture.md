# UrbanPulse Architecture (Initial)

## System boundary

UrbanPulse is a responsive web application for civic issue reporting. It is not intended to integrate with live municipal systems in the initial prototype.

## Planned components

- **React client:** landing page, authentication UI, citizen reporting and tracking, administrator dashboard and map.
- **Express API:** authentication/authorization, complaint lifecycle, department routing, SLA management and API orchestration.
- **MongoDB:** users, complaints, department mappings, SLA configuration and status history.
- **Flask ML service:** text classification and image-category consistency inference.
- **Image storage:** local storage during development or a cloud object store if needed.

## Request flow

1. The client submits a complaint to Express.
2. Express validates the request and asks the ML service for predictions when available.
3. Express applies routing and urgency rules and persists the complaint.
4. The client retrieves complaint status through Express.
5. A backend job detects overdue complaints and records escalation.

## Current implementation status

Only the initial React landing page and login UI are implemented. Authentication, database persistence, ML inference, SLA escalation and complaint workflows are planned work.
