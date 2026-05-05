from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.repositories.weather_repository import get_weather_data
from app.infrastructure.external.openweather_client import get_forecast

from app.infrastructure.ml.predictor import predict_irradiance
from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices


async def run_pipeline(data):
    try:
        city = data.city

        lat, lon = await get_lat_lon(city)
        weather = await get_weather_data(lat, lon)

        temp = weather.get("temp", 25)
        cloud = weather.get("cloud", 0)
        humidity = weather.get("humidity", 50)

        try:
            irradiance = predict_irradiance({
                "temp": temp,
                "cloud": cloud,
                "humidity": humidity
            })
        except Exception as e:
            print("ML ERROR:", str(e))
            irradiance = 50

        forecast = await get_forecast(lat, lon)
        windows = generate_solar_windows(forecast)
        analysis = generate_analysis(irradiance, cloud, humidity)
        device_plan = optimize_devices(windows, irradiance)

        return {
            "location": city,
            "lat": lat,
            "lon": lon,
            "irradiance": round(irradiance, 2),
            "analysis": analysis,
            "solar_windows": windows,
            "device_plan": device_plan
        }

    except Exception as e:
        print("PIPELINE ERROR:", str(e))
        return {"error": str(e)}