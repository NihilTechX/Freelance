# Freelance Platform

A full-stack freelance marketplace platform that connects freelancers with job opportunities using intelligent matching algorithms.

## Features

- **User Authentication & Profiles**: Secure JWT-based authentication with detailed user profiles and skill management
- **Job Management**: Post, search, and manage freelance jobs with detailed descriptions and requirements
- **Intelligent Matching**: ML-powered matching engine that recommends suitable freelancers for jobs based on skills and experience
- **Proposals & Contracts**: Freelancers can submit proposals, and clients can accept/reject them with contract management
- **Reviews & Ratings**: Comprehensive review system for both freelancers and clients
- **Notifications**: Real-time notifications for proposals, reviews, and contract updates
- **Asynchronous Tasks**: Celery-based background job processing for matching and notifications

## Tech Stack

### Backend
- **Framework**: FastAPI with Uvicorn ASGI server
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Async Support**: asyncpg for async database operations
- **Authentication**: JWT tokens with Python-Jose
- **Task Queue**: Celery with Redis broker
- **Matching Engine**: Scikit-learn for ML-based job-freelancer matching
- **Migrations**: Alembic for database schema management

### Frontend
- **Library**: React 19 with Vite
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons
- **Charting**: Recharts for data visualization
- **Styling**: CSS (customizable)

### Infrastructure
- **Database**: PostgreSQL 15 (Docker)
- **Cache/Broker**: Redis 7 (Docker)
- **Containerization**: Docker & Docker Compose

## Project Structure

```
.
├── app/
│   ├── main.py                 # FastAPI application setup
│   ├── config.py               # Configuration and settings
│   ├── database.py             # Database connection setup
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py            # User model with authentication
│   │   ├── job.py             # Job posting model
│   │   ├── profile.py         # Freelancer profiles and skills
│   │   ├── proposal_contract.py# Proposals and contracts
│   │   └── review_notification.py# Reviews and notifications
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API endpoint routers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── jobs.py            # Job management endpoints
│   │   ├── profiles.py        # Profile management endpoints
│   │   ├── matching.py        # Job matching endpoints
│   │   ├── proposals.py       # Proposal endpoints
│   │   ├── contracts.py       # Contract management endpoints
│   │   ├── reviews.py         # Review endpoints
│   │   └── notifications.py   # Notification endpoints
│   ├── services/               # Business logic layer
│   ├── repositories/           # Data access layer
│   ├── core/
│   │   ├── security.py        # JWT and password utilities
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   ├── exceptions.py      # Custom exception handlers
│   │   └── celery_app.py      # Celery configuration
│   └── tasks/                  # Celery background tasks
├── alembic/                    # Database migrations
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── api.js             # API client configuration
│   │   ├── components/        # Reusable components
│   │   └── pages/             # Page components
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Frontend dependencies
├── scripts/
│   └── seed.py                # Database seed script for testing
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Backend Docker image
└── requirements.txt            # Python dependencies
```

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Python 3.9+, Node.js 18+, PostgreSQL 15, Redis 7

### Option 1: Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/NihilTechX/Freelance.git
cd Freelance

# Start all services
docker-compose up -d

# Run database migrations
docker exec freelance_backend alembic upgrade head

# Seed database (optional)
docker exec freelance_backend python scripts/seed.py

# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development Setup

#### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database and Redis credentials

# Start PostgreSQL and Redis
docker-compose up db redis -d

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload

# Start Celery worker (in another terminal)
celery -A app.core.celery_app worker --loglevel=info
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs at http://localhost:5173
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Profiles
- `GET /profiles` - List all profiles
- `GET /profiles/{user_id}` - Get profile details
- `PUT /profiles/{user_id}` - Update profile
- `POST /profiles/{user_id}/skills` - Add skills to profile

### Jobs
- `POST /jobs` - Create new job posting
- `GET /jobs` - List all jobs
- `GET /jobs/{job_id}` - Get job details
- `PUT /jobs/{job_id}` - Update job
- `DELETE /jobs/{job_id}` - Delete job

### Matching
- `GET /matching/recommended` - Get recommended freelancers for job
- `POST /matching/match-job` - Run matching algorithm

### Proposals
- `POST /proposals` - Submit proposal for job
- `GET /proposals` - List proposals
- `PUT /proposals/{proposal_id}` - Update proposal status

### Contracts
- `POST /contracts` - Create contract from accepted proposal
- `GET /contracts` - List contracts
- `PUT /contracts/{contract_id}` - Update contract status

### Reviews
- `POST /reviews` - Leave review
- `GET /reviews/{user_id}` - Get reviews for user

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/{notification_id}` - Mark notification as read

### System
- `GET /health` - Health check endpoint

Full API documentation available at `/docs` when running the backend.

## Database Schema

The platform uses the following main entities:

- **users**: User accounts with authentication
- **user_profiles**: Freelancer profile information with skills
- **jobs**: Job postings by clients
- **proposals**: Freelancer proposals for jobs
- **contracts**: Accepted proposals converted to contracts
- **reviews**: Ratings and reviews between users
- **notifications**: System notifications for users

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://freelance_user:freelance_pass@localhost:5432/freelance_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# App
APP_NAME=Freelance Platform
APP_VERSION=1.0.0
```

## Development

### Running Tests
```bash
# Backend tests (if implemented)
pytest

# Frontend tests (if implemented)
npm test
```

### Code Quality
```bash
# Lint frontend
cd frontend && npm run lint

# Format code
# Add your formatter setup here
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Revert migration:
```bash
alembic downgrade -1
```

## Architecture

### Backend Architecture
- **Layered Architecture**: Controllers (Routers) → Services → Repositories → Models
- **Dependency Injection**: FastAPI dependencies for database sessions and authentication
- **Async/Await**: Full async support for better performance
- **Background Tasks**: Celery for asynchronous job matching and notifications

### Matching Algorithm
The intelligent matching system uses:
- Skill similarity matching based on user profiles
- Job requirement analysis
- Freelancer experience level evaluation
- Historical success metrics

### Security
- JWT token-based authentication
- Bcrypt password hashing
- CORS middleware for cross-origin requests
- Environment-based configuration management

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend frontend

# Stop services
docker-compose down
```

### Production Considerations
- Use environment variables for sensitive data
- Set up HTTPS/SSL certificates
- Configure proper database backups
- Use production-grade Redis configuration
- Set up monitoring and logging
- Configure proper CORS origins
- Use a production ASGI server (Gunicorn)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@freelanceplatform.com or open an issue on GitHub.

## Roadmap

- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Portfolio/work samples
- [ ] Video call integration
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Multi-language support

---

**Built with ❤️ by the Freelance Platform Team**
