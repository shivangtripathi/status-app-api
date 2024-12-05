# Status Page API

A RESTful API service for managing and displaying system status pages, built with Node.js, Express, and TypeScript.

## Features

- Real-time service status updates via WebSocket
- Service status history tracking
- Incident management with updates
- Separate admin and public API routes

## API Endpoints

### Public Routes (`/api/public`)

- `GET /services` - Get all services with their status history
- `GET /services/status` - Get current status of all services with active incidents
- `GET /incidents` - Get all incidents with their updates

### Admin Routes (`/api/admin`)

Protected routes for administrative operations (requires authentication)

## Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:shivangtripathi/status-app-api.git
   cd status-page-api
   ```

2. Build and run with Docker:
   ```bash
   # Build the Docker image
   docker build -t status-page-api .

   # Run the container
   docker run -d -p 5000:5000 --name status-page status-page-api
   ```
