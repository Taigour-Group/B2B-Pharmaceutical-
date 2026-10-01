DO $$ BEGIN
    CREATE TYPE customer_status AS ENUM ('UNDER_REVIEW', 'VERIFIED', 'SUSPENDED', 'RESUBMISSION_REQUIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    proprietor_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pan_vat_number VARCHAR(50) UNIQUE NOT NULL,
    business_reg_number VARCHAR(100) NOT NULL,
    dda_license_number VARCHAR(100) UNIQUE NOT NULL,
    pharmacist_name VARCHAR(255) NOT NULL,
    npc_registration_number VARCHAR(100) NOT NULL,
    license_expiry_date DATE NOT NULL,
    address_province VARCHAR(100) NOT NULL,
    address_district VARCHAR(100) NOT NULL,
    address_municipality VARCHAR(100) NOT NULL,
    address_ward VARCHAR(50) NOT NULL,
    address_street VARCHAR(255) NOT NULL,
    address_latitude NUMERIC(9, 6),
    address_longitude NUMERIC(9, 6),
    account_status customer_status NOT NULL DEFAULT 'UNDER_REVIEW',
    verification_notes TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    used_credit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_terms VARCHAR(100) NOT NULL DEFAULT 'Cash/Advance',
    tier VARCHAR(50) NOT NULL DEFAULT 'Standard Wholesale',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL CHECK (role IN (
        'admin', 'verification_officer', 'inventory_staff',
        'accountant', 'sales_staff', 'delivery_staff'
    )),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
    token_hash CHAR(64) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_type VARCHAR(16) NOT NULL CHECK (user_type IN ('customer', 'staff')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS auth_refresh_tokens_user_idx
    ON auth_refresh_tokens (user_type, user_id);
CREATE INDEX IF NOT EXISTS auth_refresh_tokens_expiry_idx
    ON auth_refresh_tokens (expires_at);

GRANT SELECT, INSERT ON TABLE public.customers, public.staff_users TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE public.auth_refresh_tokens TO service_role;

CREATE OR REPLACE FUNCTION public.rotate_auth_refresh_token(
    p_previous_token_hash CHAR(64),
    p_next_token_hash CHAR(64),
    p_expires_at TIMESTAMPTZ
)
RETURNS TABLE (user_id VARCHAR(36), user_type VARCHAR(16))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    previous_token auth_refresh_tokens%ROWTYPE;
BEGIN
    SELECT * INTO previous_token
    FROM auth_refresh_tokens
    WHERE token_hash = p_previous_token_hash AND expires_at > NOW()
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    DELETE FROM auth_refresh_tokens
    WHERE token_hash = p_previous_token_hash;

    INSERT INTO auth_refresh_tokens (token_hash, user_id, user_type, expires_at)
    VALUES (p_next_token_hash, previous_token.user_id, previous_token.user_type, p_expires_at);

    RETURN QUERY SELECT previous_token.user_id, previous_token.user_type;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_auth_refresh_token(CHAR(64), CHAR(64), TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_auth_refresh_token(CHAR(64), CHAR(64), TIMESTAMPTZ) TO service_role;
