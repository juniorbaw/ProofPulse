'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Terminal, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      {label && <p className="text-xs text-gray-500 mb-1.5 font-medium">{label}</p>}
      <div className="bg-gray-950 rounded-xl p-4 pr-12 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">{code}</pre>
      </div>
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        title="Copier"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function InstallationPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'generic' | 'shopify' | 'woocommerce'>('generic')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await supabase.from('organizations').select('api_key').eq('owner_id', user.id).single()
      const data = res.data as { api_key: string } | null
      if (data?.api_key) setApiKey(data.api_key)
    }
    load()
  }, [])

  async function verify() {
    setVerifying(true)
    setVerified(null)
    const res = await fetch(`/api/widget?key=${apiKey}`)
    setVerified(res.ok)
    setVerifying(false)
  }

  const snippet = `<script src="https://cdn.proofpulse.io/widget.js" data-key="${apiKey || 'VOTRE_API_KEY'}" async></script>`
  const shopifySnippet = `{% comment %} ProofPulse Widget — Coller avant </body> {% endcomment %}
<script src="https://cdn.proofpulse.io/widget.js" data-key="${apiKey || 'VOTRE_API_KEY'}" async></script>`
  const wooSnippet = `// Dans functions.php de votre thème enfant
function proofpulse_widget() {
  echo '<script src="https://cdn.proofpulse.io/widget.js" data-key="${apiKey || 'VOTRE_API_KEY'}" async></script>';
}
add_action('wp_footer', 'proofpulse_widget');`

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Installation</h1>
        <p className="text-gray-500 text-sm mt-1">Intégrez ProofPulse sur votre site en quelques secondes</p>
      </div>

      {/* Votre clé API */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Votre clé API</h2>
        <p className="text-sm text-gray-500 mb-4">Cette clé identifie votre compte. Ne la partagez pas.</p>
        <CodeBlock code={apiKey || 'Chargement...'} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
          {([
            { id: 'generic', label: 'Site custom / HTML' },
            { id: 'shopify', label: 'Shopify' },
            { id: 'woocommerce', label: 'WooCommerce' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'generic' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
              <Terminal className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <p className="text-sm text-indigo-700">Copiez ce code et collez-le juste avant la balise <code className="bg-indigo-100 px-1 rounded">&lt;/body&gt;</code> de votre site.</p>
            </div>
            <CodeBlock code={snippet} label="Code à coller dans votre HTML" />
          </div>
        )}

        {tab === 'shopify' && (
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Dans Shopify Admin, allez dans <strong>Boutique en ligne → Thèmes → Modifier le code</strong></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Ouvrez le fichier <code className="bg-gray-100 px-1 rounded">theme.liquid</code></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>Collez le code suivant juste avant <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code></li>
            </ol>
            <CodeBlock code={shopifySnippet} label="Code pour theme.liquid" />
          </div>
        )}

        {tab === 'woocommerce' && (
          <div className="space-y-4">
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Dans WordPress Admin, allez dans <strong>Apparence → Éditeur de thème</strong></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Ouvrez <code className="bg-gray-100 px-1 rounded">functions.php</code> de votre thème enfant</li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>Ajoutez le code suivant à la fin du fichier</li>
            </ol>
            <CodeBlock code={wooSnippet} label="Code pour functions.php" />
          </div>
        )}
      </div>

      {/* Vérification */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Vérifier l&apos;installation</h2>
        <p className="text-sm text-gray-500 mb-4">Cliquez sur le bouton pour vérifier que votre widget est bien connecté.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={verify}
            disabled={verifying || !apiKey}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Vérification...' : 'Vérifier maintenant'}
          </button>
          {verified === true && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-5 h-5" />
              Widget connecté avec succès !
            </div>
          )}
          {verified === false && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <XCircle className="w-5 h-5" />
              Widget non détecté. Vérifiez le code d&apos;installation.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
