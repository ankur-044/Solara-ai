import numpy as np
from app.infrastructure.ml.model_loader import get_model

def predict_irradiance(weather):
    model = get_model()

    temp = weather.get("temp", 25)
    cloud = weather.get("cloud", 50)
    humidity = weather.get("humidity", 50)

    # clamp values
    temp = max(0, min(50, temp))
    cloud = max(0, min(100, cloud))
    humidity = max(0, min(100, humidity))

    # ✅ CORRECT SHAPE (1, 3)
    input_data = np.array([[temp, cloud, humidity]])

    prediction = model.predict(input_data)

    return float(prediction[0][0])