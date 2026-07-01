# Shift 9 — LinkedIn OAuth & Post Publishing Integration

The LinkedIn Integration module allows users to connect their personal LinkedIn profiles and publish rich media posts containing project commentary, links, and cover images.

## OAuth Flow Sequence
1. **Initiation**: The client calls `GET /api/v1/oauth/linkedin`, which generates a secure `state` parameter, stores it in an HttpOnly cookie, and returns the LinkedIn Authorization URL.
2. **User Consent**: The user is redirected to LinkedIn to authorize the app with scopes `openid profile email w_member_social`.
3. **Callback**: LinkedIn redirects the user back to `/api/v1/oauth/linkedin/callback?code=CODE&state=STATE`. The server:
   - Validates that the received `state` matches the cookie state.
   - Exchanges the `code` for an access token via `POST https://www.linkedin.com/oauth/v2/accessToken`.
   - Fetches the user profile via OpenID Connect `GET https://api.linkedin.com/v2/userinfo` to retrieve their name, OIDC subject ID, and profile picture.
   - Encrypts the access token using **AES-256-CBC** and stores it in the `ConnectedAccount` database table.
   - Redirects the user back to the frontend.

## API Endpoints

### 1. Connect Account
- **Method**: `GET`
- **Path**: `/api/v1/oauth/linkedin`
- **Response**:
  ```json
  {
    "success": true,
    "message": "LinkedIn authorization URL generated.",
    "data": {
      "url": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=...",
      "state": "..."
    },
    "errors": null
  }
  ```

### 2. Connection Status
- **Method**: `GET`
- **Path**: `/api/v1/oauth/linkedin/status`
- **Response**:
  ```json
  {
    "success": true,
    "message": "LinkedIn connection status retrieved.",
    "data": {
      "connected": true,
      "account": {
        "id": "...",
        "platform": "LINKEDIN",
        "username": "John Doe",
        "profileUrl": "https://linkedin.com/in/john-doe"
      }
    },
    "errors": null
  }
  ```

### 3. Disconnect Account
- **Method**: `POST`
- **Path**: `/api/v1/oauth/linkedin/disconnect`

---

## Image Upload Workflow (Two-Step)
If the project includes a cover image, the `LinkedInPublisher` executes the following steps:
1. **Initialize/Register Upload**:
   - Send `POST https://api.linkedin.com/rest/images?action=initializeUpload`.
   - Headers: `X-Restli-Protocol-Version: 2.0.0`, `LinkedIn-Version: 202606`.
   - Payload: `{ "initializeUploadRequest": { "owner": "urn:li:person:MEMBER_ID" } }`.
   - Response: Returns an `uploadUrl` and an `image` URN (e.g., `urn:li:image:C5610AQ...`).
2. **Binary PUT**:
   - Perform an HTTP `PUT` request containing the raw image binary to the `uploadUrl`.
   - Header: `Content-Type: application/octet-stream`.

---

## Rich Media Post Creation
After the image is uploaded (or skipped if no cover image is attached), the server calls the Posts API:
- **Endpoint**: `POST https://api.linkedin.com/rest/posts`
- **Headers**:
  - `Authorization: Bearer <DECRYPTED_TOKEN>`
  - `X-Restli-Protocol-Version: 2.0.0`
  - `LinkedIn-Version: 202606`
- **Payload**:
  ```json
  {
    "author": "urn:li:person:MEMBER_ID",
    "commentary": "🚀 New Project Showcase: Title\nSubtitle\n\nDescription\n\n🛠 Tech Stack: ...\n📦 Repository: ...\n\n#SaaS #WebDev",
    "visibility": "PUBLIC",
    "content": {
      "media": {
        "id": "urn:li:image:C5610AQ..."
      }
    },
    "distribution": {
      "feedDistribution": "MAIN_FEED"
    },
    "lifecycleState": "PUBLISHED"
  }
  ```

---

## Rate Limit Considerations
- Personal accounts are limited to approximately **100 post creations per member per day**.
- Exceeding this limit will trigger an HTTP `429 Too Many Requests` error, which is caught by the `PublishService` and logged as a `FAILED` publish log.
