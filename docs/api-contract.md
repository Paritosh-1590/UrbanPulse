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
| GET | `/complaints` | Authenticated | Citizens see their own; officials see their department; admins see all |
| GET | `/complaints/summary` | Authenticated | Counts visible complaints |
| GET | `/complaints/:id` | Authenticated | Returns record and activity history after permission check |
| GET | `/admin/departments` | Admin/official | Static project department list |
| GET | `/admin/summary` | Admin/official | Counts queue items and evaluates overdue SLA cases |
| GET | `/admin/complaints` | Admin/official | Queue with search and filters |
| PATCH | `/admin/complaints/:id/assign` | Admin | Sets department and optional official |
| PATCH | `/admin/complaints/:id/status` | Admin/assigned official | Enforces status transitions and department scope |
| GET | `/admin/department-officials` | Admin | Lists provisioned staff |
| POST | `/admin/department-officials` | Admin | Creates a department account |

## Complaint fields

Complaint documents include `complaintId`, `title`, `description`, `category`, `location`, `citizen`, `assignedDepartment`, `assignedTo`, `status`, `priority`, `slaDeadline`, `isEscalated`, `escalatedAt`, timestamps and `history`.

Categories: `Roads`, `Sanitation`, `Water`, `Electricity`, `Drainage`, `Other`. Statuses: `Submitted`, `Assigned`, `In Progress`, `Resolved`, `Rejected`.

## Status transitions

- Submitted → Assigned, In Progress, Rejected
- Assigned → In Progress, Rejected
- In Progress → Resolved, Rejected
- Resolved and Rejected are terminal in this implementation.

Department officials can move complaints in their own department to `In Progress` or `Resolved`. Only admins can assign complaints or create department users.

## SLA evaluation

SLA targets are assigned at creation by category and a simple priority rule. The admin summary/queue invokes the escalation service, which marks overdue unresolved complaints once and adds a history entry. There is no scheduled worker, notification sender, or automatic email/SMS integration.
