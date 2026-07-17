from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from sqlalchemy import create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models import Base, Location


app = Flask(__name__)
project_folder = Path(__file__).resolve().parent
instance_folder = project_folder / "instance"
database_path = instance_folder / "client-codex.sqlite3"

instance_folder.mkdir(exist_ok=True)
database_engine = create_engine(f"sqlite:///{database_path}")
Base.metadata.create_all(database_engine)


def location_to_dict(location):
    return {
        "id": location.id,
        "street": location.street,
        "unit": location.unit,
        "type": location.location_type,
        "occupancy": location.occupancy,
        "city": location.city,
        "state": location.state,
        "postalCode": location.postal_code,
    }


@app.get("/")
def index():
    return send_from_directory(project_folder, "index.html")


@app.get("/css/<path:filename>")
def css_asset(filename):
    return send_from_directory(project_folder / "css", filename)


@app.get("/js/<path:filename>")
def javascript_asset(filename):
    return send_from_directory(project_folder / "js", filename)


@app.get("/images/<path:filename>")
def image_asset(filename):
    return send_from_directory(project_folder / "images", filename)


@app.get("/fonts/<path:filename>")
def font_asset(filename):
    return send_from_directory(project_folder / "fonts", filename)


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/locations")
def get_locations():
    try:
        with Session(database_engine) as session:
            location_records = session.scalars(
                select(Location).order_by(Location.id)
            ).all()
            locations = [
                location_to_dict(location_record)
                for location_record in location_records
            ]
    except SQLAlchemyError:
        app.logger.exception("Could not retrieve Locations.")
        return jsonify(error="Python could not retrieve Locations."), 500

    return jsonify(count=len(locations), locations=locations)


@app.get("/api/locations/<int:location_id>")
def get_location(location_id):
    try:
        with Session(database_engine) as session:
            location_record = session.get(Location, location_id)

            if location_record is None:
                return jsonify(error="Location not found."), 404

            location = location_to_dict(location_record)
    except SQLAlchemyError:
        app.logger.exception("Could not retrieve the Location.")
        return jsonify(error="Python could not retrieve the Location."), 500

    return jsonify(location=location)


@app.post("/api/locations")
def create_location():
    location = request.get_json(silent=True)

    if not isinstance(location, dict):
        return jsonify(error="Send the location as a JSON object.", saved=False), 400

    normalized_location = {
        "street": str(location.get("street") or "").strip(),
        "unit": str(location.get("unit") or "").strip() or None,
        "type": str(location.get("type") or "").strip().lower(),
        "occupancy": str(location.get("occupancy") or "").strip().lower() or None,
        "city": str(location.get("city") or "").strip(),
        "state": str(location.get("state") or "").strip().upper(),
        "postalCode": str(location.get("postalCode") or "").strip(),
    }
    required_fields = ["street", "type", "city", "state", "postalCode"]
    missing_fields = [
        field
        for field in required_fields
        if not normalized_location[field]
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

    if normalized_location["type"] not in valid_location_types:
        return jsonify(error="Choose a valid location type.", saved=False), 400

    if normalized_location["type"] == "rental" and normalized_location["occupancy"] not in {
        "vacant",
        "occupied",
    }:
        return jsonify(error="Choose Vacant or Occupied for a rental.", saved=False), 400

    if normalized_location["type"] != "rental":
        normalized_location["occupancy"] = None

    location_record = Location(
        street=normalized_location["street"],
        unit=normalized_location["unit"],
        location_type=normalized_location["type"],
        occupancy=normalized_location["occupancy"],
        city=normalized_location["city"],
        state=normalized_location["state"],
        postal_code=normalized_location["postalCode"],
    )

    try:
        with Session(database_engine) as session:
            session.add(location_record)
            session.commit()
            session.refresh(location_record)
    except SQLAlchemyError:
        app.logger.exception("Could not save the Location.")
        return jsonify(error="Python could not save the Location.", saved=False), 500

    return (
        jsonify(
            id=location_record.id,
            location=normalized_location,
            message="Location saved.",
            saved=True,
        ),
        201,
    )


if __name__ == "__main__":
    app.run(debug=True)
