-- Ensure mother_profiles is cleared if it has dead links
TRUNCATE TABLE mother_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert an Admin
INSERT INTO users (user_id, password_hash, role, is_active, staff_id, created_at, updated_at)
VALUES (
    '0771234567',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMebJLKecAy6',
    'ADMIN',
    true,
    'ADMIN-MASTER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);