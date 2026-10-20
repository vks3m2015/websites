# Delhi NCR Wellness Marketplace — Phase 1

A runnable Phase 1 MVP for a professional wellness-services marketplace.

## Stack

- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: Java 21 + Spring Boot 3.5 + Spring Data JPA
- Database: PostgreSQL + PostGIS
- Authentication: JWT
- Local development: Docker Compose

## Phase 1 features

- Customer and professional registration/login
- Professional profile creation/editing
- Professional services
- Weekly availability
- Nearby professional search using PostGIS
- Professional profile page
- Customer booking
- Transactional double-booking protection
- Customer booking list
- Professional booking list
- Demo seed data

## Run

Prerequisites:
- Docker Desktop
- Docker Compose
- Node.js 20+ (only if running frontend outside Docker)
- Java 21 + Maven (only if running backend outside Docker)

### Option A — Docker

```bash
docker compose up --build
```

Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

Demo accounts:
- Customer: customer@example.com / password123
- Professional: professional@example.com / password123
- Admin: admin@example.com / password123

### Option B — run services individually

Start PostgreSQL/PostGIS:

```bash
docker compose up db
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Important

This is an MVP development build. Before production use, add:
- Production secret management
- Email/OTP verification
- Stronger JWT refresh-token strategy
- Object storage for images
- Payment provider
- SMS/push notifications
- Professional verification workflow
- Full moderation/audit tooling
- HTTPS and production deployment configuration
