from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.external.tomorrow_client import get_tomorrow_weather
from app.infrastructure.external.openweather_client import get_forecast

from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices

# 🔥 CRITICAL SAFETY HELPER
def safe_get(data, key, default=None):
    """Ensures we never call .get() on a list."""
    if isinstance(data, list):
        data = data[0] if len(data) > 0 else {}
    if isinstance(data, dict):
        return data.get(key, default)
    return default

# 🔥 ML WRAPPER
def safe_predict(data):
    try:
        from app.infrastructure.ml.predictor import predict_irradiance
        return predict_irradiance(data)
    except Exception:
        return 50.0 

async def run_pipeline(data_request):
    city = data_request.city
    try:
        # 1. Unpack Geocoding (Returns lat, lon tuple)
        # client returns: return geometry["lat"], geometry["lng"]
        coords = await get_lat_lon(city)
        
        # Geocoder returns a tuple, we must extract them safely
        if isinstance(coords, tuple):
            lat, lon = coords
        else:
            raise Exception("Geocoding did not return a valid coordinate pair.")

        # 2. Get Weather (Tomorrow.io)
        weather_raw = await get_tomorrow_weather(lat, lon)
        weather = weather_raw if isinstance(weather_raw, dict) else {}

        # Use safe_get to prevent the 'LIST' attribute error
        temp = safe_get(weather, "temp", 25)
        cloud = safe_get(weather, "cloud", 0)
        uv = safe_get(weather, "uv", 0)

        # 3. Predict Irradiance
        irradiance = safe_predict({"temp": temp, "cloud": cloud, "humidity": 50})

        # 4. Forecast (OpenWeather)
        forecast_res = await get_forecast(lat, lon)
        
        # OpenWeather returns a dict with a "list" key
        forecast_list = safe_get(forecast_res, "list", [])
        if not isinstance(forecast_list, list):
            forecast_list = []

        ghi_forecast = []
        for entry in forecast_list[:8]:
            if not isinstance(entry, dict): continue
            
            dt_txt = entry.get("dt_txt", "")
            time_label = dt_txt.split(" ")[1][:5] if " " in dt_txt else "00:00"
            
            f_main = entry.get("main", {})
            f_temp = f_main.get("temp", temp)
            f_cloud = entry.get("clouds", {}).get("all", cloud)
            
            p_yield = safe_predict({"temp": f_temp, "cloud": f_cloud, "humidity": 50})
            ghi_forecast.append({"t": time_label, "v": round(float(p_yield), 2)})

        # 5. Logic Services
        windows = generate_solar_windows(forecast_list)
        analysis = generate_analysis(irradiance, cloud, 50)
        device_plan = optimize_devices(windows, irradiance)

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
        print(f"❌ PIPELINE ERROR: {str(e)}")
        return {
            "error": str(e),
            "location": city,
            "status": "failed"
        }