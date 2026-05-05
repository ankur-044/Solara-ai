import requests
from app.core.config import TOMORROW_API_KEY

async def get_tomorrow_weather(lat, lon):
    url = f"https://api.tomorrow.io/v4/weather/realtime?location={lat},{lon}&apikey={TOMORROW_API_KEY}"

    response = requests.get(url)
    data = response.json()

    print("Tomorrow API Response:", data)  # DEBUG

    values = data.get("data", {}).get("values", {})

    return {
        "cloud": values.get("cloudCover", 0),
        "temp": values.get("temperature", 0),
        "uv": values.get("uvIndex", 0)
    }