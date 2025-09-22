-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS tenant;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_users_email ON tenant.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON tenant.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fmpa_dates ON tenant.fmpas(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_fmpa_status ON tenant.fmpas(status);

-- Row Level Security (RLS) policies will be added via Prisma migrations
