import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, restInsert } from '@/lib/supabase/server'

interface CustomWebhookPayload {
  buyer_name?: string
  buyer_city?: string
  product_name?: string
  amount?: number
  currency?: string
  type?: string
  [key: string]: unknown
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id } = await params
  if (!org_id) return NextResponse.json({ error: 'Missing org_id' }, { status: 400 })

  const supabase = createAdminClient()

  // Vérifier que l'organisation existe
  const { data: org } = await supabase
    .from('organizations')
    .select('id, plan')
    .eq('id', org_id)
    .single()

  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  const body = await req.json() as CustomWebhookPayload

  const eventType = body.type ?? 'purchase'
  const validTypes = ['purchase', 'page_view', 'add_to_cart', 'signup', 'custom']
  const type = validTypes.includes(eventType) ? eventType : 'custom'

  const { error } = await restInsert('events', {
    org_id: org.id,
    type,
    data: {
      buyer_name: body.buyer_name,
      buyer_city: body.buyer_city,
      product_name: body.product_name,
      amount: body.amount,
      currency: body.currency ?? 'EUR',
    },
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
