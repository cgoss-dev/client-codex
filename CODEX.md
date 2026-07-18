# Codex Project Guide

## Goal

Build a simple field-service CRM for scheduling and routing staff organized into teams. The primary purpose of this project is to teach me Bootstrap, Python, and SQLite while we build it.

## Learning Workflow

- Treat teaching as the priority, not finishing the application as quickly as possible.
- Work in small, understandable milestones. Make one focused change at a time.
- Do not build future features or large abstractions before they are needed.
- Before a new step, explain what we are building, why it comes next, and which files or concepts it introduces.
- Explain unfamiliar Bootstrap classes, HTML structure, CSS rules, Python code, and database concepts in plain language.
- After each step, summarize what changed and how it works before suggesting the next small step.
- Give me opportunities to write or adjust code myself when that would help me learn.
- When several approaches are valid, recommend the simplest beginner-friendly option and explain the tradeoff.
- Preserve working code and avoid large rewrites unless we agree that a rewrite is the lesson or task.
- Do not skip from the current interface work directly into a complete backend, database, calendar, or routing system.

## Stack

- Bootstrap for the current interface work
- Python and Flask for the future backend
- SQLAlchemy and SQLite for future data storage
- Leaflet and OpenStreetMap for future maps
- OSRM for future route calculations

## Guidelines

- Keep the code readable and beginner-friendly.
- Prefer Bootstrap utilities over custom CSS.
- Use custom CSS only when Bootstrap does not provide the project-specific styling we need.
- Build our own calendar, scheduling, team, and staff-assignment features.
- Treat Owners, Managers, and Tenants as Clients linked to Accounts and Locations.
- Classify Locations as Residence or Rental; mark Rentals as Vacant or Occupied.
- Keep the Bill To Account separate from the Service Location.
- Start with accounts, clients, locations, staff, teams, jobs, and appointments.
- Prevent overlapping staff appointments.
- Keep mapping and routing code replaceable.
- Treat Google Calendar as an optional future integration.
- Test relevant behavior and responsive layouts before finishing changes.
