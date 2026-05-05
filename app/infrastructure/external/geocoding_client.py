import requests
from app.core.config import OPENCAGE_API_KEY

async def get_lat_lon(city: str):
    url = f"https://api.opencagedata.com/geocode/v1/json?q={city}&key={OPENCAGE_API_KEY}"

    response = requests.get(url)
    
    try:
        data = response.json()
    except:
        raise Exception("Invalid response from OpenCage API")

    print("🔍 Geocoding FULL Response:", data)  # DEBUG

    # Check API error
    if data.get("status", {}).get("code") != 200:
        raise Exception(f"OpenCage API error: {data.get('status')}")

    results = data.get("results")

    if not results or len(results) == 0:
        raise Exception(f"No results found for city: {city}")

    geometry = results[0].get("geometry")

    if not geometry:
        raise Exception("Geometry missing in response")

    return geometry.get("lat"), geometry.get("lng")