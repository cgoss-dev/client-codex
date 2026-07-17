from flask import Flask, jsonify, request


app = Flask(__name__)


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.post("/api/locations")
def validate_location():
    location = request.get_json(silent=True)

    if not isinstance(location, dict):
        return jsonify(error="Send the location as a JSON object.", saved=False), 400

    required_fields = ["street", "type", "city", "state", "postalCode"]
    missing_fields = [
        field
        for field in required_fields
        if not str(location.get(field) or "").strip()
    ]

    if missing_fields:
        return (
            jsonify(
                error=f"Complete required fields: {', '.join(missing_fields)}.",
                saved=False,
            ),
            400,
        )

    valid_location_types = {"residence", "rental", "commercial"}

    if location["type"] not in valid_location_types:
        return jsonify(error="Choose a valid location type.", saved=False), 400

    if location["type"] == "rental" and location.get("occupancy") not in {
        "vacant",
        "occupied",
    }:
        return jsonify(error="Choose Vacant or Occupied for a rental.", saved=False), 400

    return jsonify(
        location=location,
        message="Location data is valid.",
        saved=False,
    )


if __name__ == "__main__":
    app.run(debug=True)
