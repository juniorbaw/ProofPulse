'use client'
import { useState, useEffect } from 'react'
import { Save, Key, RefreshCw, Globe, Bell, User, Trash2, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Organization } from '@/lib/types/database'

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [name, setName] = useState('')
  const [allowedDomains, setAllowedDomains] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await supabase.from('organizations').select('*').eq('owner_id', user.id).single()
      const data = res.data as import('@/lib/types/database').Organization | null
      if (data) {
        setOrg(data)
        setName(data.name)
        setAllowedDomains((data.allowed_domains ?? []).join('\n'))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile() {
    if (!org) return
    setSaving(true)
    const res = await fetch('/api/organizations/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        allowed_domains: allowedDomains.split('\n').map((d) => d.trim()).filter(Boolean),
      }),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  async function rotateApiKey() {
    if (!confirm('Rotation de la clé API ? Tous les widgets existants cesseront de fonctionner jusqu\'à mise à jour.')) return
    setRotatingKey(true)
    const res = await fetch('/api/organizations/me/rotate-key', { method: 'POST' })
    if (res.ok) {
      const { api_key } = await res.json()
      setOrg((prev) => prev ? { ...prev, api_key } : prev)
    }
    setRotatingKey(false)
  }

  async function copyKey() {
    if (org?.api_key) {
      await navigator.clipboard.writeText(org.api_key)
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"><div className="h-4 bg-gray-100 rounded w-48 mb-4" /><div className="h-10 bg-gray-100 rounded" /></div>)}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre compte et vos préférences</p>
      </div>

      <div className="space-y-4">
        {/* Profil */}
        <Section title="Profil" description="Informations de votre organisation">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la boutique</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </Section>

        {/* Clé API */}
        <Section title="Clé API" description="Utilisée pour intégrer le widget sur votre site. Ne la partagez jamais.">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
            <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <code className="text-sm text-gray-700 flex-1 min-w-0 truncate font-mono">{org?.api_key ?? '...'}</code>
            <button onClick={copyKey} className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 border border-indigo-100 transition-colors">
              {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {keyCopied ? 'Copié' : 'Copier'}
            </button>
          </div>
          <button
            onClick={rotateApiKey}
            disabled={rotatingKey}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-100 px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${rotatingKey ? 'animate-spin' : ''}`} />
            {rotatingKey ? 'Rotation...' : 'Faire une rotation de la clé'}
          </button>
        </Section>

        {/* Domaines autorisés */}
        <Section title="Domaines autorisés" description="Un domaine par ligne. Le widget ne fonctionnera que sur ces domaines.">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-gray-400 mt-3 flex-shrink-0" />
              <textarea
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                rows={4}
                placeholder={'maboutique.fr\nwww.maboutique.fr\nshop.exemple.com'}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono resize-none"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les domaines'}
            </button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications email" description="Recevez des alertes sur votre activité">
          <div className="space-y-3">
            {[
              { label: 'Limite d\'impressions atteinte (80%)', key: 'limit' },
              { label: 'Rapport hebdomadaire de performance', key: 'weekly' },
              { label: 'Nouveautés et mises à jour ProofPulse', key: 'updates' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <button
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${emailNotifs ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Zone dangereuse */}
        <Section title="Zone dangereuse">
          <div className="border border-red-100 rounded-xl p-4 bg-red-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-red-800 text-sm">Supprimer mon compte</p>
                <p className="text-xs text-red-600 mt-0.5">Cette action est irréversible. Toutes vos données seront supprimées.</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
