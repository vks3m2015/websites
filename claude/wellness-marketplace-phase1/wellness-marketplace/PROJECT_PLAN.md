# Implementation Roadmap

## Phase 1 — Foundation ✅ (this drop)
- Project structure, modular monolith layout
- Authentication (JWT access + rotating refresh tokens), roles (CUSTOMER/PROFESSIONAL/ADMIN)
- Full database schema (Flyway)
- Basic UI (home, login, register)
- Professional registration (Step 1: account) + Customer registration

## Phase 2 — Professional Marketplace
- Professional profile completion (Steps 2–6: info, services, availability, portfolio, verification)
- Public search with PostGIS radius queries, filters (distance/service/price/rating/experience)
- Public professional profile pages (SEO-friendly)

## Phase 3 — Booking
- Slot generation from weekly availability + exceptions
- Booking creation/cancellation/reschedule with configurable business rules
- Full concurrency-safe booking API (foundation already in place, see BookingService)

## Phase 4 — Customer Features
- Favorites, reviews (post-completion only), booking history, notifications, calling integration

## Phase 5 — Professional Dashboard
- Upcoming/past bookings, earnings dashboard, availability management UI

## Phase 6 — Admin
- Verification workflow, user/professional management, content moderation, reports, analytics

## Phase 7 — Payments
- Payment abstraction + provider adapter (Razorpay/Stripe), idempotency, refunds

## Phase 8 — Production Hardening
- Rate limiting, audit logging surfaces, monitoring hooks, SEO (sitemap, structured data),
  automated test coverage expansion, deployment pipeline
