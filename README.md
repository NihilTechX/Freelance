# EliteMatch — Professional Freelance Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

> **EliteMatch** is a full-stack freelance marketplace platform that intelligently connects businesses with world-class freelancers. Post projects, receive proposals, hire talent, manage contracts, and release payments — all in one place.

---

## ✨ Key Features

### For Clients
- 📋 **Post Projects** — Describe your requirements, set a budget, and tag required skills
- 📬 **Receive Proposals** — Freelancers apply with custom cover letters and hourly rates
- 🤝 **Hire & Contract** — Accept the best proposal and instantly create a secure contract
- ✅ **Complete & Review** — Mark projects done and leave verified ratings for freelancers
- 📊 **Dashboard** — Track all active projects, proposals, and contracts at a glance

### For Freelancers
- 🔍 **Browse Projects** — Search open opportunities by keyword
- ✍️ **Submit Proposals** — Send tailored proposals with your rate and cover letter
- 📄 **Manage Contracts** — View all active and completed work agreements
- 👤 **Professional Profile** — Showcase your title, bio, hourly rate, and skill set

### Platform-wide
- 🔒 **JWT Authentication** — Secure login with access + refresh token rotation
- 🔔 **Live Notifications** — Real-time updates for proposals, contracts, and reviews
- 🎯 **Smart Matching** — AI-powered TF-IDF cosine similarity ranks the best freelancers for each job
- 🛡️ **Role-based Access Control** — Strict separation between client, freelancer, and admin capabilities
- ⚡ **Background Jobs** — Async matching score computation with Redis-backed job queue

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend API** | FastAPI (Python 3.11) |
| **Database** | PostgreSQL + SQLAlchemy (async) |
| **Migrations** | Alembic |
| **Auth** | JWT (python-jose), bcrypt |
| **Task Queue** | Celery + Redis |
| **Matching Engine** | scikit-learn TF-IDF + Cosine Similarity |
| **Hosting** | Vercel (frontend) + Render.com (backend) |

---

## 📁 Project Structure

```
elitematch/
├── app/                        # FastAPI backend
│   ├── core/                   # Auth, dependencies, Celery config
│   ├── models/                 # SQLAlchemy ORM models
│   ├── repositories/           # Database access layer (Repository pattern)
│   ├── routers/                # API route handlers
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/               # Business logic layer
│   └── tasks/                  # Celery background tasks
├── alembic/                    # Database migration scripts
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main app with all pages & routing
│   │   ├── api.js              # Axios client with auth interceptors
│   │   └── index.css           # Premium design system (Caramel × Sand × Cream)
│   ├── vercel.json             # Vercel deployment config
│   └── vite.config.js          # Vite config with dev proxy
├── render.yaml                 # Render.com deployment config
├── requirements.txt            # Python dependencies
└── .env.example                # Environment variable template
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### 1. Clone & Install

```bash
git clone https://github.com/NihilTechX/Freelance.git
cd Freelance
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Create the database
createdb freelance_db

# Run migrations
alembic upgrade head
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Run Everything

**Terminal 1 — Backend API:**
```bash
venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Celery Worker:**
```bash
venv\Scripts\celery -A app.core.celery_app.celery_app worker --loglevel=info -P solo
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5174** in your browser.

> The Vite dev server proxies all `/api` requests to the backend — no CORS configuration needed during development.

---

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
# Application
APP_NAME=EliteMatch
APP_VERSION=1.0.0
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/freelance_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# CORS — comma-separated allowed origins
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
```

---

## ☁️ Free Hosting Deployment

### Architecture

```
Browser → Vercel (React Frontend)
            ↓ API calls
         Render.com (FastAPI Backend)
            ↓                ↓
    Render PostgreSQL    Upstash Redis
            ↓
    Render Celery Worker
```

### Step 1 — Backend on Render.com

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New → Blueprint** and connect your GitHub repo
3. Render will auto-detect `render.yaml` and create all services
4. In the **Environment** tab, set:
   - `DATABASE_URL` → your Render PostgreSQL internal URL
   - `REDIS_URL` → your Upstash Redis URL
   - `CELERY_BROKER_URL` → same Upstash Redis URL
   - `CORS_ORIGINS` → `["https://your-app.vercel.app"]`

### Step 2 — Redis on Upstash (Free)

1. Go to [upstash.com](https://upstash.com) → Create Database → Free tier
2. Copy the **Redis URL** (starts with `rediss://`)
3. Use this URL for `REDIS_URL`, `CELERY_BROKER_URL`, and `CELERY_RESULT_BACKEND` in Render

### Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://elitematch-api.onrender.com/api/v1`
4. Click **Deploy**

### Step 4 — Run Database Migrations

After Render deploys the backend:
```bash
# In Render Shell (or locally with production DATABASE_URL):
alembic upgrade head
```

---

## 📡 API Reference

Full interactive API docs available at `/docs` (Swagger UI) and `/redoc` once the backend is running.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user (client/freelancer) |
| POST | `/api/v1/auth/login` | Login, returns JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET  | `/api/v1/auth/me` | Get current user details |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/jobs` | List all open jobs |
| POST | `/api/v1/jobs` | Create new job (client only) |
| GET  | `/api/v1/jobs/{id}` | Get job details |
| POST | `/api/v1/jobs/{id}/status` | Update job status |
| GET  | `/api/v1/jobs/{id}/recommendations` | Get AI-matched freelancers |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/proposals` | Submit proposal (freelancer only) |
| GET  | `/api/v1/proposals/me` | My submitted proposals |
| GET  | `/api/v1/proposals/job/{id}` | Proposals for a job (client only) |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/contracts` | Create contract from accepted proposal |
| GET  | `/api/v1/contracts/me` | My contracts |
| POST | `/api/v1/contracts/{id}/complete` | Mark contract complete (client only) |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (work factor 12)
- JWT tokens with short-lived access tokens (30 min) and rotating refresh tokens
- Refresh tokens stored server-side and invalidated on logout
- Role-based access control enforced on every endpoint
- Input validation via Pydantic schemas (min/max length, non-negative values)

---

## 📜 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ — EliteMatch</p>
