import httpx
import os

async def get_lat_lon(city: str):
    API_KEY = os.getenv("OPENCAGE_API_KEY")

    if not API_KEY:
        print("⚠️ Missing OPENCAGE_API_KEY")
        return 0.0, 0.0

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.opencagedata.com/geocode/v1/json",
                params={"q": city, "key": API_KEY}
            )
            data = response.json()

        results = data.get("results")
        if not results:
            return 0.0, 0.0

        geometry = results[0]["geometry"]
        return geometry["lat"], geometry["lng"]

    except Exception as e:
        print("Geocoding error:", str(e))
        return 0.0, 0.0