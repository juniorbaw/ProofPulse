import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'API key manquante' }, { status: 400 })

  const admin = createAdminClient()

  // Récupérer l'organisation via la clé API
  const { data: org } = await admin
    .from('organizations')
    .select('id, plan, monthly_impressions, impressions_limit, settings')
    .eq('widget_api_key', key)
    .single()

  if (!org) return NextResponse.json({ error: 'Clé API invalide' }, { status: 401 })

  // Vérifier la limite d'impressions
  if (org.monthly_impressions >= org.impressions_limit) {
    return NextResponse.json({ error: 'Limite d\'impressions atteinte', limit_reached: true }, { status: 429 })
  }

  // Récupérer les widgets actifs
  const { data: widgets } = await admin
    .from('widgets')
    .select('id, type, config, name')
    .eq('org_id', org.id)
    .eq('is_active', true)

  // Récupérer les derniers événements pour les notifications
  const { data: events } = await admin
    .from('events')
    .select('id, type, data, created_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(
    { org_id: org.id, plan: org.plan, widgets: widgets || [], events: events || [] },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-store',
      }
    }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    }
  })
}
