'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Webhook, Zap, ShoppingBag, ShoppingCart, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-100"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copié !' : 'Copier'}
    </button>
  )
}

export default function IntegrationsPage() {
  const [orgId, setOrgId] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await supabase.from('organizations').select('id, api_key').eq('owner_id', user.id).single()
      const data = res.data as { id: string; api_key: string } | null
      if (data) { setOrgId(data.id); setApiKey(data.api_key) }
    }
    load()
  }, [])

  const webhookUrl = `https://proofpulse.io/api/webhooks/custom/${orgId || 'VOTRE_ORG_ID'}`

  const integrations = [
    {
      id: 'shopify',
      name: 'Shopify',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-green-50 text-green-600',
      description: 'Affiche automatiquement les nouveaux achats de votre boutique Shopify.',
      steps: [
        'Dans Shopify Admin → Paramètres → Notifications',
        'Créez un webhook pour l\'événement "Commande créée"',
        `Collez l'URL : ${`https://proofpulse.io/api/webhooks/shopify?key=${apiKey || 'VOTRE_API_KEY'}`}`,
        'Format : JSON — Version : 2024-01',
      ],
      webhookUrl: `https://proofpulse.io/api/webhooks/shopify?key=${apiKey || 'VOTRE_API_KEY'}`,
      docs: 'https://help.shopify.com/fr/manual/orders/notifications/webhooks',
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600',
      description: 'Synchronise vos commandes WooCommerce en temps réel.',
      steps: [
        'Dans WooCommerce → Paramètres → Avancé → Webhooks',
        'Cliquez sur "Ajouter un webhook"',
        'Événement : Commande créée · Statut : Actif',
        `URL de livraison : ${`https://proofpulse.io/api/webhooks/custom/${orgId}`}`,
      ],
      webhookUrl: `https://proofpulse.io/api/webhooks/custom/${orgId || 'VOTRE_ORG_ID'}`,
      docs: 'https://woocommerce.com/document/webhooks/',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600',
      description: 'Affiche les paiements Stripe réussis sur votre site.',
      steps: [
        'Dans Stripe Dashboard → Développeurs → Webhooks',
        'Ajoutez un endpoint',
        `URL : ${`https://proofpulse.io/api/webhooks/stripe`}`,
        'Événement : payment_intent.succeeded',
      ],
      webhookUrl: 'https://proofpulse.io/api/webhooks/stripe',
      docs: 'https://stripe.com/docs/webhooks',
    },
    {
      id: 'zapier',
      name: 'Zapier / Make',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600',
      description: 'Utilisez notre webhook générique depuis n\'importe quel outil no-code.',
      steps: [
        'Dans Zapier ou Make, choisissez l\'action "Webhook POST"',
        `URL : ${webhookUrl}`,
        'Envoyez un JSON avec : buyer_name, buyer_city, product_name, amount',
        'Testez avec l\'action "Tester le webhook"',
      ],
      webhookUrl,
      docs: null,
    },
  ]

  const payloadExample = JSON.stringify({
    buyer_name: 'Sophie M.',
    buyer_city: 'Paris',
    product_name: 'Pack Premium',
    amount: 97,
    currency: 'EUR',
    timestamp: new Date().toISOString(),
  }, null, 2)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Intégrations</h1>
        <p className="text-gray-500 text-sm mt-1">Connectez vos sources de données à ProofPulse</p>
      </div>

      <div className="space-y-4 mb-8">
        {integrations.map((integ) => (
          <div key={integ.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${integ.color} flex items-center justify-center flex-shrink-0`}>
                  {integ.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="font-semibold text-gray-900">{integ.name}</h2>
                    {integ.docs && (
                      <a href={integ.docs} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Docs
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{integ.description}</p>
                  <ol className="space-y-1.5 mb-4">
                    {integ.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Webhook className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <code className="text-xs text-gray-700 flex-1 min-w-0 truncate font-mono">{integ.webhookUrl}</code>
                    <CopyButton text={integ.webhookUrl} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API manuelle */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">API manuelle</h2>
        <p className="text-sm text-gray-500 mb-4">Envoyez des événements directement via notre API REST.</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Endpoint</p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">POST</span>
              <code className="text-xs text-gray-700 flex-1 font-mono">https://proofpulse.io/api/events</code>
              <CopyButton text="https://proofpulse.io/api/events" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Headers requis</p>
            <div className="bg-gray-950 rounded-xl p-4">
              <pre className="text-xs text-green-400 font-mono">{`X-API-Key: ${apiKey || 'VOTRE_API_KEY'}
Content-Type: application/json`}</pre>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Body exemple</p>
            <div className="bg-gray-950 rounded-xl p-4">
              <pre className="text-xs text-green-400 font-mono">{payloadExample}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
