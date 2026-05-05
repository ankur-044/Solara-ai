# app/application/pipeline.py
from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.external.tomorrow_client import get_tomorrow_weather
from app.infrastructure.external.openweather_client import get_forecast
from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices

# 🔥 SAFE ML WRAPPER
def safe_predict(data):
    try:
        from app.infrastructure.ml.predictor import predict_irradiance
        return predict_irradiance(data)
    except Exception as e:
        print("⚠️ ML ERROR:", str(e))
        return 50.0  # Safe fallback

async def run_pipeline(data_request):
    city = data_request.city
    try:
        # 1. Coordinates (Returns a tuple: lat, lon)
        lat, lon = await get_lat_lon(city)
        if lat is None or lon is None:
            raise Exception("Coordinates not found")

        # 2. Current Weather (Tomorrow.io)
        weather = await get_tomorrow_weather(lat, lon)
        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        uv = weather.get("uv", 0)

        # 3. Current Irradiance Prediction
        irradiance = safe_predict({"temp": temp, "cloud": cloud, "humidity": 50})

        # 4. Forecast Data (OpenWeather) for the Graph
        forecast_response = await get_forecast(lat, lon)
        forecast_list = forecast_response.get("list", [])

        ghi_forecast = []
        for entry in forecast_list[:8]: # Next 24 hours
            dt_txt = entry.get("dt_txt", "")
            time_label = dt_txt.split(" ")[1][:5] if " " in dt_txt else "00:00"
            f_main = entry.get("main", {})
            f_temp = f_main.get("temp", temp)
            f_cloud = entry.get("clouds", {}).get("all", cloud)
            
            # Predict yield for each time slot in the graph
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": 50})
            
            # Keys 't' and 'v' must match Recharts in Dashboard.jsx
            ghi_forecast.append({"t": time_label, "v": round(float(p_yield), 2)})

        # 5. Domain Logic
        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, 50)
        device_plan = optimize_devices(windows, irradiance)

        # ==========================================================
        # CRITICAL: THIS DICTIONARY MUST CONTAIN ALL THESE KEYS
        # ==========================================================
        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": round(float(uv), 1),      # <--- REQUIRED
            "cloud_cover": cloud,                # <--- REQUIRED
            "temperature": round(float(temp), 2), # <--- REQUIRED
            "aod": 0.14,                         # <--- REQUIRED
            "ghi_forecast": ghi_forecast,        # <--- REQUIRED FOR GRAPH
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print(f"❌ PIPELINE ERROR: {str(e)}")
        return {"error": str(e), "location": city}