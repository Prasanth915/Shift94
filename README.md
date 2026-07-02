# Shift94

> Create once. Publish everywhere.

Shift94 is a developer portfolio automation platform that lets you create a single project post and publish it to multiple professional platforms from one dashboard.

![Shift94](https://img.shields.io/badge/Shift_9-Developer_Platform-000000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+)

## ✨ Features

### MVP (v1.0)

| Platform | Status | Capabilities |
|----------|--------|-------------|
| **LinkedIn** | ✅ Live | OAuth · Post with Image · Status Tracking |
| **GitHub** | ✅ Live | OAuth · Repo Selection · Metadata Storage |
| **Instagram** | 🚧 Coming Soon | UI placeholder only |
| **Portfolio Website** | 🚧 Coming Soon | UI placeholder only |

### Core Features

- 🔐 **Authentication** — Register, login, JWT-based sessions
- 📊 **Dashboard** — Statistics, connected accounts, recent projects
- 📝 **Create Project** — Title, description, image, tech stack, tags
- 📡 **Multi-Platform Publish** — One click to publish everywhere
- 📜 **History** — Track all publish events with status
- ⚙️ **Settings** — Profile, password, platform connections

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- React Hook Form
- Framer Motion
- Axios

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing

### Integrations
- LinkedIn OAuth 2.0 + Posts API
- GitHub OAuth + REST API

## 📁 Project Structure

```
Shift94/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI primitives
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   └── project/       # Project form components
│   │   ├── pages/             # Route pages
│   │   ├── layouts/           # Auth & Dashboard layouts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context providers
│   │   └── assets/            # Static assets
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── controllers/           # Route handlers
│   ├── routes/                # Express routes
│   ├── services/              # Business logic
│   ├── middleware/             # Auth, upload, validation
│   ├── config/                # Configuration
│   ├── utils/                 # Helpers (encryption, response)
│   ├── uploads/               # Local file storage
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── server.js              # Express entry point
│
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **PostgreSQL** v14+
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Shift94.git
cd Shift94
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `ENCRYPTION_KEY` | 32-char key for token encryption |
| `LINKEDIN_CLIENT_ID` | From LinkedIn Developer Portal |
| `LINKEDIN_CLIENT_SECRET` | From LinkedIn Developer Portal |
| `LINKEDIN_REDIRECT_URI` | OAuth callback URL |
| `GITHUB_CLIENT_ID` | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | From GitHub Developer Settings |
| `GITHUB_REDIRECT_URI` | OAuth callback URL |

### 3. Backend Setup

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The backend runs on `http://localhost:5000`.

### 4. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend runs on `http://localhost:5173`.

## 🔑 OAuth Setup

### LinkedIn

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Enable the **"Share on LinkedIn"** product
4. Add redirect URL: `http://localhost:5173/oauth/callback`
5. Copy Client ID and Client Secret to `.env`

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new **OAuth App**
3. Set callback URL: `http://localhost:5173/oauth/callback`
4. Copy Client ID and Client Secret to `.env`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/project` | Create project |
| GET | `/api/project` | List projects |
| GET | `/api/project/:id` | Get project |
| PUT | `/api/project/:id` | Update project |
| DELETE | `/api/project/:id` | Delete project |

### OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/oauth/linkedin` | Get LinkedIn auth URL |
| GET | `/api/oauth/linkedin/callback` | LinkedIn OAuth callback |
| GET | `/api/oauth/github` | Get GitHub auth URL |
| GET | `/api/oauth/github/callback` | GitHub OAuth callback |
| GET | `/api/oauth/accounts` | List connected accounts |
| DELETE | `/api/oauth/:platform` | Disconnect account |

### Publishing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/publish/linkedin` | Publish to LinkedIn |
| POST | `/api/publish/github` | Publish to GitHub |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get publish history |

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with configurable expiry
- OAuth tokens encrypted with AES-256-CBC
- Rate limiting on all API routes
- Helmet security headers
- CORS configured for frontend origin
- Input validation on all endpoints
- Environment variables for all secrets

## 📋 Database Schema

```
User ──< ConnectedAccount
User ──< Project ──< PublishLog
```

- **User** — Authentication and profile
- **ConnectedAccount** — OAuth connections (LinkedIn, GitHub)
- **Project** — Developer project posts
- **PublishLog** — Platform publish history

## 🗺 Roadmap

- [ ] Instagram Integration
- [ ] Portfolio Website Generator
- [ ] Twitter/X Publishing
- [ ] Dev.to Publishing
- [ ] Team Collaboration
- [ ] Analytics Dashboard
- [ ] Scheduled Publishing
- [ ] Rich Text Editor

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by Shift94**
