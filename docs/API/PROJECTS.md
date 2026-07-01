# Shift 9 — Project Management API

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

### 2. Update Project
- **Method**: `PUT`
- **Path**: `/api/v1/projects/:id`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Parameters**: Same as Create Project (all fields optional). If `image` file is uploaded, the existing cover image path is updated.

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

## Image Upload Flow
1. The client sends a `POST` or `PUT` request with `Content-Type: multipart/form-data`.
2. The `upload.js` middleware (Multer) intercepts the request:
   - Verifies the file size does not exceed **5MB**.
   - Validates the mime-type is either `image/jpeg`, `image/png`, or `image/webp`.
   - Saves the file to the local `./uploads` directory with a unique, randomized filename (`cover-<timestamp>-<hash>.<ext>`).
3. The `ProjectController` retrieves the filename from `req.file` and saves the relative path `/uploads/<filename>` in the database.
4. Uploaded images are served statically at `http://localhost:5000/uploads/<filename>`.
