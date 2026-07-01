# Shift 9 — Service Layer Documentation

The Service Layer encapsulates all business logic and orchestrates workflows across the application. It acts as the intermediary between the Controller Layer (HTTP context) and the Repository Layer (database context).

## Design Rules
1. **Dependency Injection**: Services receive repositories and helper utilities through their constructors. They never instantiate classes or access the Prisma Client directly.
2. **Framework Independence**: Services must not import Express, React, or any HTTP/browser specific classes. They accept clean data payloads and return clean data objects.
3. **No Direct Database Access**: Services delegate database operations exclusively to the Repository layer.

## Component Overview

### 1. `ProjectService`
Located at `backend/src/modules/projects/project.service.js`.
- **Responsibilities**: Creates, updates, and retrieves projects. Validates inputs using the shared validation module, verifies project ownership, and computes pagination metadata.
- **Dependencies**: `ProjectRepository`

### 2. `OAuthService`
Located at `backend/src/modules/oauth/oauth.service.js`.
- **Responsibilities**: Generates OAuth redirect URLs, exchanges authorization codes, secures tokens via AES-256-CBC encryption before database writes, decrypts credentials for publishing requests, and lists connected accounts.
- **Dependencies**: `ConnectedAccountRepository`

### 3. `PublishService`
Located at `backend/src/modules/publishing/publish.service.js`.
- **Responsibilities**: Orchestrates the multi-platform publishing engine. It initializes a `PENDING` publish log, retrieves and decrypts the credentials, triggers the `PublisherManager` strategy, and records success or failure results.
- **Dependencies**: `ProjectRepository`, `ConnectedAccountRepository`, `PublishLogRepository`, `PublisherManager`

### 4. `HistoryService`
Located at `backend/src/modules/history/history.service.js`.
- **Responsibilities**: Retrieves paginated and filtered publish logs, and computes clean numeric dashboard statistics (e.g., project counts, platform connection flags).
- **Dependencies**: `PublishLogRepository`, `ProjectRepository`, `ConnectedAccountRepository`
