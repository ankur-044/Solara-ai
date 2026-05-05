def generate_solar_windows(forecast):
    hours = []

    for item in forecast.get("list", []):
        hour = int(item["dt_txt"][11:13])
        clouds = item["clouds"]["all"]

        if clouds < 40 and 6 <= hour <= 18:
            hours.append(hour)

    if not hours:
        return []

    hours = sorted(set(hours))  # remove duplicates

    windows = []
    start = hours[0]
    prev = hours[0]

    for curr in hours[1:]:
        if curr == prev + 3:
            prev = curr
        else:
            windows.append({
                "start": f"{start:02d}:00",
                "end": f"{prev:02d}:00",
                "quality": "High"
            })
            start = curr
            prev = curr

    # final window
    windows.append({
        "start": f"{start:02d}:00",
        "end": f"{prev:02d}:00",
        "quality": "High"
    })

    return windows