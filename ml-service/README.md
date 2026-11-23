# UrbanPulse text-classification service

This optional Flask service suggests a civic complaint category from a text description.

## Model

- Vectorizer: TF-IDF word and bigram features.
- Classifier: Logistic Regression with balanced class weights.
- Labels: `Roads`, `Sanitation`, `Water`, `Electricity`, `Drainage`, `Other`.
- Training data: the 48 manually authored examples in `data/training_data.csv`. They are synthetic demonstration examples, not real citizen reports.
- Training: the classifier is trained in memory whenever the Flask app starts. No pretrained model or external API is downloaded.

A probability score is returned as a model confidence estimate. It is not a validated measure of real-world accuracy. The project has no representative labelled test dataset, so it makes no accuracy claim.

## Run on Windows

```powershell
cd ml-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The service binds to `127.0.0.1:8000`.

## Endpoints

- `GET /health`
- `POST /predict/text` with JSON `{ "text": "The streetlight is broken..." }`

The Express API calls this service when `ML_SERVICE_URL` is configured. If the service is down, Express uses its local keyword-based fallback and labels the source accordingly.

## Tests

```powershell
python -m unittest discover -s tests -v
```

For meaningful evaluation, replace or extend the synthetic dataset with appropriately licensed, representative, manually labelled civic complaint text. Keep a separate held-out test set before reporting metrics.
