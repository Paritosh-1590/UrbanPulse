# UrbanPulse next steps

## Completed in the current implementation

- React citizen workflow connected to the Express API.
- MongoDB user and complaint models.
- Citizen registration/login and JWT-based role checks.
- Admin queue, assignment, department-user provisioning and status lifecycle.
- Complaint status history and category/priority-based SLA deadlines.
- Admin-read-triggered overdue escalation.
- Python TF-IDF + Logistic Regression category suggestion with keyword fallback.

## Recommended improvements after the mini-project submission

1. Add automated integration tests using a disposable MongoDB instance or Testcontainers.
2. Replace synthetic ML examples with a representative, licensed dataset; evaluate per-class precision/recall and confusion matrix on held-out reports.
3. Add image upload with file type/size validation and safe object storage.
4. Add map coordinates and geocoding with a privacy-aware location flow.
5. Move authentication to Secure, HttpOnly, SameSite cookies; add CSRF protection, token rotation and account recovery.
6. Move SLA evaluation to a scheduled worker and introduce an explicit notification provider only after credentials and consent requirements are defined.
7. Add pagination controls, stronger audit logging and deployment configuration.
