# Shift 9 — Local Run Instructions

Follow these instructions to run the complete Shift 9 MVP application locally on your machine.

## Prerequisites
1. **Node.js**: Ensure Node.js (v18 or higher) is installed.
2. **PostgreSQL**: Ensure a local PostgreSQL database is running.

---

## 1. Database Setup
1. Create a database named `shift9` on your local PostgreSQL server.
2. In the `backend/` directory, create a `.env` file based on `.env.example` and set your `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/shift9?schema=public"
   JWT_SECRET="your_jwt_secret_here"
   ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" # 64-char hex
   ```
3. Run the Prisma migrations to create the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed the database with mock data:
   ```bash
   node prisma/seed.js
   ```

---

## 2. Run the Backend Server
1. Navigate to the `backend/` directory.
2. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---

## 3. Run the Frontend Client
1. Navigate to the `frontend/` directory.
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:5173`. Open this URL in your browser.

---

## 4. Run Test Suites
To run the backend and frontend test suites, execute the following commands in their respective directories:

### Backend Tests
```bash
node src/run-all-tests.js
```

### Frontend Tests
```bash
node src/auth-ui.test.js
node src/frontend.test.js
```
