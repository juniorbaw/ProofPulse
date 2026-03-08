import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }

export async function OPTIONS() { return new NextResponse(null, { headers: CORS }) }

export async function POST(req: NextRequest) {
  try {
    const { api_key, widget_id, clicked } = await req.json()
    if (!api_key || !widget_id) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400, headers: CORS })

    const admin = createAdminClient()
    const { data: org } = await admin.from('organizations').select('id').eq('widget_api_key', api_key).single()
    if (!org) return NextResponse.json({ error: 'Clé invalide' }, { status: 401, headers: CORS })

    await admin.rpc('increment_impression', { p_widget_id: widget_id, p_org_id: org.id, p_clicked: clicked || false })
    return NextResponse.json({ success: true }, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: CORS })
  }
}
