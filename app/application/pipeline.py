from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.repositories.weather_repository import get_weather_data
from app.infrastructure.external.openweather_client import get_forecast

from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices

# Helper to force any object into a dictionary to prevent '.get' crashes
def ensure_dict(obj):
    if isinstance(obj, dict):
        return obj
    if isinstance(obj, list) and len(obj) > 0:
        # If it's a list, take the first element and check again
        return ensure_dict(obj[0])
    return {}

# 🔥 SAFE ML WRAPPER
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
            raise Exception(f"Coordinates not found for {city}")

        # =========================
        # STEP 2: Weather Data
        # =========================
        weather_raw = await get_weather_data(lat, lon)
        
        # CRITICAL FIX: Force weather to be a dict before any .get calls
        weather = ensure_dict(weather_raw)

        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        humidity = weather.get("humidity", 50)
        
        # Safe extraction for UV
        raw_uv = weather.get("uv")
        if raw_uv is None:
            raw_uv = temp / 3 # Logical fallback
        uv_index = round(float(raw_uv), 1) 
        
        aod_value = 0.12 + (humidity / 1000) 

        # =========================
        # STEP 3: ML Prediction
        # =========================
        irradiance = safe_predict({
            "temp": temp,
            "cloud": cloud,
            "humidity": humidity
        })

        # =========================
        # STEP 4: Forecast Data
        # =========================
        forecast_response = await get_forecast(lat, lon)
        
        # OpenWeather returns a dict with a "list" key
        if isinstance(forecast_response, dict):
            forecast_list = forecast_response.get("list", [])
        elif isinstance(forecast_response, list):
            forecast_list = forecast_response
        else:
            forecast_list = []

        ghi_forecast = []
        for entry in forecast_list[:8]:
            # Ensure the entry inside the list is a dict
            clean_entry = ensure_dict(entry)
            if not clean_entry: continue
            
            # Extract time string safely
            dt_txt = clean_entry.get("dt_txt", "2024-01-01 00:00:00")
            time_str = dt_txt.split(" ")[1][:5] if " " in dt_txt else "00:00"
            
            f_main = ensure_dict(clean_entry.get("main", {}))
            f_clouds = ensure_dict(clean_entry.get("clouds", {}))
            
            f_temp = f_main.get("temp", temp)
            f_cloud = f_clouds.get("all", cloud)
            f_hum = f_main.get("humidity", humidity)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": f_hum})
            
            # Mapped specifically for Recharts (t and v)
            ghi_forecast.append({
                "t": time_str,
                "v": round(float(p_yield), 2)
            })

        # =========================
        # STEP 5, 6, 7: Domain Logic
        # =========================
        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, humidity)
        device_plan = optimize_devices(windows, irradiance)

        # =========================
        # FINAL CLEAN RESPONSE
        # =========================
        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": uv_index,
            "cloud_cover": cloud,
            "temperature": temp,
            "aod": round(aod_value, 2),
            "ghi_forecast": ghi_forecast,
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print(f"❌ PIPELINE FATAL ERROR: {str(e)}")
        return {
            "error": str(e),
            "location": city,
            "status": "failed"
        }