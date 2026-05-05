from app.infrastructure.external.geocoding_client import get_lat_lon
from app.infrastructure.repositories.weather_repository import get_weather_data
from app.infrastructure.external.openweather_client import get_forecast

from app.infrastructure.ml.predictor import predict_irradiance
from app.domain.services.solar_window_service import generate_solar_windows
from app.domain.services.forecasting_service import generate_analysis
from app.domain.services.device_optimizer import optimize_devices


async def run_pipeline(data):
    city = data.city

    # STEP 1: Coordinates
    lat, lon = await get_lat_lon(city)

    # STEP 2: Weather
    weather = await get_weather_data(lat, lon)

    temp = weather.get("temp", 25)
    cloud = weather.get("cloud", 0)
    humidity = weather.get("humidity", 50)

    # STEP 3: AI Prediction
    irradiance = predict_irradiance({
        "temp": temp,
        "cloud": cloud,
        "humidity": humidity
    })

    # STEP 4: Forecast
    forecast = await get_forecast(lat, lon)

    # STEP 5: Solar Windows
    windows = generate_solar_windows(forecast)

    # STEP 6: Analysis
    analysis = generate_analysis(irradiance, cloud, humidity)

    # STEP 7: Device Optimization
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