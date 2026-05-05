def generate_analysis(irradiance, cloud, humidity):
    # Status logic
    if irradiance > 600:
        status = "High"
    elif irradiance > 300:
        status = "Moderate"
    else:
        status = "Low"

    alerts = []

    if cloud > 70:
        alerts.append("High cloud cover may reduce efficiency")

    if humidity > 80:
        alerts.append("High humidity detected")

    if irradiance < 300:
        alerts.append("Low solar generation expected")

    # Confidence score (important for project quality)
    confidence = max(0, min(100, 100 - cloud - (humidity * 0.3)))

    return {
        "status": status,
        "confidence": round(confidence, 2),
        "alerts": alerts
    }