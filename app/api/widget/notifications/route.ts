import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get('key')
  if (!apiKey) return NextResponse.json({ error: 'Clé API manquante' }, { status: 401, headers: CORS })

  const admin = createAdminClient()

  // Valider la clé API et récupérer l'org
  const orgRes = await admin.from('organizations').select('id, plan').eq('api_key', apiKey).single()
  const org = orgRes.data as { id: string; plan: string } | null
  if (!org) return NextResponse.json({ error: 'Clé API invalide' }, { status: 401, headers: CORS })

  // Récupérer les derniers événements (max 20)
  const { data: events } = await admin
    .from('events')
    .select('id, type, data, created_at')
    .eq('org_id', org.id)
    .eq('type', 'purchase')
    .order('created_at', { ascending: false })
    .limit(20)

  const notifications = (events ?? []).map((e: Record<string, unknown>) => {
    const data = e.data as Record<string, unknown> ?? {}
    const createdAt = new Date(e.created_at as string)
    const diffMs = Date.now() - createdAt.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMs / 3600000)
    const timeAgo = diffMin < 1 ? 'à l\'instant' : diffMin < 60 ? `il y a ${diffMin} min` : `il y a ${diffH}h`

    return {
      id: e.id,
      type: e.type,
      data: { ...data, time_ago: timeAgo },
    }
  })

  return NextResponse.json({ notifications }, { headers: CORS })
}
