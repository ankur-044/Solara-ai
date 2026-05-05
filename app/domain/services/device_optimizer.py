def optimize_devices(solar_windows, irradiance):
    plan = []

    # 🔥 If solar windows available
    if solar_windows:
        best_window = solar_windows[0]

        plan.append({
            "device": "Washing Machine",
            "time": f"{best_window['start']} - {best_window['end']}",
            "reason": "High solar availability"
        })

        plan.append({
            "device": "EV Charging",
            "time": f"{best_window['start']} - {best_window['end']}",
            "reason": "Maximize solar usage"
        })

        plan.append({
            "device": "Dishwasher",
            "time": f"{best_window['start']} - {best_window['end']}",
            "reason": "Efficient energy usage"
        })

    # 🌙 If NO solar (night / cloudy)
    else:
        plan.append({
            "device": "EV Charging",
            "recommendation": "Use at night",
            "reason": "No solar availability"
        })

        plan.append({
            "device": "Washing Machine",
            "recommendation": "Use after 6 PM",
            "reason": "Avoid peak solar absence"
        })

    # ❄️ AC always separate
    plan.append({
        "device": "AC",
        "recommendation": "Use after sunset",
        "reason": "Reduce solar load"
    })

    return plan