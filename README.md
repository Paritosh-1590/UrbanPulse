# UrbanPulse

**AI-assisted civic issue reporting and complaint management**
College Mini Project II · Team 28

UrbanPulse is a full-stack academic prototype for reporting civic infrastructure issues, tracking complaint progress, and giving administrators a queue for department assignment and SLA monitoring.

## What is implemented

- Citizen registration and sign-in with hashed passwords and signed bearer tokens.
- Three backend roles: `citizen`, `admin`, and `department_official`. Public registration can only create a citizen account.
- Citizen dashboard, complaint submission, complaint search/filter, and complaint details backed by MongoDB records.
- Administrator queue with search and filters, basic statistics, department assignment, and status updates.
- Department accounts are provisioned by an administrator; department users can see their own department's queue and move assigned cases through permitted statuses.
- Complaint history records submission, classifier suggestion, assignments, status changes, and SLA escalation.
- Category-based SLA deadlines and lazy overdue escalation. Escalation is evaluated when an administrator opens the queue or summary; it is not a background scheduler and it does not send notifications.
- A Python text-classification service using TF-IDF and Logistic Regression, trained locally from the small synthetic examples in `ml-service/data/training_data.csv`.
- A transparent Express keyword-classifier fallback when the optional Python service is not running.
- Secure complaint evidence uploads: up to 3 JPEG, PNG or WebP files per complaint, with local disk storage and authenticated retrieval.

## Important limitations

This is a college demonstration project, not a live municipal service. The ML examples are synthetic and small. Model confidence is not a validated accuracy score, and no real-world performance claim is made. The classifier can suggest a category; the citizen still chooses the category submitted with a complaint. There is no live municipal integration, email/SMS notification, geocoding, map, password reset, refresh-token rotation, or background SLA worker. Complaint evidence uses local server disk, so deployment requires a persistent volume or object-storage integration. The frontend stores the short-lived access token in `localStorage`; this is acceptable for a classroom prototype but a production deployment should move to secure, HttpOnly cookies and add CSRF controls.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Lucide |
| API | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | Node `crypto` scrypt password hashing and HMAC-SHA256 JWT signing |
| AI service | Python, Flask, scikit-learn, TF-IDF, Logistic Regression |

## Project structure

```text
UrbanPulse/
├── client/
│   ├── src/auth/                 # Authentication context
│   ├── src/components/           # Shared UI, sidebar, route guard
│   ├── src/lib/api.js            # API client
│   └── src/pages/                # Landing, auth, citizen and admin pages
├── server/
│   ├── config/                   # Environment configuration
│   ├── middleware/               # JWT authentication and role checks
│   ├── models/                   # User and Complaint Mongoose schemas
│   ├── routes/                   # Auth, AI, citizen complaints and admin APIs
│   ├── services/                 # Password/JWT, classification and SLA logic
│   └── scripts/create-admin.js   # Secure admin bootstrap
├── ml-service/
│   ├── data/training_data.csv    # Synthetic training examples
│   ├── model.py                  # TF-IDF + Logistic Regression
│   ├── app.py                    # Flask inference API
│   └── tests/                    # Model tests
└── docs/                         # API, architecture and implementation notes
```

## Requirements

- Node.js 20.19 or newer (or a current Node.js 22 release) and npm.
- MongoDB Community Server running locally, or a MongoDB Atlas connection string.
- Python 3.10 or newer for the optional ML service.

## 1. Install dependencies

Open a terminal in the extracted `UrbanPulse` folder.

```bash
npm install
cd server
npm install
cd ..
```

The frontend and backend use separate package manifests. Run both install commands once.

## 2. Configure MongoDB and the API

Copy the backend environment template:

**PowerShell**

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/urbanpulse
JWT_SECRET=put-a-random-secret-here-at-least-32-characters-long
JWT_TTL_SECONDS=604800
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
ML_SERVICE_URL=http://127.0.0.1:8000
UPLOAD_DIR=uploads/complaints
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Generate a suitable JWT secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into `JWT_SECRET`. Do not commit `server/.env` or share it publicly. Ensure MongoDB is running before starting the API. For MongoDB Atlas, replace the local connection string with your Atlas URI and keep database credentials private.

## 3. Create the first administrator

In `server/.env`, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. The administrator password must be at least 12 characters. Then run:

```powershell
npm run seed:admin --prefix server
```

The script creates an administrator account if the email is unused. It does not overwrite an existing account. Do not use a sample or shared password for a deployed environment.

Citizens can register themselves using the Create account link. Department official accounts are created from the administrator dashboard. They cannot self-select privileged roles.

## 4. Run the backend

From the project root:

```powershell
npm run dev --prefix server
```

The API listens on `http://localhost:5000`. Check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

The health response includes whether MongoDB is connected. The server exits if it cannot connect to the configured database.

## 5. Run the frontend

Open a second terminal in the project root:

```powershell
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://127.0.0.1:5000`.

## 6. Run the Python ML service (optional but recommended)

Open a third terminal:

```powershell
cd ml-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

The service listens on `http://127.0.0.1:8000`. Check `http://127.0.0.1:8000/health`. Express calls it when `ML_SERVICE_URL` is configured. If it is unavailable or times out, Express returns a rule-based category suggestion and identifies the fallback source in its response.

The ML service trains from 48 hand-written synthetic examples on startup. It is intended to demonstrate the end-to-end model pipeline, not to establish real-world accuracy. To improve it, replace or expand the dataset with appropriately licensed, representative, labelled civic complaints and evaluate it on a held-out real dataset before making any performance claim.

## API overview

All API responses use JSON. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and MongoDB status |
| POST | `/api/auth/register` | Public | Register citizen |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | Signed in | Current account |
| POST | `/api/ai/classify` | Citizen | Suggest complaint category |
| POST | `/api/complaints` | Citizen | Create complaint |
| GET | `/api/complaints` | Signed in | List visible complaints; citizens see only their own |
| GET | `/api/complaints/summary` | Signed in | Visible complaint counts |
| GET | `/api/complaints/:id` | Signed in | Complaint and history, with ownership/department checks |
| GET | `/api/admin/departments` | Admin/official | Department list |
| GET | `/api/admin/summary` | Admin/official | Queue metrics and SLA evaluation |
| GET | `/api/admin/complaints` | Admin/official | Search/filter queue |
| PATCH | `/api/admin/complaints/:id/assign` | Admin | Assign department/official |
| PATCH | `/api/admin/complaints/:id/status` | Admin/assigned official | Change complaint status |
| GET | `/api/admin/department-officials` | Admin | List department users |
| POST | `/api/admin/department-officials` | Admin | Create department user |

Status flow: `Submitted → Assigned → In Progress → Resolved` (or `Rejected` from an open state). Closed complaints cannot be reassigned or reopened through the current UI/API.

## SLA rules

| Category | Default target |
|---|---:|
| Roads | 5 days |
| Sanitation | 2 days |
| Water | 2 days |
| Electricity | 2 days |
| Drainage | 2 days |
| Other | 5 days |

A high-priority report receives a one-day shorter target (minimum one day). These are demo rules and should be described as project-defined targets, not official municipal service commitments. An unresolved report whose deadline has passed is flagged when the admin summary/queue is accessed.

## Testing

From the project root:

```powershell
npm run build
```

Backend built-in unit tests (do not require MongoDB):

```powershell
npm test --prefix server
```

Python classifier tests:

```powershell
cd ml-service
python -m unittest discover -s tests -v
```

MongoDB-backed workflows still need to be tested with a running local/Atlas database: register, sign in, submit a complaint, sign in as admin, assign it, update status, sign in as a department official, and verify permissions. See `docs/demo-checklist.md` for the demonstration flow.

## Troubleshooting

- **API will not start:** confirm MongoDB is running and `server/.env` exists with a valid `MONGODB_URI` and a 32+ character `JWT_SECRET`.
- **Frontend says it cannot reach API:** start the backend on port 5000; keep Vite's proxy URL aligned with it.
- **Browser CORS error:** add the frontend origin to `CLIENT_ORIGIN` in `server/.env`, then restart the API.
- **AI suggestions use the fallback:** confirm the Python service is running at port 8000 and `ML_SERVICE_URL` is set in `server/.env`.
- **Admin login unavailable:** create the first admin with the `seed:admin` procedure. Public registration intentionally creates citizen accounts only.
