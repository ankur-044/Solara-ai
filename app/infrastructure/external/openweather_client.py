import httpx
import os

async def get_forecast(lat, lon):
    API_KEY = os.getenv("OPENWEATHER_API_KEY")  # 🔥 move here

    if not API_KEY:
        raise ValueError("OPENWEATHER_API_KEY missing")

    url = "https://api.openweathermap.org/data/2.5/forecast"

    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

        if response.status_code != 200:
            raise Exception(f"OpenWeather API failed: {response.text}")

        return response.json()