import httpx
import os

async def get_lat_lon(city: str):
    API_KEY = os.getenv("OPENCAGE_API_KEY")

    if not API_KEY:
        raise ValueError("OPENCAGE_API_KEY missing")

    url = "https://api.opencagedata.com/geocode/v1/json"

    params = {
        "q": city,
        "key": API_KEY
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"OpenCage HTTP error: {response.text}")

    data = response.json()

    # 🔥 DEBUG (important)
    print("GEOCODE RESPONSE:", data)

    if data.get("status", {}).get("code") != 200:
        raise Exception(f"OpenCage API error: {data.get('status')}")

    results = data.get("results")

    if not results:
        raise Exception(f"No results for city: {city}")

    geometry = results[0]["geometry"]

    return geometry["lat"], geometry["lng"]