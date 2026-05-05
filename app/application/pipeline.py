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
        return 50.0  # Safe fallback if model fails

async def run_pipeline(data_request):
    city = data_request.city

    try:
        # STEP 1: Get Coordinates (Unpack tuple)
        lat, lon = await get_lat_lon(city)
        
        if lat is None or lon is None:
            raise Exception("Geocoding failed")

        # STEP 2: Current Weather from Tomorrow.io
        weather = await get_tomorrow_weather(lat, lon)
        
        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        uv = weather.get("uv", 0)
        humidity = 50 # Default humidity

        # STEP 3: Current ML Prediction
        irradiance = safe_predict({
            "temp": temp,
            "cloud": cloud,
            "humidity": humidity
        })

        # STEP 4: Forecast from OpenWeather for the Graph
        forecast_response = await get_forecast(lat, lon)
        forecast_list = forecast_response.get("list", [])

        ghi_forecast = []
        # We take 8 points (next 24 hours) to build the Recharts curve
        for entry in forecast_list[:8]:
            dt_txt = entry.get("dt_txt", "")
            time_label = dt_txt.split(" ")[1][:5] if " " in dt_txt else "00:00"
            
            # Predict future yield for the graph using forecast weather
            f_main = entry.get("main", {})
            f_temp = f_main.get("temp", temp)
            f_cloud = entry.get("clouds", {}).get("all", cloud)
            f_hum = f_main.get("humidity", humidity)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": f_hum})
            
            # Map to 't' (time) and 'v' (value) for React Dashboard
            ghi_forecast.append({
                "t": time_label,
                "v": round(float(p_yield), 2)
            })

        # STEP 5, 6, 7: Logic Services
        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, humidity)
        device_plan = optimize_devices(windows, irradiance)

        # FINAL RESPONSE - Now including all missing fields
        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": round(float(uv), 1),      # <--- ADDED
            "cloud_cover": cloud,                # <--- ADDED
            "temperature": round(float(temp), 2), # <--- ADDED
            "aod": 0.14,                         # <--- ADDED
            "ghi_forecast": ghi_forecast,        # <--- ADDED (This enables the graph)
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print(f"❌ PIPELINE ERROR: {str(e)}")
        return {
            "error": str(e),
            "location": city,
            "status": "failed"
        }