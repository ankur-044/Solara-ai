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


# app/application/pipeline.py

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

        # Extract values for the Dashboard metrics
        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        humidity = weather.get("humidity", 50)
        
        # Calculate UV and AOD (Estimate if your API doesn't provide them)
        # Usually, UV is ~GHI / 25. AOD is usually ~0.1 to 0.3
        uv_index = round(float(weather.get("uv", temp / 3)), 1) 
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
        # STEP 4: Forecast Data (For the Graph)
        # =========================
        forecast_raw = await get_forecast(lat, lon)
        
        # Transform raw forecast into the 'ghi_forecast' array for the Recharts graph
        # This assumes forecast_raw is a list of objects with 'dt_txt' and 'main'
        ghi_forecast = []
        if isinstance(forecast_raw, list):
            for entry in forecast_raw[:8]:  # Get next 8 intervals (approx 24h)
                time_str = entry.get("dt_txt", "").split(" ")[1][:5] # Get "HH:mm"
                # Use your ML model to predict yield for each future time slot
                f_temp = entry.get("main", {}).get("temp", temp)
                f_cloud = entry.get("clouds", {}).get("all", cloud)
                f_hum = entry.get("main", {}).get("humidity", humidity)
                
                predicted_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": f_hum})
                
                ghi_forecast.append({
                    "time": time_str,
                    "yield": round(float(predicted_yield), 2)
                })

        # =========================
        # STEP 5: Solar Windows
        # =========================
        windows = generate_solar_windows(forecast_raw)

        # =========================
        # STEP 6: Analysis
        # =========================
        analysis = generate_analysis(irradiance, cloud, humidity)

        # =========================
        # STEP 7: Device Optimization
        # =========================
        device_plan = optimize_devices(windows, irradiance)

        # =========================
        # FINAL UPDATED RESPONSE
        # =========================
        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": uv_index,          # <--- ADDED
            "cloud_cover": cloud,         # <--- ADDED
            "temperature": temp,          # <--- ADDED
            "aod": round(aod_value, 2),   # <--- ADDED
            "ghi_forecast": ghi_forecast, # <--- ADDED (This enables the graph)
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