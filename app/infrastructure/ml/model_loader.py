import os
from tensorflow.keras.models import load_model

_model = None


def get_model():
    global _model

    if _model is None:
        BASE_DIR = os.getcwd()
        MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "solar_lstm.h5")

        if not os.path.exists(MODEL_PATH):
            raise Exception(f"Model not found at {MODEL_PATH}")

        _model = load_model(MODEL_PATH, compile=False)
        print("✅ Model loaded successfully")

    return _model