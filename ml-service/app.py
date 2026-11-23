from __future__ import annotations

from flask import Flask, jsonify, request

from model import get_model, predict

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
model = get_model()


@app.get("/health")
def health():
    return jsonify({"success": True, "service": "UrbanPulse complaint classifier", "model": "TF-IDF + Logistic Regression"})


@app.post("/predict/text")
def predict_text():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text")
    if not isinstance(text, str) or not 10 <= len(text.strip()) <= 2500:
        return jsonify({"success": False, "message": "text must contain between 10 and 2,500 characters."}), 400
    try:
        return jsonify(predict(model, text))
    except ValueError as error:
        return jsonify({"success": False, "message": str(error)}), 400


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"success": False, "message": "Request body is too large."}), 413


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
