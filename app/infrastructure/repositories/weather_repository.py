from app.infrastructure.external.openweather_client import get_forecast

async def get_weather_data(lat, lon):
    forecast = await get_forecast(lat, lon)

    if "list" not in forecast or len(forecast["list"]) == 0:
        return {
            "temp": 25,
            "cloud": 0,
            "humidity": 50
        }

    first = forecast["list"][0]

    return {
        "temp": first["main"]["temp"],
        "cloud": first["clouds"]["all"],
        "humidity": first["main"]["humidity"]
    }