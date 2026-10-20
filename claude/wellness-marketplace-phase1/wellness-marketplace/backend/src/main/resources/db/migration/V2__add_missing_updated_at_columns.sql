-- ProfessionalService and Service entities extend BaseEntity, which expects both
-- created_at AND updated_at. V1 only added created_at to these two tables - fixing that here
-- via a new migration rather than editing V1, so this applies cleanly even on databases where
-- V1 has already run.

ALTER TABLE services
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE professional_services
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
