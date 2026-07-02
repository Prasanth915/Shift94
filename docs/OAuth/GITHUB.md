# Shift944 — GitHub OAuth & Repository Linkage Integration

The GitHub Integration module allows users to securely link their GitHub accounts, retrieve repository listings, and associate existing repositories with portfolio projects.

## OAuth Flow Sequence
1. **Initiation**: The client calls `GET /api/v1/oauth/github`, which generates a cryptographically secure `state` parameter, stores it in an HttpOnly cookie, and returns the GitHub Authorization URL.
2. **User Consent**: The user is redirected to GitHub to authorize the app with scopes `read:user repo`.
3. **Callback**: GitHub redirects the user back to `/api/v1/oauth/github/callback?code=CODE&state=STATE`. The server:
   - Validates that the received `state` matches the cookie state.
   - Exchanges the `code` for an access token via `POST https://github.com/login/oauth/access_token`.
   - Fetches the user profile via `GET https://api.github.com/user`.
   - Encrypts the access token using **AES-256-CBC** and stores it in the `ConnectedAccount` database table.
   - Redirects the user back to the frontend dashboard.

## API Endpoints

### 1. Connect Account
- **Method**: `GET`
- **Path**: `/api/v1/oauth/github`
- **Response**:
  ```json
  {
    "success": true,
    "message": "GitHub authorization URL generated.",
    "data": {
      "url": "https://github.com/login/oauth/authorize?client_id=...",
      "state": "..."
    },
    "errors": null
  }
  ```

### 2. Connection Status
- **Method**: `GET`
- **Path**: `/api/v1/oauth/github/status`
- **Response**:
  ```json
  {
    "success": true,
    "message": "GitHub connection status retrieved.",
    "data": {
      "connected": true,
      "account": {
        "id": "...",
        "platform": "GITHUB",
        "username": "johndev",
        "profileUrl": "https://github.com/johndev"
      }
    },
    "errors": null
  }
  ```

### 3. Disconnect Account
- **Method**: `POST`
- **Path**: `/api/v1/oauth/github/disconnect`

### 4. Fetch Repositories
- **Method**: `GET`
- **Path**: `/api/v1/oauth/github/repositories`
- **Response**:
  ```json
  {
    "success": true,
    "message": "GitHub repositories retrieved successfully.",
    "data": {
      "repositories": [
        {
          "id": "123456789",
          "name": "Shift944",
          "fullName": "johndev/Shift944",
          "url": "https://github.com/johndev/Shift944",
          "description": "Developer Portfolio Automation Platform",
          "defaultBranch": "main",
          "language": "JavaScript",
          "visibility": "public",
          "stars": 12,
          "forks": 2
        }
      ]
    },
    "errors": null
  }
  ```

## Security Design
- **State Parameter (CSRF)**: Random 16-byte hex strings are used to prevent Cross-Site Request Forgery.
- **Token Encryption**: Access tokens are stored as `iv_hex:ciphertext_hex` in the database, encrypted using `aes-256-cbc`.
- **Scope Limitation**: The app requests `read:user repo` to fetch repository lists. It does **not** push commits or modify repository files in this MVP version.
