def generate_optimization(weather, irradiance):
    alerts = []

    if irradiance > 600:
        status = "Peak"
        alerts.append("Best time to charge ⚡")
    elif irradiance > 300:
        status = "Moderate"
        alerts.append("Decent solar conditions")
    else:
        status = "Low"
        alerts.append("Poor solar conditions")

    if weather["cloud"] > 60:
        alerts.append("High cloud cover reduces efficiency")

    if weather["temp"] > 40:
        alerts.append("High temperature may reduce panel efficiency")

    return {
        "status": status,
        "alerts": alerts
    }