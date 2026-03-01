-- Drop tables if they exist (for development only)
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- ============================================
-- PROPERTIES TABLE

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- UNITS TABLE

CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_number VARCHAR(50) NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms DECIMAL(3,1) NOT NULL CHECK (bathrooms >= 0),
  square_feet INTEGER CHECK (square_feet > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unit numbers are unique within a property
  UNIQUE(property_id, unit_number)
);

-- ============================================
-- TENANTS TABLE

CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LEASES TABLE (Source of truth for occupancy)

CREATE TABLE leases (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  lease_start DATE NOT NULL,
  lease_end DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent > 0),
  security_deposit DECIMAL(10,2) CHECK (security_deposit >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Business rule: lease must have a valid date range
  CHECK (lease_end > lease_start)
);

-- ============================================
-- INDEXES (for query performance)

-- Find all units in a property (common query)
CREATE INDEX idx_units_property_id ON units(property_id);

-- Find all leases for a unit (check for overlaps)
CREATE INDEX idx_leases_unit_id ON leases(unit_id);

-- Find all leases for a tenant
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);

-- Find leases by date range (for expiring leases query)
CREATE INDEX idx_leases_dates ON leases(lease_start, lease_end);

-- ============================================
-- COMMENTS (documentation in the database)

COMMENT ON TABLE leases IS 'Single source of truth for unit occupancy. Never delete - historical record.';
COMMENT ON COLUMN leases.lease_end IS 'Use this to calculate active leases: WHERE NOW() BETWEEN lease_start AND lease_end';