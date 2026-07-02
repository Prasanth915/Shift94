# Shift944 — Publish History API

The Publish History API allows users to track the distribution status of their project showcases and retry any failed publishing actions. All endpoints require JWT authentication.

## API Endpoints

### 1. Retrieve Publish Logs
- **Method**: `GET`
- **Path**: `/api/v1/history`
- **Query Parameters**:
  - `page`: Integer (Default: 1)
  - `limit`: Integer (Default: 10, max 100)
  - `platform`: String (`LINKEDIN` | `GITHUB`)
  - `status`: String (`PENDING` | `PUBLISHING` | `PUBLISHED` | `FAILED`)
  - `search`: String (Filters by project title)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Publish history retrieved.",
    "data": {
      "logs": [
        {
          "id": "log-1234",
          "projectId": "proj-1234",
          "platform": "LINKEDIN",
          "status": "PUBLISHED",
          "externalUrl": "https://linkedin.com/post/123",
          "createdAt": "2026-06-30T21:26:05.000Z",
          "project": {
            "title": "Shift944"
          }
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    },
    "errors": null
  }
  ```

### 2. Retrieve Log Details
- **Method**: `GET`
- **Path**: `/api/v1/history/:id`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Publish log details retrieved.",
    "data": {
      "log": {
        "id": "log-1234",
        "projectId": "proj-1234",
        "platform": "LINKEDIN",
        "status": "PUBLISHED",
        "externalUrl": "https://linkedin.com/post/123",
        "apiResponse": {
          "id": "urn:li:share:12345",
          "raw": {}
        },
        "createdAt": "2026-06-30T21:26:05.000Z",
        "project": {
          "id": "proj-1234",
          "userId": "user-123",
          "title": "Shift944"
        }
      }
    },
    "errors": null
  }
  ```

### 3. Retry Failed Publish
Triggers a retry attempt for a failed publishing log entry.
- **Method**: `POST`
- **Path**: `/api/v1/history/:id/retry`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Publish retry process completed.",
    "data": {
      "log": {
        "id": "log-1234",
        "platform": "LINKEDIN",
        "status": "PUBLISHED"
      }
    },
    "errors": null
  }
  ```

## Retry Workflow
1. The user requests a retry: `POST /api/v1/history/:id/retry`.
2. The `HistoryController` validates the `id` is a valid UUID and checks if the log exists.
3. The controller verifies that the log's status is currently `FAILED`. If not, it rejects the request with a `400 Bad Request`.
4. The controller verifies that the associated project belongs to the authenticated user.
5. The `PublishService.retryPublish` is called, which:
   - Resets the log status to `PENDING`.
   - Re-runs the platform-specific publishing logic (using decrypted tokens).
   - Updates the log status to `PUBLISHED` or `FAILED` based on the outcome.
6. The updated log is returned to the client.
