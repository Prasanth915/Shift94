# Shift944 — Authentication Architecture

The Authentication module provides secure local registration, session management, and authorization boundaries for the Shift944 application.

## Component Overview

```
HTTP Request 
   │
   ▼
auth.routes.js ──> auth.validator.js (express-validator)
   │
   ▼
auth.controller.js (parses body/params)
   │
   ▼
auth.service.js (orchestrates bcrypt, JWT, and DTO mapping)
   │
   ▼
user.repository.js ──> Prisma Client ──> PostgreSQL
```

- **`auth.routes.js`**: Defines endpoint paths and wires validators, middlewares, and controllers.
- **`auth.validator.js`**: Combines `express-validator` chains with rules imported from the `@shift9/shared` validator module.
- **`auth.controller.js`**: Exposes handlers (`register`, `login`, `getMe`) returning standard API responses.
- **`auth.service.js`**: Implements password hashing (bcrypt), token signature (jsonwebtoken), and User DTO mapping.
- **`user.repository.js`**: Manages all raw Prisma database operations.

## Security Controls

### 1. Password Protection
- Passwords are encrypted before storage using **bcrypt** with **12 salt rounds**.
- The database never stores passwords in plain text.
- The `AuthService.toDTO()` mapper strips the `password` property from the user object before sending it in API responses.

### 2. Token Security
- User sessions are managed via JSON Web Tokens (JWT).
- The token payload contains only non-sensitive identifiers (`id`, `email`).
- Tokens are signed using the `HS256` algorithm with a secure `JWT_SECRET` key configured in the environment variables.

### 3. Input Validation
- The `auth.validator.js` middleware rejects registration requests containing weak passwords. Passwords must be between 8 and 128 characters and include uppercase, lowercase, numbers, and symbols.
- Unprocessable payloads return a standard `422` validation error response.

## Usage Guide

### Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

### Current User (Me)
Requires the `Authorization: Bearer <TOKEN>` header.
```http
GET /api/v1/auth/me
```
