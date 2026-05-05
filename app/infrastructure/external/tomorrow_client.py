import httpx
import os

async def get_tomorrow_weather(lat, lon):
    API_KEY = os.getenv("TOMORROW_API_KEY")

    if not API_KEY:
        raise ValueError("TOMORROW_API_KEY missing")

    url = "https://api.tomorrow.io/v4/weather/realtime"

    params = {
        "location": f"{lat},{lon}",
        "apikey": API_KEY
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        data = response.json()

    values = data.get("data", {}).get("values", {})

    return {
        "cloud": values.get("cloudCover", 0),
        "temp": values.get("temperature", 0),
        "uv": values.get("uvIndex", 0)
    }