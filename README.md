# Offline Personnel Management System (HRMS)

A LAN-based Personnel Management System built with Django and Docker.

## Features
- **Personnel Management**: Track soldiers' details, rank, and assignments.
- **Section Management**: Organize personnel into sections.
- **Guard Duty Roster**: Manage weekly guard duties with "Least Recently Tasked" automation.
- **Reporting**: Generate weekly rosters (Placeholder).
- **Offline/LAN Access**: Dockerized deployment accessible via local network.

## Prerequisites
- Docker and Docker Compose installed on the host machine.

## Quick Start (Docker)

1. **Build and Run**:
   ```bash
   docker-compose up --build -d
   ```

2. **Run Migrations**:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

3. **Create Admin User**:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

4. **Access the App**:
   - Open your browser and go to `http://<HOST_IP>:8000/admin`.
   - Login with the superuser credentials.

## Development (Local)

If you want to run without Docker (requires Python 3.11+ and PostgreSQL):

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure environment variables (or use default SQLite for dev):
   ```bash
   export DEBUG=True
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

## Guard Duty Logic
The system automatically suggests eligible guards based on:
- **Status**: Must be 'ACTIVE' (not on leave/sick).
- **Rotation**: Personnel are sorted by their last guard duty date (ascending).

## LAN Access
To access from other devices on the LAN, find the host's IP address (e.g., using `ip addr` or `ifconfig`) and visit `http://<HOST_IP>:8000`.
