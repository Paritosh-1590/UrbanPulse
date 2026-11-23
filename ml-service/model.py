"""Small local complaint text classifier trained on the bundled synthetic examples."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "training_data.csv"
MODEL_PATH = BASE_DIR / "artifacts" / "urbanpulse-text-classifier.joblib"
DEPARTMENT_BY_CATEGORY = {
    "Roads": "Roads & Infrastructure",
    "Sanitation": "Sanitation",
    "Water": "Water Supply",
    "Electricity": "Electrical",
    "Drainage": "Drainage",
    "Other": "General Services",
}


def load_training_data() -> tuple[list[str], list[str]]:
    texts: list[str] = []
    labels: list[str] = []
    with DATA_PATH.open("r", encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            text = (row.get("text") or "").strip()
            category = (row.get("category") or "").strip()
            if text and category in DEPARTMENT_BY_CATEGORY:
                texts.append(text)
                labels.append(category)
    if len(texts) < 12 or len(set(labels)) < 2:
        raise RuntimeError("The bundled training data is missing or incomplete.")
    return texts, labels


def train_model() -> Pipeline:
    texts, labels = load_training_data()
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), strip_accents="unicode", lowercase=True, stop_words="english", sublinear_tf=True)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    pipeline.fit(texts, labels)
    return pipeline


def get_model() -> Pipeline:
    # Re-train on service start so the model always matches the bundled dataset.
    # Training is intentionally small and local; no pretrained model is downloaded.
    return train_model()


def predict(model: Pipeline, text: str) -> dict[str, Any]:
    clean_text = text.strip()
    if len(clean_text) < 10:
        raise ValueError("Provide at least 10 characters of complaint text.")
    probabilities = model.predict_proba([clean_text])[0]
    best_index = int(probabilities.argmax())
    category = str(model.classes_[best_index])
    return {
        "category": category,
        "confidence": round(float(probabilities[best_index]), 3),
        "department": DEPARTMENT_BY_CATEGORY[category],
        "model": "TF-IDF + Logistic Regression",
    }


if __name__ == "__main__":
    fitted = get_model()
    print(f"Trained classifier on {len(load_training_data()[0])} bundled synthetic examples.")
    for sample in ["The streetlight near my house is broken", "Garbage has not been collected for three days"]:
        print(sample, "->", predict(fitted, sample))
