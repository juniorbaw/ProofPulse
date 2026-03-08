import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgRes = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const org = orgRes.data as { id: string } | null
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sites: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { domain } = await req.json() as { domain?: string }
  if (!domain) return NextResponse.json({ error: 'domain is required' }, { status: 400 })

  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  const orgRes = await supabase
    .from('organizations')
    .select('id, plan')
    .eq('owner_id', user.id)
    .single()

  const org = orgRes.data as { id: string; plan: string } | null
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  const { count } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id)

  const limits: Record<string, number> = { free: 1, starter: 3, pro: 10, agency: 9999 }
  const limit = limits[org.plan] ?? 1
  if ((count ?? 0) >= limit) {
    return NextResponse.json({ error: `Limite de sites atteinte pour votre plan (${limit} max)` }, { status: 403 })
  }

  const verificationToken = crypto.randomUUID()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${supabaseUrl}/rest/v1/sites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      org_id: org.id,
      domain: normalizedDomain,
      verification_token: verificationToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: 201 })
}
