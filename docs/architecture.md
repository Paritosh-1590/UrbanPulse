# UrbanPulse architecture

## Components

- **React/Vite client:** landing page, citizen registration/login, citizen complaint reporting/tracking, admin/department workspace, interactive geographic location picker, and civic issue complaint map.
- **Express API:** validates request data, resolves authenticated users, enforces roles/ownership, coordinates complaint lifecycle and SLA logic, and serves filtered geo-tagged complaint data.
- **MongoDB/Mongoose:** users and complaint documents. Complaint records embed status/activity history and optional GeoJSON `geoLocation` with a sparse 2dsphere index.
- **Interactive Maps & Tiles:** Leaflet and React-Leaflet render interactive maps using OpenStreetMap (OSM) raster tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Optional Flask ML service:** TF-IDF + Logistic Regression inference from a bundled synthetic dataset. The API falls back to a transparent keyword classifier when the service is unavailable.

## Request paths

1. Citizen signs up or signs in. Passwords are stored as salted scrypt hashes; the API signs an HMAC-SHA256 bearer token.
2. Frontend includes the bearer token in protected API requests.
3. Express validates the token and reloads the user from MongoDB before applying role/department restrictions.
4. Citizen complaint creation validates fields, assigns a project-defined priority and SLA deadline, validates optional geographic coordinates, and writes a history entry.
5. Category suggestion is requested through Express, which calls Flask when configured or uses the local keyword fallback.
6. Admin reviews the queue or opens the interactive issue map, assigns a department/official and changes complaint status. Assigned officials can update their department's cases and view only their department's geo-tagged points.
7. Accessing admin summary/queue/map checks for expired unresolved SLA targets and records one escalation history event per complaint.

## Geographic data and map architecture

- **Coordinate representation:** Stored as an optional GeoJSON Point field named `geoLocation` with coordinates in `[longitude, latitude]` order. Validated strictly on input (longitude between -180 and 180, latitude between -90 and 90).
- **Text-only compatibility:** Coordinates are optional; textual location remains mandatory. Existing and text-only reports persist without dummy coordinates and display an accessible fallback card on details views.
- **Role visibility and privacy:** The dedicated `/api/admin/map-complaints` endpoint enforces server-side department scoping for department officials (`assignedDepartment = req.user.department`) while allowing administrators to query all departments. Citizen personal identifying information (name, email) is excluded from map marker payloads to prevent data leakage in popups.
- **Browser geolocation:** Browser geolocation is not polled automatically, adhering to the API's `Permissions-Policy: geolocation=()` header. Pin placement is entirely user-driven through map click-to-place and marker drag interactions.
- **Map tiles and attribution:** OpenStreetMap tiles are consumed directly with standard attribution (`&copy; OpenStreetMap contributors`) in accordance with the OpenStreetMap Tile Usage Policy. No external paid map keys or geocoding credentials are required.

## Security notes and limitations

Passwords are never stored in plaintext. Admin and department roles cannot be self-selected through public registration. The API checks complaint ownership and department membership server-side. The project uses a browser-stored bearer token and a small in-memory auth rate limiter; production deployment would require secure cookie sessions, CSRF protection, persistent rate limiting, audit hardening, log redaction, and deployment-specific security review.

No municipal database or notification provider is integrated. SLA escalation is evaluated on admin reads rather than by a background scheduler. The bundled classifier dataset is synthetic and is not sufficient for a real-world performance claim.
