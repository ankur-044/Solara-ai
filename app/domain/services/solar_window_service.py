def generate_solar_windows(forecast):

    hours = []

    # forecast is already a LIST
    if not isinstance(forecast, list):
        return []

    for item in forecast:

        if not isinstance(item, dict):
            continue

        dt_txt = item.get("dt_txt", "")
        clouds = item.get("clouds", {}).get("all", 100)

        try:
            hour = int(dt_txt[11:13])
        except:
            continue

        if clouds < 40 and 6 <= hour <= 18:
            hours.append(hour)

    if not hours:
        return []

    hours = sorted(set(hours))

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

    windows.append({
        "start": f"{start:02d}:00",
        "end": f"{prev:02d}:00",
        "quality": "High"
    })

    return windows