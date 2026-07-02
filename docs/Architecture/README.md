# Shift94 — Architecture Documentation

This document explains the system design blueprints, workflow sequences, and data binding architectures for the Shift94 repository creation and publishing flows.

---

## 1. Decoupled Form State Architecture

To prevent browser `<select>` elements from dropping or resetting values during state re-renders (due to asynchronous network options loading or DOM unmounting), the React forms use a decoupled hidden input architecture:

```mermaid
graph TD
    A[User Action: Create Repo / Select Repo] --> B[React Event Handlers]
    B -->|setValue| C[Authoritative Form State: Hidden Inputs]
    C -->|watch| D[Visible Dropdowns / Controlled UI]
    D -->|Options Render| E[Display Selection]
    C -->|onSubmit| F[Multipart Form Data Payload]
```

- **Hidden Inputs**: `<input type="hidden" name="githubUrl" />` and `<input type="hidden" name="sourceRepository" />` act as the authoritative single source of truth.
- **Controlled UI Dropdown**: Reads value from `watch('githubUrl')` and updates the authoritative inputs on select change. Option pre-appending in component state guarantees consistent state matching.

---

## 2. Repository Creation Workflow

When a user selects "Create New Repository" on the Create Project page, the following sequence occurs:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as CreateProject.jsx
    participant Ctrl as OAuthController
    participant Svc as GitHubService
    participant GH as GitHub REST API

    User->>Page: Type Repository Name
    Page->>Ctrl: GET /oauth/github/repositories/check?name={name} (Debounced)
    Ctrl->>Svc: checkRepositoryAccess(accessToken, owner, name)
    Svc->>GH: GET /repos/{owner}/{name}
    GH-->>Svc: 404 Not Found (Available)
    Svc-->>Ctrl: Available = true
    Ctrl-->>Page: { available: true }
    Page->>User: Show "✓ Available" & Preview URL
    User->>Page: Click "Create & Link Repository"
    Page->>Ctrl: POST /oauth/github/repositories
    Ctrl->>Svc: createRepository(accessToken, repoData)
    Svc->>GH: POST /user/repos (Create repo)
    GH-->>Svc: 201 Created (repo details)
    Svc->>GH: PUT /repos/{owner}/{repo}/topics (Assign topics)
    GH-->>Svc: 200 OK
    Svc-->>Ctrl: Returns unified repo metadata
    Ctrl-->>Page: { success: true, repository }
    Page->>Page: Pre-append repo to selection list
    Page->>Page: Set githubUrl & sourceRepository form states
    Page->>Page: Auto-switch view to "Select Existing"
```

---

## 3. GitHub Release Publishing Workflow

Once the project is saved with `sourceRepository` metadata, publishing to GitHub triggers a Release creation:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Engine as PublishService
    participant Manager as PublisherManager
    participant Publisher as GitHubPublisher
    participant Svc as GitHubService
    participant GH as GitHub REST API

    User->>Engine: POST /api/v1/publish (projectId)
    Engine->>Engine: Create PENDING log entry
    Engine->>Publisher: publish(project, account)
    Publisher->>Publisher: Parse owner & repo from project.githubUrl
    Publisher->>Svc: checkRepositoryAccess(accessToken, owner, repo)
    Svc->>GH: GET /repos/{owner}/{repo}
    GH-->>Svc: 200 OK (Has push permissions)
    Publisher->>Svc: createRelease(accessToken, owner, repo, releaseData)
    Svc->>GH: POST /repos/{owner}/{repo}/releases
    GH-->>Svc: 201 Created (Release details)
    Publisher-->>Engine: { success: true, externalUrl }
    Engine->>Engine: Update status to PUBLISHED with release URL
```
