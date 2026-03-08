import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ImpressionRow {
  date: string
  count: number
  clicks: number
  widget_id: string
}

interface WidgetRow {
  id: string
  name: string
  type: string
  impressions: number
  clicks: number
  is_active: boolean
}

interface EventRow {
  type: string
  created_at: string
}

interface OrgRow {
  id: string
  monthly_impressions: number
  impressions_limit: number
  plan: string
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const range = req.nextUrl.searchParams.get('range') ?? '30d'
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

  const orgRes = await supabase
    .from('organizations')
    .select('id, monthly_impressions, impressions_limit, plan')
    .eq('owner_id', user.id)
    .single()

  const org = orgRes.data as OrgRow | null
  if (!org) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })

  const orgId: string = org.id

  const [impressionsRes, widgetsRes, eventsRes] = await Promise.all([
    supabase
      .from('impressions')
      .select('date, count, clicks, widget_id')
      .eq('org_id', orgId)
      .gte('date', from)
      .order('date'),
    supabase
      .from('widgets')
      .select('id, name, type, impressions, clicks, is_active')
      .eq('org_id', orgId),
    supabase
      .from('events')
      .select('type, created_at')
      .eq('org_id', orgId)
      .gte('created_at', from + 'T00:00:00Z'),
  ])

  const impressions = (impressionsRes.data ?? []) as ImpressionRow[]
  const widgets = (widgetsRes.data ?? []) as WidgetRow[]
  const events = (eventsRes.data ?? []) as EventRow[]

  const totalImpressions = impressions.reduce((s, r) => s + (r.count ?? 0), 0)
  const totalClicks = impressions.reduce((s, r) => s + (r.clicks ?? 0), 0)
  const ctr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0

  // Données journalières
  const dailyMap: Record<string, { impressions: number; clicks: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    dailyMap[d] = { impressions: 0, clicks: 0 }
  }
  for (const r of impressions) {
    if (dailyMap[r.date]) {
      dailyMap[r.date].impressions += r.count ?? 0
      dailyMap[r.date].clicks += r.clicks ?? 0
    }
  }

  // Heatmap heures (depuis les events)
  const hourMap: Record<number, number> = {}
  for (let h = 0; h < 24; h++) hourMap[h] = 0
  for (const e of events) {
    const hour = new Date(e.created_at).getHours()
    hourMap[hour] = (hourMap[hour] ?? 0) + 1
  }

  // Par widget
  const byWidget = widgets.map((w) => {
    const wImpressions = impressions.filter((r) => r.widget_id === w.id)
    const imp = wImpressions.reduce((s, r) => s + (r.count ?? 0), 0)
    const clk = wImpressions.reduce((s, r) => s + (r.clicks ?? 0), 0)
    return {
      widget_id: w.id,
      widget_name: w.name,
      impressions: imp,
      clicks: clk,
      ctr: imp > 0 ? Math.round((clk / imp) * 1000) / 10 : 0,
    }
  })

  return NextResponse.json({
    total_impressions: totalImpressions,
    total_clicks: totalClicks,
    ctr,
    monthly_impressions: org.monthly_impressions,
    impressions_limit: org.impressions_limit,
    plan: org.plan,
    by_day: Object.entries(dailyMap).map(([date, d]) => ({ date, ...d })),
    by_widget: byWidget,
    by_hour: Object.entries(hourMap).map(([hour, impressions]) => ({
      hour: Number(hour),
      impressions,
    })),
    events_count: events.length,
  })
}
