import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, restInsert } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get('key')
  if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 })

  const supabase = createAdminClient()

  // Trouver l'organisation via la clé API
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (!org) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const body = await req.json() as Record<string, unknown>

  // Parser la commande Shopify
  const order = body as {
    customer?: { first_name?: string; last_name?: string; default_address?: { city?: string; country?: string } }
    billing_address?: { city?: string; country?: string }
    line_items?: Array<{ title?: string; price?: string }>
    total_price?: string
    currency?: string
    created_at?: string
  }

  const firstName = order.customer?.first_name ?? 'Un client'
  const lastName = order.customer?.last_name ? order.customer.last_name[0] + '.' : ''
  const buyerName = `${firstName} ${lastName}`.trim()
  const buyerCity = order.customer?.default_address?.city ?? order.billing_address?.city ?? 'France'
  const productName = order.line_items?.[0]?.title ?? 'un produit'
  const amount = order.total_price ? parseFloat(order.total_price) : undefined
  const currency = order.currency ?? 'EUR'

  const { error } = await restInsert('events', {
    org_id: org.id,
    type: 'purchase',
    data: {
      buyer_name: buyerName,
      buyer_city: buyerCity,
      product_name: productName,
      amount,
      currency,
    },
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
