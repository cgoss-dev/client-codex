# Codex Project Guide

## Goal

Build a simple field-service CRM for scheduling and routing multiple technicians while learning Bootstrap and Python.

## Stack

- Bootstrap for the interface
- Python and Flask for the backend
- SQLAlchemy and SQLite for data
- Leaflet and OpenStreetMap for maps
- OSRM for route calculations

## Guidelines

- Keep the code beginner-friendly and explain important concepts.
- Prefer Bootstrap utilities over custom CSS.
- Build our own calendar, scheduling, and technician-assignment features.
- Treat Owners, Managers, and Tenants as Clients linked to Accounts and Locations.
- Classify Locations as Residence or Rental; mark Rentals as Vacant or Occupied.
- Keep the Bill To Account separate from the Service Location.
- Start with accounts, clients, locations, technicians, jobs, and appointments.
- Prevent overlapping technician appointments.
- Keep mapping and routing code replaceable.
- Treat Google Calendar as an optional future integration.
- Test relevant behavior and responsive layouts before finishing changes.
