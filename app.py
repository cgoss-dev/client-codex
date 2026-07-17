import re
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from models import Base, Client, Location, LocationClient


app = Flask(__name__)
project_folder = Path(__file__).resolve().parent
instance_folder = project_folder / "instance"
database_path = instance_folder / "client-codex.sqlite3"

instance_folder.mkdir(exist_ok=True)
database_engine = create_engine(f"sqlite:///{database_path}")


@event.listens_for(database_engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


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


def location_client_to_dict(location_client):
    return {
        "id": location_client.id,
        "locationId": location_client.location_id,
        "clientId": location_client.client_id,
        "role": location_client.role,
        "priority": location_client.priority,
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


@app.get("/api/locations/<int:location_id>/clients")
def get_location_clients(location_id):
    try:
        with Session(database_engine) as session:
            if session.get(Location, location_id) is None:
                return jsonify(error="Location not found."), 404

            linked_client_rows = session.execute(
                select(LocationClient, Client)
                .join(Client, LocationClient.client_id == Client.id)
                .where(LocationClient.location_id == location_id)
            ).all()
            linked_clients = [
                {
                    "link": location_client_to_dict(link_record),
                    "client": client_to_dict(client_record),
                }
                for link_record, client_record in linked_client_rows
            ]
    except SQLAlchemyError:
        app.logger.exception("Could not retrieve the Location's Clients.")
        return (
            jsonify(error="Python could not retrieve the Location's Clients."),
            500,
        )

    role_order = {"owner": 0, "manager": 1, "tenant": 2}
    priority_order = {"primary": 0, "secondary": 1}
    linked_clients.sort(
        key=lambda item: (
            role_order[item["link"]["role"]],
            priority_order[item["link"]["priority"]],
        )
    )

    return jsonify(
        clients=linked_clients,
        count=len(linked_clients),
        locationId=location_id,
    )


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


@app.post("/api/location-clients")
def create_location_client():
    location_client = request.get_json(silent=True)

    if not isinstance(location_client, dict):
        return jsonify(error="Send the link as a JSON object.", saved=False), 400

    location_id = location_client.get("locationId")
    client_id = location_client.get("clientId")
    role = normalize_text(location_client.get("role")).lower()
    priority = normalize_text(location_client.get("priority")).lower()

    if (
        not isinstance(location_id, int)
        or isinstance(location_id, bool)
        or location_id < 1
        or not isinstance(client_id, int)
        or isinstance(client_id, bool)
        or client_id < 1
    ):
        return (
            jsonify(
                error="Choose a valid Location and Client.",
                saved=False,
            ),
            400,
        )

    if role not in {"owner", "manager", "tenant"}:
        return jsonify(error="Choose Owner, Manager, or Tenant.", saved=False), 400

    if priority not in {"primary", "secondary"}:
        return jsonify(error="Choose Primary or Secondary.", saved=False), 400

    try:
        with Session(database_engine) as session:
            if session.get(Location, location_id) is None:
                return jsonify(error="Location not found.", saved=False), 404

            if session.get(Client, client_id) is None:
                return jsonify(error="Client not found.", saved=False), 404

            duplicate_link = session.scalar(
                select(LocationClient)
                .where(
                    LocationClient.location_id == location_id,
                    LocationClient.client_id == client_id,
                )
                .limit(1)
            )

            if duplicate_link is not None:
                return (
                    jsonify(
                        duplicate=True,
                        error="That Client is already linked to this Location.",
                        id=duplicate_link.id,
                        link=location_client_to_dict(duplicate_link),
                        saved=False,
                    ),
                    409,
                )

            occupied_slot = session.scalar(
                select(LocationClient)
                .where(
                    LocationClient.location_id == location_id,
                    LocationClient.role == role,
                    LocationClient.priority == priority,
                )
                .limit(1)
            )

            if occupied_slot is not None:
                return (
                    jsonify(
                        error=(
                            f"This Location already has a "
                            f"{priority.title()} {role.title()}."
                        ),
                        saved=False,
                    ),
                    409,
                )

            link_record = LocationClient(
                location_id=location_id,
                client_id=client_id,
                role=role,
                priority=priority,
            )
            session.add(link_record)
            session.commit()
            session.refresh(link_record)
    except SQLAlchemyError:
        app.logger.exception("Could not link the Client and Location.")
        return (
            jsonify(
                error="Python could not link the Client and Location.",
                saved=False,
            ),
            500,
        )

    return (
        jsonify(
            id=link_record.id,
            link=location_client_to_dict(link_record),
            message="Client linked to Location.",
            saved=True,
        ),
        201,
    )


if __name__ == "__main__":
    app.run(debug=True)
