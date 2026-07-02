# Shift94 — Project Management API

The Project Management module allows users to create, update, delete, and list project showcase entries. All endpoints require JWT authentication.

## Endpoint References

### 1. Create Project
- **Method**: `POST`
- **Path**: `/api/v1/projects`
- **Content-Type**: `multipart/form-data` (to support cover image upload)
- **Request Parameters**:
  - `title`: String (Required, max 255 chars)
  - `subtitle`: String (Optional, max 255 chars)
  - `description`: String (Required)
  - `githubUrl`: String (Optional, must be valid URL)
  - `demoUrl`: String (Optional, must be valid URL)
  - `techStack`: Array or comma-separated string (Required)
  - `tags`: Array or comma-separated string (Optional)
  - `platforms`: Array or comma-separated string (Optional, e.g., `["LINKEDIN", "GITHUB"]`)
  - `image`: Binary file (Optional, max 5MB, JPEG/PNG/WebP only)
  - `sourceRepository`: JSON String (Optional, structured repository metadata for created repository)

### 2. Update Project
- **Method**: `PUT`
- **Path**: `/api/v1/projects/:id`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Parameters**: Same as Create Project (all fields optional). If `image` file is uploaded, the existing cover image path is updated. Includes `sourceRepository` JSON metadata.

### 3. List Projects
- **Method**: `GET`
- **Path**: `/api/v1/projects`
- **Query Parameters**:
  - `page`: Integer (Default: 1)
  - `limit`: Integer (Default: 10, max 100)
  - `search`: String (Filters by title/description)
  - `status`: String (`DRAFT` | `PUBLISHED`)

### 4. Get Project by ID
- **Method**: `GET`
- **Path**: `/api/v1/projects/:id`

### 5. Delete Project
- **Method**: `DELETE`
- **Path**: `/api/v1/projects/:id`

## GitHub Repository Management APIs

### 1. Check Repository Name Availability
- **Method**: `GET`
- **Path**: `/api/v1/oauth/github/repositories/check`
- **Query Parameters**:
  - `name`: String (Required, repository slug name to check)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Repository name availability checked.",
    "data": { "available": true }
  }
  ```

### 2. Create GitHub Repository
- **Method**: `POST`
- **Path**: `/api/v1/oauth/github/repositories`
- **Content-Type**: `application/json`
- **Request Body**:
  - `name`: String (Required, repository slug name)
  - `description`: String (Optional)
  - `private`: Boolean (Default: false)
  - `autoInit`: Boolean (Default: true)
  - `gitignoreTemplate`: String (Optional, e.g. "Node")
  - `licenseTemplate`: String (Optional, e.g. "mit")
  - `topics`: Array of strings (Optional)
- **Response**:
  ```json
  {
    "success": true,
    "message": "GitHub repository created successfully.",
    "data": {
      "repository": {
        "id": 1286859157,
        "name": "shift94-e2e-real",
        "url": "https://github.com/Prasanth915/shift94-e2e-real",
        "owner": "Prasanth915",
        "defaultBranch": "main",
        "visibility": "public",
        "createdAt": "2026-07-02T06:54:21Z"
      }
    }
  }
  ```

## Image Upload Flow
1. The client sends a `POST` or `PUT` request with `Content-Type: multipart/form-data`.
2. The `upload.js` middleware (Multer) intercepts the request:
   - Verifies the file size does not exceed **5MB**.
   - Validates the mime-type is either `image/jpeg`, `image/png`, or `image/webp`.
   - Saves the file to the local `./uploads` directory with a unique, randomized filename (`cover-<timestamp>-<hash>.<ext>`).
3. The `ProjectController` retrieves the filename from `req.file` and saves the relative path `/uploads/<filename>` in the database.
4. Uploaded images are served statically at `http://localhost:5000/uploads/<filename>`.
