# Shift 9 — User Settings API

The User Settings API manages profile updates, password modifications, and OAuth platform connection controls. All endpoints require JWT authentication.

## API Endpoints

### 1. Get User Profile
- **Method**: `GET`
- **Path**: `/api/v1/settings/profile`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully.",
    "data": {
      "user": {
        "id": "user-1234",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatar": null,
        "createdAt": "2026-06-30T21:26:05.000Z"
      }
    },
    "errors": null
  }
  ```

### 2. Update User Profile
- **Method**: `PUT`
- **Path**: `/api/v1/settings/profile`
- **Request Body**:
  ```json
  {
    "name": "Jane Updated",
    "email": "jane-new@example.com"
  }
  ```

### 3. Change Password
Updates the user's password. Requires password strength validation and verifies the current password.
- **Method**: `PATCH`
- **Path**: `/api/v1/settings/password`
- **Request Body**:
  ```json
  {
    "currentPassword": "CurrentPassword123!",
    "newPassword": "NewSecurePassword123!",
    "confirmPassword": "NewSecurePassword123!"
  }
  ```

### 4. View Connected Accounts
Lists connected OAuth platforms. Credentials/tokens are stripped before sending the response.
- **Method**: `GET`
- **Path**: `/api/v1/settings/accounts`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Connected accounts retrieved.",
    "data": {
      "accounts": [
        {
          "id": "acc-1234",
          "platform": "LINKEDIN",
          "username": "Jane Doe",
          "profileUrl": "https://linkedin.com/in/jane-doe",
          "status": "CONNECTED",
          "createdAt": "2026-06-30T21:26:05.000Z"
        }
      ]
    },
    "errors": null
  }
  ```

### 5. Disconnect GitHub
Removes GitHub OAuth credentials.
- **Method**: `DELETE`
- **Path**: `/api/v1/settings/accounts/github`

### 6. Disconnect LinkedIn
Removes LinkedIn OAuth credentials.
- **Method**: `DELETE`
- **Path**: `/api/v1/settings/accounts/linkedin`

## Password Modification Workflow
1. The user requests a password update: `PATCH /api/v1/settings/password`.
2. The `settings.validator.js` validates that:
   - All fields are present.
   - `newPassword` meets strength rules (length, casing, digits, symbols).
   - `confirmPassword` matches `newPassword`.
3. The `SettingsService` loads the user record and compares `currentPassword` with the stored hash.
4. The service verifies that `newPassword` is not identical to `currentPassword`.
5. The service hashes the new password with **12 salt rounds** using `bcrypt` and writes it to the database.
