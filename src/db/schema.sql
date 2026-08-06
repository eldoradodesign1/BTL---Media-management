-- =========================================================
-- MEDIA CAMPAIGN MANAGER - SUPABASE & POSTGRESQL SCHEMA DDL
-- Normalized Architecture for Enterprise Campaign Tracking
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (code, name, description) VALUES
('admin', 'Administrateur Général', 'Accès complet à la configuration, validation et exports'),
('media_manager', 'Responsable Média', 'Gestion des campagnes, événements et diffusions'),
('finance', 'Responsable Financier', 'Gestion des paiements et validation des montants'),
('auditor', 'Auditeur / Consultation', 'Accès en lecture seule et rapports d''audit')
ON CONFLICT (code) DO NOTHING;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGIONS
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDIA TYPES
CREATE TABLE IF NOT EXISTS media_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

INSERT INTO media_types (code, label, icon) VALUES
('TV', 'Télévision', 'tv'),
('Radio', 'Radio', 'radio'),
('Presse Écrite', 'Presse Écrite', 'newspaper'),
('Digital', 'Digital / Web', 'globe'),
('Affichage', 'Affichage (OOH)', 'monitor')
ON CONFLICT (code) DO NOTHING;

-- 6. FOCAL POINTS
CREATE TABLE IF NOT EXISTS focal_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MEDIAS
CREATE TABLE IF NOT EXISTS medias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  type_id UUID REFERENCES media_types(id) ON DELETE RESTRICT,
  transport_fee NUMERIC(12, 2) DEFAULT 0.00,
  phone VARCHAR(50),
  default_focal_point_id UUID REFERENCES focal_points(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link focal point to media
ALTER TABLE focal_points ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES medias(id) ON DELETE CASCADE;

-- 8. PRICING & PRICING VERSIONS (MATRIX)
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES medias(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rate_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  effective_date DATE DEFAULT CURRENT_DATE,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_media_client_pricing UNIQUE(media_id, client_id)
);

CREATE TABLE IF NOT EXISTS pricing_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_id UUID NOT NULL REFERENCES pricing(id) ON DELETE CASCADE,
  rate_amount NUMERIC(12, 2) NOT NULL,
  version INT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  name VARCHAR(200) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'Planifié',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MEDIA_EVENTS (DIFFUSIONS / COVERAGE)
CREATE TABLE IF NOT EXISTS media_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES medias(id) ON DELETE RESTRICT,
  proof_of_diffusion TEXT,
  expense_type VARCHAR(50) CHECK (expense_type IN ('Transport', 'Tarif Média')),
  amount NUMERIC(12, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN proof_of_diffusion IS NULL OR TRIM(proof_of_diffusion) = '' THEN 0.00
      WHEN expense_type = 'Transport' THEN (SELECT transport_fee FROM medias WHERE id = media_id)
      ELSE COALESCE(
        (SELECT rate_amount FROM pricing p 
         JOIN events e ON e.id = event_id 
         WHERE p.media_id = media_events.media_id AND p.client_id = e.client_id LIMIT 1),
        0.00
      )
    END
  ) STORED,
  paid NUMERIC(12, 2) DEFAULT 0.00,
  pending NUMERIC(12, 2) GENERATED ALWAYS AS (amount - paid) STORED,
  focal_point_id UUID REFERENCES focal_points(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MEDIA_PAYMENTS
CREATE TABLE IF NOT EXISTS media_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  media_id UUID NOT NULL REFERENCES medias(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  focal_point_id UUID REFERENCES focal_points(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to recalculate media_events.paid on media_payments insert/update/delete
CREATE OR REPLACE FUNCTION update_media_events_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE media_events
  SET paid = COALESCE((
    SELECT SUM(amount) FROM media_payments
    WHERE media_id = NEW.media_id AND event_id = NEW.event_id
  ), 0.00)
  WHERE media_id = NEW.media_id AND event_id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_paid
AFTER INSERT OR UPDATE OR DELETE ON media_payments
FOR EACH ROW EXECUTE FUNCTION update_media_events_paid();

-- 12. ATTACHMENTS
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS SECURITY POLICIES EXAMPLE FOR SUPABASE
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for media_manager and admin" ON events FOR ALL USING (auth.role() IN ('authenticated'));
