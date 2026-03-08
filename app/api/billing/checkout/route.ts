import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '',
    annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
  },
  agency: {
    monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID ?? '',
    annual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID ?? '',
  },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, annual } = await req.json() as { plan: string; annual: boolean }

  const priceIds = PRICE_IDS[plan]
  if (!priceIds) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const priceId = annual ? priceIds.annual : priceIds.monthly
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

  const orgRes = await supabase
    .from('organizations')
    .select('id, stripe_customer_id')
    .eq('owner_id', user.id)
    .single()

  const org = orgRes.data as { id: string; stripe_customer_id: string | null } | null
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: org.stripe_customer_id ?? undefined,
    customer_email: org.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/billing`,
    metadata: { org_id: org.id, plan },
    subscription_data: { metadata: { org_id: org.id, plan } },
  })

  return NextResponse.json({ url: session.url })
}
