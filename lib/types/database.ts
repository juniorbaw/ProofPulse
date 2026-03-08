export type Plan = 'free' | 'starter' | 'pro' | 'agency'
export type WidgetType = 'recent_purchase' | 'live_visitors' | 'stock_urgency' | 'social_count' | 'custom'
export type EventType = 'purchase' | 'page_view' | 'add_to_cart' | 'signup' | 'custom'

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  subscription_status: string
  widget_api_key: string
  api_key: string
  monthly_impressions: number
  impressions_limit: number
  allowed_domains: string[] | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  org_id: string
  domain: string
  name: string | null
  verified: boolean
  verification_token: string
  last_ping_at: string | null
  created_at: string
}

export interface WidgetConfig {
  enabled: boolean
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  delay_seconds: number
  duration_seconds: number
  interval_seconds: number
  theme: 'light' | 'dark' | 'auto'
  animation: 'slide-in' | 'fade' | 'bounce'
  show_on_mobile: boolean
  pages_filter: string[]
  text_template: string | null
  style: {
    border_radius: number
    font_family: string
    accent_color: string
    text_color: string
    bg_color: string
  }
}

export interface Widget {
  id: string
  org_id: string
  site_id: string | null
  name: string
  type: WidgetType
  config: WidgetConfig
  is_active: boolean
  impressions: number
  clicks: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  org_id: string
  site_id: string | null
  widget_id: string | null
  type: EventType
  data: {
    product_name?: string
    buyer_name?: string
    buyer_city?: string
    price?: number
    image_url?: string
    quantity?: number
    stock_remaining?: number
    visitors_count?: number
    purchases_count?: number
    custom_message?: string
  }
  ip_hash: string | null
  country: string | null
  created_at: string
}

export interface Impression {
  id: string
  org_id: string
  widget_id: string
  date: string
  count: number
  clicks: number
}

export type Database = {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> }
      sites: { Row: Site; Insert: Partial<Site>; Update: Partial<Site> }
      widgets: { Row: Widget; Insert: Partial<Widget>; Update: Partial<Widget> }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> }
      impressions: { Row: Impression; Insert: Partial<Impression>; Update: Partial<Impression> }
    }
  }
}
