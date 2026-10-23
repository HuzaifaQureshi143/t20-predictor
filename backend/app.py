"""Flask API that serves the batting and bowling XGBoost models."""

from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request
from xgboost import XGBRegressor


MODEL_DIR = Path(__file__).resolve().parent / "models"

# API field -> (training column name, minimum, maximum).
# The order inside each "inputs" dict must match the training column order.
SPECS = {
    "batting": {
        "file": "batting_model.json",
        "target": "Runs",
        "inputs": {
            "balls": ("Balls", 1, 120),
            "fours": ("Fours", 0, 60),
            "sixes": ("Sixes", 0, 60),
            "strike_rate": ("Strike Rate", 0, 720),
        },
    },
    "bowling": {
        "file": "bowling_model.json",
        "target": "Conceded",
        "inputs": {
            "fours": ("Fours", 0, 24),
            "sixes": ("Sixers", 0, 24),
            "balls": ("Balls", 1, 24),
            "economy": ("Economy", 0, 60),
        },
    },
}


def load_models():
    models = {}

    for name, spec in SPECS.items():
        model = XGBRegressor()
        model.load_model(str(MODEL_DIR / spec["file"]))
        models[name] = model

    return models


MODELS = load_models()

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(status="ok", models=list(SPECS))


@app.post("/predict/<kind>")
def predict(kind):
    spec = SPECS.get(kind)

    if spec is None:
        return jsonify(error=f"Unknown model '{kind}'"), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify(error="Expected a JSON object"), 400

    inputs = spec["inputs"]

    missing = [key for key in inputs if key not in data]
    extra = [key for key in data if key not in inputs]

    if missing or extra:
        return jsonify(
            error="Input mismatch",
            missing=missing,
            extra=extra,
        ), 400

    row = {}

    for key, (column, low, high) in inputs.items():
        value = data[key]

        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return jsonify(error=f"'{key}' must be a number"), 400

        if not low <= value <= high:
            return jsonify(
                error=f"'{key}' must be between {low} and {high}"
            ), 400

        row[column] = float(value)

    prediction = float(
        MODELS[kind].predict(pd.DataFrame([row]))[0]
    )

    return jsonify(
        model=kind,
        target=spec["target"],
        prediction=round(max(prediction, 0.0), 1),
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)