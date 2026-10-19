# Initial API Contract

This document is a starting agreement for frontend/backend work. It is not a claim that the endpoints are implemented.

## Conventions

- API prefix: `/api`
- JSON for ordinary request/response bodies.
- Use HTTP status codes appropriately.
- Authenticated routes will use a bearer JWT.
- Never trust role, department, urgency or ownership values supplied by the client without server-side validation.

## Planned endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Citizen registration |
| POST | `/api/auth/login` | Login and token issuance |
| GET | `/api/complaints` | List complaints visible to current user |
| POST | `/api/complaints` | Submit a complaint |
| GET | `/api/complaints/:id` | Read complaint and history |
| PATCH | `/api/complaints/:id/status` | Authorized status update |
| GET | `/api/admin/complaints` | Admin complaint queue |
| GET | `/api/admin/summary` | Admin summary metrics |
| GET | `/api/admin/complaints/map` | Map-ready complaint locations |

## Planned ML service endpoints

- `GET /health`
- `POST /predict/text`
- `POST /predict/image-consistency`

Exact request and response schemas should be agreed before implementation.
