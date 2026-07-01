# Shift 9 — Repository Layer Documentation

The Repository Layer encapsulates all database interactions via the Prisma ORM. By separating database operations from the business services, Shift 9 achieves clean architectural boundaries and simplifies mock testing.

## Repository Overview

```
Service Layer (AuthService, ProjectService, etc.)
       │
       ▼
Repositories (UserRepository, ProjectRepository, etc.)
       │
       ▼
Prisma Client (Singleton Instance)
       │
       ▼
PostgreSQL Database
```

## Contracts & Methods

### 1. `ProjectRepository`
Located at `backend/src/modules/projects/project.repository.js`.

- **`create(data)`**: Inserts a new project showcase record.
- **`update(id, data)`**: Updates project details.
- **`delete(id)`**: Deletes a project.
- **`findById(id)`**: Retrieves a project by UUID, including its associated publish logs.
- **`findAll(filter)`**: Fetches projects with support for pagination (`skip`, `take`), status filtering, and case-insensitive text search.
- **`findByUserId(userId)`**: Retrieves all projects owned by a user.
- **`search(query, userId)`**: Performs text search across title, subtitle, and description for a user.
- **`count(filter)`**: Counts total records matching specified filters (for pagination metadata).

### 2. `ConnectedAccountRepository`
Located at `backend/src/modules/oauth/account.repository.js`.

- **`create(data)`**: Stores encrypted OAuth credentials.
- **`update(id, data)`**: Updates metadata and connection details.
- **`findByUserId(userId)`**: Lists all connected platform profiles for a user.
- **`findByUserIdAndPlatform(userId, platform)`**: Finds a specific connection (unique constraint).
- **`updateTokens(id, accessToken, refreshToken)`**: Re-authenticates and updates encrypted tokens.
- **`delete(id)`**: Disconnects a platform.
- **`exists(userId, platform)`**: Checks if a platform is connected.

### 3. `PublishLogRepository`
Located at `backend/src/modules/publishing/publish-log.repository.js`.

- **`create(data)`**: Logs a pending publish request.
- **`updateStatus(id, status, url, response)`**: Updates publishing status, external links, and raw API responses.
- **`findById(id)`**: Fetches log details including project metadata.
- **`findByProjectId(projectId)`**: Retrieves all logs associated with a project.
- **`findByUserId(userId)`**: Lists all logs across all projects owned by a user.
- **`findAll(filter)`**: Paginated retrieval of history logs with platform and status filters.
- **`retryFailed(id)`**: Resets a failed log status back to `PENDING` for retry attempts.
- **`count(filter)`**: Counts total records matching filters (for pagination metadata).

## Best Practices
- **No Business Logic**: Repositories must never perform operations like password hashing, token decryption, or validation.
- **No HTTP Context**: Do not reference `req`, `res`, or Express components.
- **Cascade Deletes**: Handled at the database level via Prisma schema foreign key rules.
