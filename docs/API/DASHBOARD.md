# Shift944 — Dashboard API

The Dashboard API provides aggregated metadata and connection statuses to drive the main user interface. It is designed to be lightweight and responsive.

All endpoints require JWT authentication.

## API Endpoints

### 1. Retrieve Dashboard Statistics
- **Method**: `GET`
- **Path**: `/api/v1/dashboard`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved.",
    "data": {
      "totalProjects": 5,
      "publishedProjects": 3,
      "linkedinConnected": true,
      "githubConnected": false
    },
    "errors": null
  }
  ```

### 2. Retrieve Recent Projects
Retrieves the 5 most recently created projects for the user.
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/recent-projects`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Recent projects retrieved.",
    "data": {
      "projects": [
        {
          "id": "8a5e3c12-ef54-47ef-8d77-6d65f5a8a1f2",
          "title": "Shift944",
          "subtitle": "Developer Portfolio Automation Platform",
          "status": "PUBLISHED",
          "createdAt": "2026-06-30T21:26:05.000Z"
        }
      ]
    },
    "errors": null
  }
  ```

## Design Notes
- **Lightweight Design**: Excludes complex metrics, charts, and analytics. It aggregates database counts and checks active OAuth connection flags in a single request.
- **Security**: The middleware extracts the user's ID from the JWT payload. All queries are scoped to the user ID, ensuring data isolation.
