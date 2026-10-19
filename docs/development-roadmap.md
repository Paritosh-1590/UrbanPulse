# UrbanPulse Development Roadmap

## Initial ownership

- **Paritosh:** initial application foundation, shared visual conventions, admin workflow and later ML integration.
- **Shekhar:** citizen workflow, complaint submission and tracking UI.
- **Yug:** Express backend, authentication, MongoDB models, complaint APIs and SLA logic.

Ownership is by module/file area. Discuss shared-file changes before editing.

## Git workflow

1. `main` should remain runnable.
2. Create one feature branch per task.
3. Pull the latest `main` before creating a branch.
4. Make small, focused commits.
5. Open a pull request and request a teammate review.
6. Do not commit secrets, `.env` files, `node_modules`, Python virtual environments or private uploads.

## First evaluation milestone

- React frontend starts and builds.
- Landing and login pages are present.
- Backend and ML service directories and integration contracts are documented.
- Each teammate contributes a meaningful commit.
- README accurately describes what is implemented versus planned.

## Next implementation sequence

1. Agree on data model and API request/response schemas.
2. Implement backend health check and MongoDB configuration.
3. Implement authentication and complaint APIs.
4. Build citizen and admin workflows against agreed contracts.
5. Train and integrate the text classifier.
6. Add image consistency checks, SLA escalation and map visualization.
7. Run end-to-end tests and prepare the demo.
