-- ═══════════════════════════════════════════
-- ProofPulse — Migration initiale complète
-- ═══════════════════════════════════════════

-- Organizations (multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  widget_api_key TEXT UNIQUE DEFAULT 'pp_live_' || encode(gen_random_bytes(18), 'hex'),
  monthly_impressions INT DEFAULT 0,
  impressions_limit INT DEFAULT 1000,
  settings JSONB DEFAULT '{"language": "fr", "email_notifications": true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sites connectés
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  verified BOOLEAN DEFAULT false,
  verification_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
  last_ping_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, domain)
);

-- Widgets
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recent_purchase', 'live_visitors', 'stock_urgency', 'social_count', 'custom')),
  config JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "position": "bottom-left",
    "delay_seconds": 3,
    "duration_seconds": 5,
    "interval_seconds": 8,
    "theme": "light",
    "animation": "slide-in",
    "show_on_mobile": true,
    "pages_filter": [],
    "text_template": null,
    "style": {
      "border_radius": 12,
      "font_family": "inherit",
      "accent_color": "#4F46E5",
      "text_color": "#111827",
      "bg_color": "#ffffff"
    }
  }',
  is_active BOOLEAN DEFAULT true,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Événements (achats, visites, etc.)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  widget_id UUID REFERENCES widgets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'page_view', 'add_to_cart', 'signup', 'custom')),
  data JSONB NOT NULL DEFAULT '{}',
  ip_hash TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics agrégées
CREATE TABLE IF NOT EXISTS impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  clicks INT DEFAULT 0,
  UNIQUE(widget_id, date)
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_events_org_created ON events(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(org_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impressions_widget_date ON impressions(widget_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_org ON widgets(org_id, is_active);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_owner" ON organizations FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "org_sites" ON sites FOR ALL USING (
  org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
CREATE POLICY "org_widgets" ON widgets FOR ALL USING (
  org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
CREATE POLICY "org_events" ON events FOR ALL USING (
  org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
CREATE POLICY "org_impressions" ON impressions FOR ALL USING (
  org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

-- Fonction upsert impressions
CREATE OR REPLACE FUNCTION increment_impression(p_widget_id UUID, p_org_id UUID, p_clicked BOOLEAN DEFAULT false)
RETURNS VOID AS $$
BEGIN
  INSERT INTO impressions (widget_id, org_id, date, count, clicks)
  VALUES (p_widget_id, p_org_id, CURRENT_DATE, 1, CASE WHEN p_clicked THEN 1 ELSE 0 END)
  ON CONFLICT (widget_id, date)
  DO UPDATE SET
    count = impressions.count + 1,
    clicks = impressions.clicks + CASE WHEN p_clicked THEN 1 ELSE 0 END;

  UPDATE organizations SET monthly_impressions = monthly_impressions + 1 WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction reset mensuel impressions
CREATE OR REPLACE FUNCTION reset_monthly_impressions()
RETURNS VOID AS $$
BEGIN
  UPDATE organizations SET monthly_impressions = 0;
END;
$$ LANGUAGE plpgsql;
