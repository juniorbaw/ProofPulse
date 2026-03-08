import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLAN_FROM_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY || '']: 'starter',
  [process.env.STRIPE_PRICE_STARTER_YEARLY || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
  [process.env.STRIPE_PRICE_PRO_YEARLY || '']: 'pro',
  [process.env.STRIPE_PRICE_AGENCY_MONTHLY || '']: 'agency',
  [process.env.STRIPE_PRICE_AGENCY_YEARLY || '']: 'agency',
}

const IMPRESSIONS_LIMIT: Record<string, number> = {
  free: 1000, starter: 10000, pro: 100000, agency: 500000
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price.id
      const plan = PLAN_FROM_PRICE[priceId] || 'free'
      await admin.from('organizations')
        .update({
          plan,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          subscription_status: sub.status,
          impressions_limit: IMPRESSIONS_LIMIT[plan],
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await admin.from('organizations')
        .update({ plan: 'free', subscription_status: 'canceled', impressions_limit: 1000 })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.org_id) {
        await admin.from('organizations')
          .update({ stripe_customer_id: session.customer as string })
          .eq('id', session.metadata.org_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
