# Flask ML service

ML implementation is pending.

Planned responsibilities:
- Text classification using TF-IDF and Logistic Regression or SVM
- Image-category consistency inference
- A small HTTP API called by the Express backend

Keep model training separate from inference. Add health checks, input validation and tests. The first version may return an explicit not-yet-configured response until a trained model is available; do not fabricate model predictions.
