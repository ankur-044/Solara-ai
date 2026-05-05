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

# app/application/pipeline.py

async def run_pipeline(data):
    city = data.city

    try:
        lat, lon = await get_lat_lon(city)
        if lat is None or lon is None:
            raise Exception("Invalid coordinates")

        weather = await get_weather_data(lat, lon)
        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        humidity = weather.get("humidity", 50)
        
        uv_index = round(float(weather.get("uv", temp / 3)), 1) 
        aod_value = 0.12 + (humidity / 1000) 

        irradiance = safe_predict({"temp": temp, "cloud": cloud, "humidity": humidity})

        # =========================
        # FIX: OpenWeather returns a dict with a "list" key
        # =========================
        forecast_response = await get_forecast(lat, lon)
        
        # OpenWeather structure is usually {"list": [...]} 
        # We need to extract that list for the graph to work
        forecast_list = forecast_response.get("list", []) if isinstance(forecast_response, dict) else []
        
        ghi_forecast = []
        # Take the next 8 points (approx 24 hours)
        for entry in forecast_list[:8]:
            time_str = entry.get("dt_txt", "").split(" ")[1][:5]
            f_temp = entry.get("main", {}).get("temp", temp)
            f_cloud = entry.get("clouds", {}).get("all", cloud)
            f_hum = entry.get("main", {}).get("humidity", humidity)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": f_hum})
            
            # CRITICAL: Keys must match Dashboard.jsx (t and v)
            ghi_forecast.append({
                "t": time_str,
                "v": round(float(p_yield), 2)
            })

        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, humidity)
        device_plan = optimize_devices(windows, irradiance)

        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": uv_index,
            "cloud_cover": cloud,
            "temperature": temp,
            "aod": round(aod_value, 2),
            "ghi_forecast": ghi_forecast, # This now contains 't' and 'v'
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print("❌ PIPELINE ERROR:", str(e))
        return {"error": str(e), "location": city}