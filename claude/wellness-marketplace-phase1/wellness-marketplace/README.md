# Sohum Wellness — Delhi NCR Wellness Marketplace

A production-oriented wellness services marketplace (massage, physiotherapy, yoga, Ayurveda,
etc.) connecting customers with verified wellness professionals across Delhi NCR.

This is **Phase 1** of the implementation plan: authentication, roles, database schema, basic
registration for customers and professionals, and a working end-to-end login/register flow.
Phases 2–8 (search, booking, payments, admin, notifications, hardening) build on this
foundation — see `PROJECT_PLAN.md` in this repo for the full roadmap taken from the original
spec.

## Stack

- **Backend:** Java 21, Spring Boot 3 (modular monolith), Spring Security + JWT, Spring Data
  JPA, PostgreSQL + PostGIS, Flyway migrations.
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Local dev:** Docker Compose (Postgres+PostGIS, backend, frontend).

## Running locally

### Option A — Docker Compose (easiest)

```bash
docker compose up --build
```

- Backend: http://localhost:8081 (mapped from container port 8080, to avoid clashing with
  anything else already using 8080 on your machine)
- Frontend: http://localhost:3001 (mapped from container port 3000, same reasoning)
- Postgres: localhost:5433 (db `wellness`, user/password `wellness`) — mapped to 5433 on the
  host to avoid clashing with a local Postgres install; the backend talks to it internally on
  the default 5432 via the Docker network, so this only matters if you want to connect from a
  host tool like `psql` or a GUI client.

Flyway runs the schema migration automatically on backend startup.

### Option B — run services individually

**Backend:**
```bash
cd backend
cp .env.example .env   # edit if needed
# requires a running Postgres+PostGIS instance matching .env
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## What's implemented (Phase 1)

- `POST /api/auth/register` — creates a `User` + role (`CUSTOMER` or `PROFESSIONAL`) + the
  matching profile row.
- `POST /api/auth/login`, `POST /api/auth/refresh` (rotating, single-use refresh tokens),
  `POST /api/auth/logout` (revokes the refresh token).
- `GET /api/customers/me`, `GET`/`PUT /api/professionals/me`.
- Full database schema for every entity in the spec (bookings, payments, reviews, favorites,
  notifications, reports, audit logs) via Flyway, including the **partial unique index that
  prevents double-booking** at the database level.
- A minimal `BookingService` + a Testcontainers-backed concurrency test
  (`BookingConcurrencyTest`) proving two simultaneous booking attempts for the same
  professional/slot cannot both succeed — this is the reliability guarantee the full booking
  module (Phase 3) will build on.
- Frontend: home page, customer registration/login, professional onboarding Step 1 (account
  creation) — all wired to the real backend, no mocked responses.

## What's intentionally NOT yet built

Search & filtering, the full booking flow, availability management, payments, reviews,
favorites, notifications, the admin dashboard, and SEO/production hardening are all scoped for
later phases per `PROJECT_PLAN.md`. Nothing in the current UI claims to do more than it does —
the professional onboarding flow explicitly tells the user that steps 2–6 are coming next.

## Running tests

```bash
cd backend
mvn test
```

`BookingConcurrencyTest` and `AuthFlowTest` spin up a real Postgres+PostGIS container via
Testcontainers (needs Docker available to the test runner).

## Security notes

- Passwords hashed with BCrypt.
- Access tokens are short-lived JWTs (15 min); refresh tokens are opaque, single-use, and
  rotated on every use (stored as `id.secret`, only a BCrypt hash of the secret is persisted).
- All authorization is enforced server-side (`@PreAuthorize` + deriving the acting user from
  the validated JWT, never from client-supplied IDs).
