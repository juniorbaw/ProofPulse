import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const orgRes = await supabase.from('organizations').select('id').eq('owner_id', user.id).single()
  const org = orgRes.data as { id: string } | null
  if (!org) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })

  const { data: widgets } = await supabase.from('widgets').select('*').eq('org_id', org.id).order('created_at', { ascending: false })
  return NextResponse.json({ widgets: widgets ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const orgRes = await supabase.from('organizations').select('id, plan').eq('owner_id', user.id).single()
  const org = orgRes.data as { id: string; plan: string } | null
  if (!org) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 })

  const body = await req.json() as { name?: string; type?: string; config?: Record<string, unknown>; site_id?: string }
  const { name, type, config, site_id } = body
  if (!name || !type) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${supabaseUrl}/rest/v1/widgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      org_id: org.id,
      name,
      type,
      config: config ?? {},
      site_id: site_id ?? null,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: 201 })
}
