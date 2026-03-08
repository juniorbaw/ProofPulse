import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; allowed_domains?: string[] }

  const orgRes = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const org = orgRes.data as { id: string } | null
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  const updateFields: Record<string, unknown> = {}
  if (body.name !== undefined) updateFields.name = body.name
  if (body.allowed_domains !== undefined) updateFields.allowed_domains = body.allowed_domains

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Utiliser fetch direct vers Supabase REST API pour éviter les contraintes de type non générées
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${supabaseUrl}/rest/v1/organizations?id=eq.${org.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updateFields),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const updated = await res.json()
  return NextResponse.json(Array.isArray(updated) ? updated[0] : updated)
}
