'use client'
import { useState, useEffect } from 'react'
import { Check, Zap, CreditCard, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Organization, Plan } from '@/lib/types/database'

const PLANS: { name: string; plan: Plan; monthly: number; annual: number; features: string[]; limits: { impressions: number; sites: number; widgets: number | null } }[] = [
  {
    name: 'Free', plan: 'free', monthly: 0, annual: 0,
    features: ['1 site', '1 widget', '1 000 impressions/mois', 'Type : achat récent uniquement', 'Badge ProofPulse'],
    limits: { impressions: 1000, sites: 1, widgets: 1 },
  },
  {
    name: 'Starter', plan: 'starter', monthly: 27, annual: 270,
    features: ['3 sites', '5 widgets', '10 000 impressions/mois', 'Tous les types', 'Analytics basiques', 'Support email', 'Sans badge'],
    limits: { impressions: 10000, sites: 3, widgets: 5 },
  },
  {
    name: 'Pro', plan: 'pro', monthly: 67, annual: 670,
    features: ['10 sites', 'Widgets illimités', '100 000 impressions/mois', 'A/B testing', 'Analytics avancés', 'Shopify & WooCommerce', 'CSS custom', 'Support prioritaire'],
    limits: { impressions: 100000, sites: 10, widgets: null },
  },
  {
    name: 'Agency', plan: 'agency', monthly: 147, annual: 1470,
    features: ['Sites illimités', 'Widgets illimités', '500 000 impressions/mois', 'White label', 'Multi-comptes', 'Accès API', 'Account manager'],
    limits: { impressions: 500000, sites: -1, widgets: null },
  },
]

export default function BillingPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [annual, setAnnual] = useState(false)
  const [upgrading, setUpgrading] = useState<Plan | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await supabase.from('organizations').select('*').eq('owner_id', user.id).single()
      setOrg(res.data as import('@/lib/types/database').Organization | null)
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpgrade(plan: Plan) {
    setUpgrading(plan)
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, annual }),
    })
    if (res.ok) {
      const { url } = await res.json()
      if (url) window.location.href = url
    }
    setUpgrading(null)
  }

  async function handlePortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json()
      if (url) window.location.href = url
    }
  }

  const currentPlan = PLANS.find((p) => p.plan === org?.plan) ?? PLANS[0]
  const usagePercent = org ? Math.min(100, Math.round((org.monthly_impressions / org.impressions_limit) * 100)) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Abonnement & Facturation</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre plan et vos informations de paiement</p>
      </div>

      {/* Plan actuel */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-gray-900">Plan actuel</h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {currentPlan.name}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {org?.plan === 'free' ? 'Gratuit · sans engagement' : `${currentPlan.monthly}€/mois`}
              </p>
            </div>
            {org?.stripe_customer_id && (
              <button
                onClick={handlePortal}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Gérer le paiement
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">Impressions ce mois</span>
              <span className="font-medium text-gray-900">
                {org?.monthly_impressions?.toLocaleString('fr-FR')} / {org?.impressions_limit?.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{usagePercent}% utilisé — reset le 1er du mois</p>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Changer de plan</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button onClick={() => setAnnual(false)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Mensuel</button>
          <button onClick={() => setAnnual(true)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            Annuel
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-2 mois</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = org?.plan === plan.plan
          const price = annual && plan.monthly > 0 ? Math.round(plan.annual / 12) : plan.monthly
          return (
            <div key={plan.plan} className={`rounded-xl border p-5 flex flex-col ${isCurrent ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'} transition-all`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  {isCurrent && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Actuel</span>}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">{price === 0 ? '0€' : `${price}€`}</span>
                  {plan.monthly > 0 && <span className="text-xs text-gray-400 mb-1">/mois</span>}
                </div>
                {annual && plan.annual > 0 && (
                  <p className="text-xs text-gray-400">{plan.annual}€/an</p>
                )}
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || upgrading === plan.plan}
                onClick={() => handleUpgrade(plan.plan)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${isCurrent ? 'bg-indigo-100 text-indigo-600 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}`}
              >
                {isCurrent ? 'Plan actuel' : upgrading === plan.plan ? 'Redirection...' : plan.plan === 'free' ? 'Passer au Free' : 'Choisir ce plan'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
