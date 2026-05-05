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

# app/application/pipeline.py

async def run_pipeline(data):
    city = data.city

    try:
        # 1. Get Coordinates
        lat, lon = await get_lat_lon(city)
        if lat is None or lon is None:
            raise Exception(f"Coordinates not found for {city}")

        # 2. Weather Data
        weather = await get_weather_data(lat, lon)
        
        # --- FIX: Handle if weather is a list or a dict ---
        if isinstance(weather, list) and len(weather) > 0:
            weather = weather[0] # Take first item if it's a list
        
        # Safely extract values
        temp = weather.get("temp", 25) if isinstance(weather, dict) else 25
        cloud = weather.get("cloud", 0) if isinstance(weather, dict) else 0
        humidity = weather.get("humidity", 50) if isinstance(weather, dict) else 50
        
        uv_index = round(float(weather.get("uv", temp / 3) if isinstance(weather, dict) else 5.0), 1) 
        aod_value = 0.12 + (humidity / 1000) 

        # 3. ML Prediction
        irradiance = safe_predict({"temp": temp, "cloud": cloud, "humidity": humidity})

        # 4. Forecast Data
        forecast_response = await get_forecast(lat, lon)
        
        # --- FIX: Defensive check for forecast structure ---
        forecast_list = []
        if isinstance(forecast_response, dict):
            forecast_list = forecast_response.get("list", [])
        elif isinstance(forecast_response, list):
            forecast_list = forecast_response

        ghi_forecast = []
        for entry in forecast_list[:8]:
            if not isinstance(entry, dict): continue
            
            time_str = entry.get("dt_txt", "00:00:00").split(" ")[1][:5]
            f_main = entry.get("main", {})
            f_temp = f_main.get("temp", temp)
            f_cloud = entry.get("clouds", {}).get("all", cloud)
            f_hum = f_main.get("humidity", humidity)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": f_hum})
            
            ghi_forecast.append({
                "t": time_str,
                "v": round(float(p_yield), 2)
            })

        # 5. Domain Logic
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
            "ghi_forecast": ghi_forecast,
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print("❌ PIPELINE ERROR:", str(e))
        # Return the error message so the Frontend can show it
        return {
            "error": str(e),
            "location": city
        }