import re
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from sqlalchemy import create_engine, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models import Base, Client, Location


app = Flask(__name__)
project_folder = Path(__file__).resolve().parent
instance_folder = project_folder / "instance"
database_path = instance_folder / "client-codex.sqlite3"

instance_folder.mkdir(exist_ok=True)
database_engine = create_engine(f"sqlite:///{database_path}")
Base.metadata.create_all(database_engine)
email_address_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


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


def client_to_dict(client):
    return {
        "id": client.id,
        "organization": client.organization,
        "firstName": client.first_name,
        "lastName": client.last_name,
        "email": client.email,
        "mobile": client.mobile,
    }


def normalize_text(value):
    return " ".join(str(value or "").split())


def normalize_mobile(value):
    digits = re.sub(r"\D", "", str(value or ""))

    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]

    if not digits:
        return None

    if len(digits) != 10:
        raise ValueError("Enter a 10-digit mobile number.")

    return f"({digits[:3]}){digits[3:6]}-{digits[6:]}"


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
        "street": normalize_text(location.get("street")),
        "unit": normalize_text(location.get("unit")) or None,
        "type": normalize_text(location.get("type")).lower(),
        "occupancy": normalize_text(location.get("occupancy")).lower() or None,
        "city": normalize_text(location.get("city")),
        "state": normalize_text(location.get("state")).upper(),
        "postalCode": normalize_text(location.get("postalCode")),
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

    try:
        with Session(database_engine) as session:
            duplicate_location = session.scalar(
                select(Location)
                .where(
                    func.lower(func.trim(Location.street))
                    == normalized_location["street"].lower(),
                    func.lower(func.trim(func.coalesce(Location.unit, "")))
                    == (normalized_location["unit"] or "").lower(),
                    func.lower(func.trim(Location.city))
                    == normalized_location["city"].lower(),
                    func.upper(func.trim(Location.state))
                    == normalized_location["state"],
                    func.trim(Location.postal_code)
                    == normalized_location["postalCode"],
                )
                .limit(1)
            )

            if duplicate_location is not None:
                return (
                    jsonify(
                        duplicate=True,
                        error=(
                            "That address already exists as "
                            f"Location #{duplicate_location.id}."
                        ),
                        id=duplicate_location.id,
                        location=location_to_dict(duplicate_location),
                        saved=False,
                    ),
                    409,
                )

            location_record = Location(
                street=normalized_location["street"],
                unit=normalized_location["unit"],
                location_type=normalized_location["type"],
                occupancy=normalized_location["occupancy"],
                city=normalized_location["city"],
                state=normalized_location["state"],
                postal_code=normalized_location["postalCode"],
            )
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


@app.get("/api/clients")
def get_clients():
    try:
        with Session(database_engine) as session:
            client_records = session.scalars(
                select(Client).order_by(Client.id)
            ).all()
            clients = [
                client_to_dict(client_record)
                for client_record in client_records
            ]
    except SQLAlchemyError:
        app.logger.exception("Could not retrieve Clients.")
        return jsonify(error="Python could not retrieve Clients."), 500

    return jsonify(clients=clients, count=len(clients))


@app.get("/api/clients/<int:client_id>")
def get_client(client_id):
    try:
        with Session(database_engine) as session:
            client_record = session.get(Client, client_id)

            if client_record is None:
                return jsonify(error="Client not found."), 404

            client = client_to_dict(client_record)
    except SQLAlchemyError:
        app.logger.exception("Could not retrieve the Client.")
        return jsonify(error="Python could not retrieve the Client."), 500

    return jsonify(client=client)


@app.post("/api/clients")
def create_client():
    client = request.get_json(silent=True)

    if not isinstance(client, dict):
        return jsonify(error="Send the client as a JSON object.", saved=False), 400

    try:
        mobile = normalize_mobile(client.get("mobile"))
    except ValueError as error:
        return jsonify(error=str(error), saved=False), 400

    normalized_client = {
        "organization": normalize_text(client.get("organization")) or None,
        "firstName": normalize_text(client.get("firstName")),
        "lastName": normalize_text(client.get("lastName")),
        "email": normalize_text(client.get("email")).lower() or None,
        "mobile": mobile,
    }
    missing_names = [
        field
        for field in ["firstName", "lastName"]
        if not normalized_client[field]
    ]

    if missing_names:
        return (
            jsonify(
                error=f"Complete required fields: {', '.join(missing_names)}.",
                saved=False,
            ),
            400,
        )

    if not normalized_client["email"] and not normalized_client["mobile"]:
        return jsonify(error="Enter an email address or mobile number.", saved=False), 400

    if (
        normalized_client["email"]
        and not email_address_pattern.fullmatch(normalized_client["email"])
    ):
        return (
            jsonify(
                error="Enter a complete email address, such as name@example.com.",
                saved=False,
            ),
            400,
        )

    client_record = Client(
        organization=normalized_client["organization"],
        first_name=normalized_client["firstName"],
        last_name=normalized_client["lastName"],
        email=normalized_client["email"],
        mobile=normalized_client["mobile"],
    )

    try:
        with Session(database_engine) as session:
            session.add(client_record)
            session.commit()
            session.refresh(client_record)
    except SQLAlchemyError:
        app.logger.exception("Could not save the Client.")
        return jsonify(error="Python could not save the Client.", saved=False), 500

    return (
        jsonify(
            client=client_to_dict(client_record),
            id=client_record.id,
            message="Client saved.",
            saved=True,
        ),
        201,
    )


if __name__ == "__main__":
    app.run(debug=True)
