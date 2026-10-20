-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USERS & ROLES =====================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, DEACTIVATED
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL -- CUSTOMER, PROFESSIONAL, ADMIN
);
INSERT INTO roles (name) VALUES ('CUSTOMER'), ('PROFESSIONAL'), ('ADMIN');

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ===================== CUSTOMERS =====================
CREATE TABLE customer_profiles (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name               VARCHAR(150) NOT NULL,
    profile_photo_url  VARCHAR(500),
    preferred_area     VARCHAR(150),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== PROFESSIONALS =====================
CREATE TABLE professional_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    gender              VARCHAR(20),
    experience_years    INT DEFAULT 0,
    about               TEXT,
    languages           VARCHAR(255),
    areas_served        VARCHAR(500),
    profile_photo_url   VARCHAR(500),
    location            geography(Point,4326),
    location_label      VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        -- DRAFT, SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED
    average_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count        INT NOT NULL DEFAULT 0,
    is_publicly_listed  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prof_profiles_status ON professional_profiles(status);
CREATE INDEX idx_prof_profiles_location ON professional_profiles USING GIST (location);

CREATE TABLE professional_verifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id     UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    document_type       VARCHAR(100),
    document_url        VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    reviewer_notes      TEXT,
    reviewed_by         UUID REFERENCES users(id),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ
);

CREATE TABLE portfolio_images (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    image_url        VARCHAR(500) NOT NULL,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    sort_order       INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== SERVICES =====================
CREATE TABLE services (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE professional_services (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    service_id       UUID NOT NULL REFERENCES services(id),
    description      TEXT,
    duration_minutes INT NOT NULL,
    price            NUMERIC(10,2) NOT NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (professional_id, service_id)
);
CREATE INDEX idx_prof_services_service ON professional_services(service_id);

-- ===================== AVAILABILITY =====================
CREATE TABLE professional_availability (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    day_of_week      SMALLINT NOT NULL, -- 0=Sunday .. 6=Saturday
    start_time       TIME NOT NULL,
    end_time         TIME NOT NULL,
    CONSTRAINT chk_availability_time CHECK (end_time > start_time)
);
CREATE INDEX idx_availability_professional ON professional_availability(professional_id);

CREATE TABLE availability_exceptions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    exception_date   DATE NOT NULL,
    is_unavailable   BOOLEAN NOT NULL DEFAULT TRUE,
    start_time       TIME,
    end_time         TIME,
    reason           VARCHAR(255)
);

-- ===================== BOOKINGS =====================
CREATE TABLE bookings (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id          UUID NOT NULL REFERENCES customer_profiles(id),
    professional_id      UUID NOT NULL REFERENCES professional_profiles(id),
    professional_service_id UUID NOT NULL REFERENCES professional_services(id),
    start_time           TIMESTAMPTZ NOT NULL,
    end_time             TIMESTAMPTZ NOT NULL,
    price                NUMERIC(10,2) NOT NULL,
    status               VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        -- PENDING, CONFIRMED, REJECTED, CANCELLED_BY_CUSTOMER, CANCELLED_BY_PROFESSIONAL, COMPLETED, NO_SHOW
    cancellation_reason  VARCHAR(500),
    cancelled_at         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_professional ON bookings(professional_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Prevent double-booking: only one non-terminal booking per professional/start_time
CREATE UNIQUE INDEX uq_booking_slot_active
    ON bookings (professional_id, start_time)
    WHERE status IN ('PENDING','CONFIRMED');

CREATE TABLE booking_status_history (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status   VARCHAR(30) NOT NULL,
    changed_by  UUID REFERENCES users(id),
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes       VARCHAR(500)
);

-- ===================== PAYMENTS =====================
CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id       UUID NOT NULL REFERENCES bookings(id),
    idempotency_key  VARCHAR(100) NOT NULL UNIQUE,
    amount           NUMERIC(10,2) NOT NULL,
    currency         VARCHAR(10) NOT NULL DEFAULT 'INR',
    provider         VARCHAR(50),
    status           VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
        -- INITIATED, PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_transactions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id   UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    provider_ref VARCHAR(255),
    status       VARCHAR(30) NOT NULL,
    raw_payload  JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== REVIEWS & FAVORITES =====================
CREATE TABLE reviews (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id       UUID NOT NULL UNIQUE REFERENCES bookings(id),
    customer_id      UUID NOT NULL REFERENCES customer_profiles(id),
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id),
    rating           SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE', -- VISIBLE, HIDDEN
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_professional ON reviews(professional_id);

CREATE TABLE favorites (
    customer_id      UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    professional_id  UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (customer_id, professional_id)
);

-- ===================== NOTIFICATIONS =====================
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(60) NOT NULL,
    channel     VARCHAR(20) NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, SMS, PUSH, WHATSAPP
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ===================== REPORTS & AUDIT =====================
CREATE TABLE reports (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id UUID NOT NULL REFERENCES users(id),
    target_type      VARCHAR(30) NOT NULL, -- PROFESSIONAL, CUSTOMER, REVIEW, IMAGE, PROFILE, OTHER
    target_id        UUID,
    reason           VARCHAR(255) NOT NULL,
    description      TEXT,
    status           VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, DISMISSED
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at      TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(60),
    entity_id   VARCHAR(100),
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
