import httpx
import os

async def get_lat_lon(city: str):
    API_KEY = os.getenv("OPENCAGE_API_KEY")

    if not API_KEY:
        raise ValueError("OPENCAGE_API_KEY missing")

    url = f"https://api.opencagedata.com/geocode/v1/json"

    params = {
        "q": city,
        "key": API_KEY
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        data = response.json()

    if data.get("status", {}).get("code") != 200:
        raise Exception(f"OpenCage API error: {data.get('status')}")

    results = data.get("results")
    if not results:
        raise Exception(f"No results found for city: {city}")

    geometry = results[0]["geometry"]

    return geometry["lat"], geometry["lng"]