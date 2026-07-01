# Shift 9 — Frontend Authentication & Routing Flow

This document details the client-side session management, route guards, and API integrations for user authentication.

## Authentication Flow

### 1. Registration
- **Form**: `/register`
- **Validation**: Enforces name length, email format, and password strength (incorporating shared validators).
- **Service call**: Calls `authService.register` which sends a `POST /api/v1/auth/register` request.
- **Success**: Receives the JWT, saves it to `sessionStorage` as `shift9_token`, updates the `AuthContext` user state, and redirects to `/dashboard`.

### 2. Login
- **Form**: `/login`
- **Service call**: Calls `authService.login` which sends a `POST /api/v1/auth/login` request.
- **Success**: Saves the JWT to `sessionStorage`, updates `AuthContext`, and redirects to `/dashboard`.

### 3. Session Recovery
- On application mount, the `AuthProvider` checks `sessionStorage` for a `shift9_token`.
- If found, it calls `authService.getMe()` to fetch the profile.
- If the token is invalid or expired, it is removed and the user remains unauthenticated.

### 4. Logout
- Clears `shift9_token` from `sessionStorage`.
- Resets the `AuthContext` user state to `null`.
- Redirects the user to `/login`.

---

## Route Guards

### 1. `ProtectedRoute`
Wraps pages that require an authenticated session (e.g., Dashboard, Create Project, History, Settings).
- If the session is loading, it displays a full-screen spinner.
- If unauthenticated, it redirects the user to `/login`.

### 2. `GuestRoute`
Wraps guest-only pages (e.g., Login, Register).
- If the session is loading, it displays a full-screen spinner.
- If authenticated, it redirects the user to `/dashboard`.
