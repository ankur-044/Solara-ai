from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.repositories.weather_repository import get_weather_data
from app.infrastructure.external.openweather_client import get_forecast

from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices


# 🔥 SAFE ML WRAPPER (prevents startup crash)
def safe_predict(data):
    try:
        from app.infrastructure.ml.predictor import predict_irradiance
        return predict_irradiance(data)
    except Exception as e:
        print("⚠️ ML ERROR:", str(e))
        return 50  # fallback value


async def run_pipeline(data):
    city = data.city

    try:
        # =========================
        # STEP 1: Get Coordinates
        # =========================
        lat, lon = await get_lat_lon(city)

        if lat is None or lon is None:
            raise Exception("Invalid coordinates received")

        # =========================
        # STEP 2: Weather Data
        # =========================
        weather = await get_weather_data(lat, lon)

        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        humidity = weather.get("humidity", 50)

        # =========================
        # STEP 3: ML Prediction (SAFE)
        # =========================
        irradiance = safe_predict({
            "temp": temp,
            "cloud": cloud,
            "humidity": humidity
        })

        # =========================
        # STEP 4: Forecast Data
        # =========================
        forecast = await get_forecast(lat, lon)

        # =========================
        # STEP 5: Solar Windows
        # =========================
        windows = generate_solar_windows(forecast)

        # =========================
        # STEP 6: Analysis
        # =========================
        analysis = generate_analysis(irradiance, cloud, humidity)

        # =========================
        # STEP 7: Device Optimization
        # =========================
        device_plan = optimize_devices(windows, irradiance)

        # =========================
        # FINAL RESPONSE
        # =========================
        return {
            "location": city,
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print("❌ PIPELINE ERROR:", str(e))
        return {
            "error": str(e),
            "location": city
        }