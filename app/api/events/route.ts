import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashIp } from '@/lib/utils'

export const runtime = 'edge'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { api_key?: string; type?: string; data?: unknown; widget_id?: string }
    const { api_key, type, data, widget_id } = body

    if (!api_key || !type || !data) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400, headers: CORS })
    }

    const admin = createAdminClient()

    // Valider l'API key
    const orgRes = await admin
      .from('organizations')
      .select('id')
      .eq('api_key', api_key)
      .single()

    const org = orgRes.data as { id: string } | null
    if (!org) return NextResponse.json({ error: 'Clé API invalide' }, { status: 401, headers: CORS })

    // Anonymiser l'IP (RGPD)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const ip_hash = hashIp(ip)

    // Stocker l'événement via REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        org_id: org.id,
        widget_id: widget_id ?? null,
        type,
        data,
        ip_hash,
      }),
    })

    if (!insertRes.ok) {
      const err = await insertRes.text()
      return NextResponse.json({ error: err }, { status: 500, headers: CORS })
    }

    const inserted = await insertRes.json() as Array<{ id: string }>
    const eventId = Array.isArray(inserted) ? inserted[0]?.id : null

    return NextResponse.json({ success: true, event_id: eventId }, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: CORS })
  }
}
