import os
import joblib

model = None

def load_model():
    global model

    if model is None:
        try:
            BASE_DIR = os.path.dirname(os.path.abspath(__file__))
            MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

            model = joblib.load(MODEL_PATH)
            print("✅ Model loaded")

        except Exception as e:
            print("❌ Model load failed:", str(e))
            model = None


def predict_irradiance(data):
    load_model()

    if model is None:
        return 50  # fallback

    try:
        prediction = model.predict([
            [data["temp"], data["cloud"], data["humidity"]]
        ])
        return float(prediction[0])

    except Exception as e:
        print("Prediction error:", str(e))
        return 50