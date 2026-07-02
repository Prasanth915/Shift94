# Shift94 v1.1 Release Notes

We are excited to release **Shift94 v1.1** which introduces automatic repository creation, real-time availability checks, and major data architecture enhancements.

---

## What's New in v1.1

### 1. Automatic GitHub Repository Creation
- Allows users to create a new GitHub repository directly from the project showcase creation form.
- Automatically slugifies the project title to generate a valid repository name.
- Supports template initialization parameters including `.gitignore` templates (e.g. Node) and Open Source License templates (e.g. MIT).
- Supports adding custom comma-separated topics.
- Offers radio toggle buttons to seamlessly switch between selecting an existing repository and creating a new one.

### 2. Real-Time Name Check & URL Previews
- Performs a debounced (650ms) background validation check against the live GitHub API as the user types the repository name.
- Displays state badges (`✓ Available`, `⚠ Repository already exists`, or `⚠ Invalid repository name`) alongside a live repository URL preview link.
- Offers interactive conflict resolution links ("Use Existing Repository" or "Rename Repository") if a duplicate is found.

### 3. Decoupled Form State Binding
- Replaced direct DOM input select binding with a hidden input state architecture.
- Decouples visual elements and timing updates from React Hook Form's single source of truth, completely eliminating select-reset bugs during mode toggles or asynchronous renders.

---

## Database Schema Enhancements
- Added a nullable `sourceRepository` JSONB column on the `Project` model to store details such as:
  ```json
  {
    "provider": "github",
    "id": 1286859157,
    "owner": "Prasanth915",
    "name": "shift94-e2e-real",
    "url": "https://github.com/Prasanth915/shift94-e2e-real",
    "visibility": "public",
    "defaultBranch": "main",
    "createdAt": "2026-07-02T06:54:21Z"
  }
  ```
- Handled cascaded deletions cleanly so that deleting a project unlinks related DB logs without orphan records.

---

## Shift94 v1.1.1 Stabilization Patch Notes

The v1.1.1 patch stabilizes the core publishing workflows, preventing double-publishing attempts, stale lock lockouts, and invalid parameter requests.

### 1. Front-Loaded Publish Validation (Fail-Fast)
- **Validation**: Enforces strict backend validation requiring `githubUrl` and `sourceRepository` to be non-empty before initiating any GITHUB publish execution.
- **Fail-Fast**: Fails immediately returning an HTTP `400 Bad Request` if requirements are not met, preventing the creation of invalid failed publish logs.
- **Frontend Block**: Prevents submitting the Create Project form if the user checks the GITHUB publish target checkbox but does not have a repository linked.

### 2. Thread-Safe Concurrency Locks
- **In-Memory Lock**: Implemented a synchronous application-level Set lock (`activeLocks`) in `PublishService` to reject concurrent requests for the same project/platform immediately with `409 Conflict`.
- **Database Lock**: Implemented atomic transitions (`PENDING` -> `PUBLISHING`) using Prisma update filters.
- **Stale Lock Recovery**: Stuck logs (> 5 minutes) are failed automatically and marked as timed out, allowing subsequent runs to recover.

### 3. Clean Retry Workflow
- **Retry Log Reuse**: Refactored `retryPublish` to pass the existing failed log UUID back to `publishProject`, updating the existing record instead of generating new duplicates or leaving stale logs as `PENDING` forever.
- **Frontend Click Guard**: Implemented synchronous refs (`isSubmitting` and `isRetrying`) on submit buttons and retry buttons to ignore keyboard and click double-submissions.

