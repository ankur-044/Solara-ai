from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.external.tomorrow_client import get_tomorrow_weather
from app.infrastructure.external.openweather_client import get_forecast

from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices


# =========================================================
# SAFE EXTRACTOR
# =========================================================
def safe_extract(obj, key, default=None):
    """
    Prevents:
    'list' object has no attribute 'get'
    """

    if isinstance(obj, list):
        obj = obj[0] if len(obj) > 0 else {}

    if isinstance(obj, dict):
        return obj.get(key, default)

    return default


# =========================================================
# SAFE ML PREDICTOR
# =========================================================
def safe_predict(data):
    try:
        from app.infrastructure.ml.predictor import predict_irradiance
        return predict_irradiance(data)

    except Exception as e:
        print("ML ERROR:", e)
        return 50.0


# =========================================================
# MAIN PIPELINE
# =========================================================
async def run_pipeline(data_request):

    city = data_request.city

    try:

        # =================================================
        # 1. GEOCODING
        # =================================================
        coords = await get_lat_lon(city)

        if not coords:
            raise Exception(f"Geocoding failed for {city}")

        if isinstance(coords, tuple):
            lat, lon = coords

        elif isinstance(coords, dict):
            lat = coords.get("lat")
            lon = coords.get("lon")

        elif isinstance(coords, list) and len(coords) > 0:
            first = coords[0]

            if isinstance(first, dict):
                lat = first.get("lat")
                lon = first.get("lon")
            else:
                raise Exception("Invalid geocoding list format")

        else:
            raise Exception("Invalid geocoding response")

        # =================================================
        # 2. TOMORROW.IO WEATHER
        # =================================================
        weather_raw = await get_tomorrow_weather(lat, lon)

        weather = weather_raw if isinstance(weather_raw, dict) else {}

        temp = safe_extract(weather, "temp", 25)
        cloud = safe_extract(weather, "cloud", 0)
        uv = safe_extract(weather, "uv", 0)

        humidity = safe_extract(weather, "humidity", 50)

        # =================================================
        # 3. IRRADIANCE PREDICTION
        # =================================================
        irradiance = safe_predict({
            "temp": temp,
            "cloud": cloud,
            "humidity": humidity
        })

        # =================================================
        # 4. OPENWEATHER FORECAST
        # =================================================
        forecast_res = await get_forecast(lat, lon)

        forecast_list = safe_extract(
            forecast_res,
            "list",
            []
        )

        if not isinstance(forecast_list, list):
            forecast_list = []

        # =================================================
        # 5. GHI FORECAST
        # =================================================
        ghi_forecast = []

        for entry in forecast_list[:8]:

            if not isinstance(entry, dict):
                continue

            main_data = entry.get("main", {})
            cloud_data = entry.get("clouds", {})
            dt_txt = entry.get("dt_txt", "")

            time_label = (
                dt_txt.split(" ")[1][:5]
                if " " in dt_txt
                else "00:00"
            )

            f_temp = main_data.get("temp", temp)
            f_cloud = cloud_data.get("all", cloud)

            predicted_yield = safe_predict({
                "temp": f_temp,
                "cloud": f_cloud,
                "humidity": 50
            })

            ghi_forecast.append({
                "t": time_label,
                "v": round(float(predicted_yield), 2)
            })

        # =================================================
        # 6. BUSINESS LOGIC
        # =================================================

        # ---------- SOLAR WINDOWS ----------
        try:

            windows = generate_solar_windows(
                forecast_list
            )

            if not isinstance(windows, list):
                windows = []

        except Exception as e:

            print("WINDOW ERROR:", e)
            windows = []

        # ---------- ANALYSIS ----------
        try:

            analysis = generate_analysis(
                irradiance,
                cloud,
                humidity
            )

            if not isinstance(analysis, dict):

                analysis = {
                    "summary": "Analysis unavailable"
                }

        except Exception as e:

            print("ANALYSIS ERROR:", e)

            analysis = {
                "summary": "Analysis unavailable"
            }

        # ---------- DEVICE PLAN ----------
        try:

            device_plan = optimize_devices(
                windows,
                irradiance
            )

            if not isinstance(device_plan, list):
                device_plan = []

        except Exception as e:

            print("DEVICE PLAN ERROR:", e)
            device_plan = []

        # =================================================
        # 7. SUCCESS RESPONSE
        # =================================================
        return {

            "location": city.upper(),

            "lat": lat,
            "lon": lon,

            "irradiance": round(
                float(irradiance),
                2
            ),

            "uv_index": round(
                float(uv),
                1
            ),

            "cloud_cover": cloud,

            "temperature": round(
                float(temp),
                2
            ),

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
            "location": city.upper() if city else "UNKNOWN",
            "status": "offline"
        }