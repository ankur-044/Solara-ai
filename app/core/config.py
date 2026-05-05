import os

def load_env_file(filepath=".env"):
    env_data = {}

    try:
        with open(filepath, "r") as file:
            for line in file:
                line = line.strip()

                # Skip empty lines and invalid lines
                if not line or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                env_data[key.strip()] = value.strip()

    except FileNotFoundError:
        print("⚠️ .env file not found")

    return env_data


# Load environment manually (ignores bad lines like "Import to Postman")
env = load_env_file()

OPENCAGE_API_KEY = env.get("OPENCAGE_API_KEY")
OPENWEATHER_API_KEY = env.get("OPENWEATHER_API_KEY")
TOMORROW_API_KEY = env.get("TOMORROW_API_KEY")

# Debug prints
print("OPENCAGE:", OPENCAGE_API_KEY)
print("OPENWEATHER:", OPENWEATHER_API_KEY)
print("TOMORROW:", TOMORROW_API_KEY)

# Validation
if not OPENCAGE_API_KEY:
    raise ValueError("Missing OPENCAGE_API_KEY")

if not OPENWEATHER_API_KEY:
    raise ValueError("Missing OPENWEATHER_API_KEY")

if not TOMORROW_API_KEY:
    raise ValueError("Missing TOMORROW_API_KEY")