# Client Codex CRM

A field-service CRM for scheduling jobs and planning routes for multiple technicians.

## Mockup

[![Client Codex schedule mockup](docs/mockups/client-codex-schedule.png)](docs/mockups/client-codex-schedule.pdf)

Schedule view concept with a weekly calendar, technician selection, and map preview.

## Stack

- Bootstrap
- Python and Flask
- SQLAlchemy and SQLite
- Leaflet and OpenStreetMap
- OSRM routing

## Run the Python Server

From the project folder:

```bash
source .venv/bin/activate
python app.py
```

Then open <http://127.0.0.1:5000/api/health>.

Press `Control-C` in the terminal to stop the server.

## Planned Features

- Accounts and clients
- Client roles: Owners, Managers, and Tenants
- Service locations classified as Residence or Rental
- Rental occupancy tracked as Vacant or Occupied
- Technicians and availability
- Jobs and appointments
- Scheduling calendar with conflict detection
- Daily technician routes displayed on a map
- Python-based job assignment and route ordering

## Roadmap

1. Build the Bootstrap layout.
2. Set up Flask and SQLite.
3. Add accounts, clients, roles, and service locations.
4. Add technicians, jobs, and appointments.
5. Build the scheduling calendar.
6. Add maps and route planning.
7. Explore AI-assisted scheduling.

Google Calendar synchronization can be added later but is not required for the core application.
