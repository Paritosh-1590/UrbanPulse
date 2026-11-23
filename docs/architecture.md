# UrbanPulse architecture

## Components

- **React/Vite client:** landing page, citizen registration/login, citizen complaint reporting/tracking, and admin/department workspace.
- **Express API:** validates request data, resolves authenticated users, enforces roles/ownership, and coordinates complaint lifecycle and SLA logic.
- **MongoDB/Mongoose:** users and complaint documents. Complaint records embed status/activity history.
- **Optional Flask ML service:** TF-IDF + Logistic Regression inference from a bundled synthetic dataset. The API falls back to a transparent keyword classifier when the service is unavailable.

## Request paths

1. Citizen signs up or signs in. Passwords are stored as salted scrypt hashes; the API signs an HMAC-SHA256 bearer token.
2. Frontend includes the bearer token in protected API requests.
3. Express validates the token and reloads the user from MongoDB before applying role/department restrictions.
4. Citizen complaint creation validates fields, assigns a project-defined priority and SLA deadline, and writes a history entry.
5. Category suggestion is requested through Express, which calls Flask when configured or uses the local keyword fallback.
6. Admin reviews the queue, assigns a department/official and changes complaint status. Assigned officials can update their department's cases.
7. Accessing admin summary/queue checks for expired unresolved SLA targets and records one escalation history event per complaint.

## Security notes and limitations

Passwords are never stored in plaintext. Admin and department roles cannot be self-selected through public registration. The API checks complaint ownership and department membership server-side. The project uses a browser-stored bearer token and a small in-memory auth rate limiter; production deployment would require secure cookie sessions, CSRF protection, persistent rate limiting, audit hardening, log redaction, and deployment-specific security review.

No municipal database or notification provider is integrated. SLA escalation is evaluated on admin reads rather than by a background scheduler. The bundled classifier dataset is synthetic and is not sufficient for a real-world performance claim.
