# UrbanPulse API contract

API prefix: `/api`. Ordinary request and response bodies are JSON. Successful responses are `{ "success": true, "data": ... }`; errors are `{ "success": false, "message": "..." }`.

Protected endpoints require `Authorization: Bearer <JWT>`. The JWT identifies the account; authorization is resolved from the user record in MongoDB on each request. A role or user ID in a frontend request is never used as authority.

| Method | Endpoint | Access | Implemented behaviour |
|---|---|---|---|
| GET | `/health` | Public | API and MongoDB status |
| POST | `/auth/register` | Public | Creates a citizen account |
| POST | `/auth/login` | Public | Issues a signed token |
| GET | `/auth/me` | Authenticated | Returns current user |
| POST | `/ai/classify` | Citizen | Calls Flask model or keyword fallback |
| POST | `/complaints` | Citizen | Validates and persists complaint |
| GET | `/complaints/:id/images/:imageId` | Authenticated | Serves evidence only after the existing complaint ownership/department check |
| GET | `/complaints` | Authenticated | Citizens see their own; officials see their department; admins see all |
| GET | `/complaints/summary` | Authenticated | Counts visible complaints |
| GET | `/complaints/:id` | Authenticated | Returns record and activity history after permission check |
| GET | `/admin/departments` | Admin/official | Static project department list |
| GET | `/admin/summary` | Admin/official | Counts queue items and evaluates overdue SLA cases |
| GET | `/admin/complaints` | Admin/official | Queue with search and filters |
| GET | `/admin/map-complaints` | Admin/official | Filtered complaints with coordinates for map view (omits citizen PII) |
| PATCH | `/admin/complaints/:id/assign` | Admin | Sets department and optional official |
| PATCH | `/admin/complaints/:id/status` | Admin/assigned official | Enforces status transitions and department scope |
| GET | `/admin/department-officials` | Admin | Lists provisioned staff |
| POST | `/admin/department-officials` | Admin | Creates a department account |

## Complaint fields

Complaint documents include `complaintId`, `title`, `description`, `category`, `location`, `geoLocation`, `citizen`, `assignedDepartment`, `assignedTo`, `status`, `priority`, `slaDeadline`, `isEscalated`, `escalatedAt`, timestamps and `history`.

`geoLocation` is an optional GeoJSON Point field: `{ type: "Point", coordinates: [longitude, latitude] }`. Coordinates must have valid finite values with longitude between -180 and 180 degrees and latitude between -90 and 90 degrees. A sparse `2dsphere` index is maintained in MongoDB. Submissions without coordinates persist with `geoLocation: null`.

`POST /api/complaints` accepts existing JSON or `multipart/form-data`. Geographic coordinates may be supplied via `geoLocation` (GeoJSON object or serialized JSON string) or discrete `latitude` and `longitude` fields. Multipart submissions may repeat files in the `images` field. Maximum: 3 JPEG/PNG/WebP files, 5 MB each. The server validates signatures and stores binary evidence under `UPLOAD_DIR`; MongoDB stores opaque keys and image metadata. Protected evidence is fetched by the frontend with bearer authentication.

Categories: `Roads`, `Sanitation`, `Water`, `Electricity`, `Drainage`, `Other`. Statuses: `Submitted`, `Assigned`, `In Progress`, `Resolved`, `Rejected`.

## Status transitions

- Submitted → Assigned, In Progress, Rejected
- Assigned → In Progress, Rejected
- In Progress → Resolved, Rejected
- Resolved and Rejected are terminal in this implementation.

Department officials can move complaints in their own department to `In Progress` or `Resolved`. Only admins can assign complaints or create department users.

## SLA evaluation

SLA targets are assigned at creation by category and a simple priority rule. The admin summary/queue invokes the escalation service, which marks overdue unresolved complaints once and adds a history entry. There is no scheduled worker, notification sender, or automatic email/SMS integration.
