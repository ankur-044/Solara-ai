import os

# Read from Render environment (NOT .env)
OPENCAGE_API_KEY = os.environ.get("OPENCAGE_API_KEY")
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
TOMORROW_API_KEY = os.environ.get("TOMORROW_API_KEY")

# Debug (important)
print("ENV DEBUG:")
print("OPENCAGE:", OPENCAGE_API_KEY)
print("OPENWEATHER:", OPENWEATHER_API_KEY)
print("TOMORROW:", TOMORROW_API_KEY)

# ❌ DO NOT crash app
if not OPENCAGE_API_KEY:
    print("⚠️ Missing OPENCAGE_API_KEY")

if not OPENWEATHER_API_KEY:
    print("⚠️ Missing OPENWEATHER_API_KEY")

if not TOMORROW_API_KEY:
    print("⚠️ Missing TOMORROW_API_KEY")