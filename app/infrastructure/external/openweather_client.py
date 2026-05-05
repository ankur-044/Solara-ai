import httpx
import os

async def get_forecast(lat, lon):
    API_KEY = os.getenv("OPENWEATHER_API_KEY")

    if not API_KEY:
        print("⚠️ Missing OPENWEATHER_API_KEY")
        return {"list": []}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": API_KEY,
                    "units": "metric"
                }
            )
        return response.json()

    except Exception as e:
        print("OpenWeather error:", str(e))
        return {"list": []}