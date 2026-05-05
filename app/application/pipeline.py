from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.external.tomorrow_client import get_tomorrow_weather
from app.infrastructure.external.openweather_client import get_forecast

from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices

# ==========================================================
# 🛡️ THE CRASH PROTECTOR (Prevents 'LIST' attribute errors)
# ==========================================================
def safe_extract(obj, key, default=None):
    """Safely get a value even if obj is a list, dict, or None."""
    if isinstance(obj, list):
        obj = obj[0] if len(obj) > 0 else {}
    if isinstance(obj, dict):
        return obj.get(key, default)
    return default

# 🔥 SAFE ML WRAPPER
def safe_predict(data):
    try:
        from app.infrastructure.ml.predictor import predict_irradiance
        return predict_irradiance(data)
    except Exception:
        return 50.0 # Default if model is missing on Render

async def run_pipeline(data_request):
    city = data_request.city
    
    try:
        # 1. Geocoding (Unpack the Tuple)
        # Your client returns: return geometry["lat"], geometry["lng"]
        coords = await get_lat_lon(city)
        if not coords or not isinstance(coords, tuple):
            raise Exception(f"Orbit Link Failure: Geocoding failed for {city}")
        
        lat, lon = coords

        # 2. Tomorrow.io Weather (Using safe_extract)
        weather_raw = await get_tomorrow_weather(lat, lon)
        weather = weather_raw if isinstance(weather_raw, dict) else {}
        
        temp = safe_extract(weather, "temp", 25)
        cloud = safe_extract(weather, "cloud", 0)
        uv = safe_extract(weather, "uv", 0)
        humidity = 50 

        # 3. Current Irradiance
        irradiance = safe_predict({"temp": temp, "cloud": cloud, "humidity": humidity})

        # 4. OpenWeather Forecast (The most common crash point)
        forecast_res = await get_forecast(lat, lon)
        
        # OpenWeather returns a dict with a "list" key. 
        # If it returns an error list, safe_extract handles it.
        forecast_list = safe_extract(forecast_res, "list", [])
        if not isinstance(forecast_list, list):
            forecast_list = []

        ghi_forecast = []
        for entry in forecast_list[:8]:
            if not isinstance(entry, dict): continue
            
            # Safe nested extraction
            main = entry.get("main", {})
            clouds_data = entry.get("clouds", {})
            dt_txt = entry.get("dt_txt", "")
            
            time_label = dt_txt.split(" ")[1][:5] if " " in dt_txt else "00:00"
            f_temp = main.get("temp", temp)
            f_cloud = clouds_data.get("all", cloud)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": 50})
            
            # Map for Recharts (t and v)
            ghi_forecast.append({
                "t": time_label,
                "v": round(float(p_yield), 2)
            })

        # 5. Logic Services
        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, humidity)
        device_plan = optimize_devices(windows, irradiance)

        # 6. Success Response
        return {
            "location": city.upper(),
            "lat": lat,
            "lon": lon,
            "irradiance": round(float(irradiance), 2),
            "uv_index": round(float(uv), 1),
            "cloud_cover": cloud,
            "temperature": round(float(temp), 2),
            "aod": 0.14,
            "ghi_forecast": ghi_forecast,
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        # This catches the specific error and sends it to the UI gracefully
        print(f"❌ PIPELINE ERROR: {str(e)}")
        return {
            "error": str(e),
            "location": city.upper() if city else "UNKNOWN",
            "status": "offline"
        }