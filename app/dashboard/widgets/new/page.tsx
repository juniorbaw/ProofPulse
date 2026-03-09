'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Users, AlertTriangle, BarChart2, MessageSquare, Check } from 'lucide-react'
import Link from 'next/link'

const WIDGET_TYPES = [
  { id: 'recent_purchase', label: 'Achat récent', icon: <Bell className="w-6 h-6" />, color: 'bg-green-50 text-green-600 border-green-200', description: 'Affiche les derniers achats en temps réel', preview: '🛍️ Sophie de Paris vient d\'acheter Pack Premium · il y a 2 min' },
  { id: 'live_visitors', label: 'Visiteurs en direct', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600 border-blue-200', description: 'Affiche le nombre de visiteurs actuels', preview: '👀 12 personnes regardent cette page en ce moment' },
  { id: 'stock_urgency', label: 'Urgence stock', icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600 border-orange-200', description: 'Crée de l\'urgence avec le stock restant', preview: '⚡ Plus que 3 en stock ! 8 personnes regardent cet article' },
  { id: 'social_count', label: 'Compteur social', icon: <BarChart2 className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600 border-purple-200', description: 'Affiche le nombre total de clients', preview: '🎉 Rejoignez les 1 247 clients qui nous font confiance' },
  { id: 'custom', label: 'Message personnalisé', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-gray-50 text-gray-600 border-gray-200', description: 'Créez votre propre message avec variables', preview: '✨ Bienvenue ! Code promo WELCOME10 valable encore 10 min' },
]

const POSITIONS = [
  { id: 'bottom-left', label: 'Bas gauche' },
  { id: 'bottom-right', label: 'Bas droite' },
  { id: 'top-left', label: 'Haut gauche' },
  { id: 'top-right', label: 'Haut droite' },
]

export default function NewWidgetPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'recent_purchase',
    position: 'bottom-left',
    delay: 3,
    duration: 5,
    interval: 10,
    bg_color: '#ffffff',
    text_color: '#1f2937',
    accent_color: '#6366f1',
    border_radius: 12,
    mobile: true,
    custom_text: '',
  })

  const selectedType = WIDGET_TYPES.find(t => t.id === form.type)!

  async function createWidget() {
    setSaving(true)
    const res = await fetch('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name || `Widget ${selectedType.label}`,
        type: form.type,
        config: {
          position: form.position,
          delay: form.delay,
          duration: form.duration,
          interval: form.interval,
          style: {
            bg_color: form.bg_color,
            text_color: form.text_color,
            accent_color: form.accent_color,
            border_radius: form.border_radius,
          },
          mobile: form.mobile,
          custom_text: form.custom_text,
        },
      }),
    })
    if (res.ok) {
      const widget = await res.json() as { id: string }
      router.push(`/dashboard/widgets/${widget.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/widgets" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau widget</h1>
          <p className="text-gray-500 text-sm">Étape {step} sur 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-indigo-600' : 'bg-gray-100'}`} />
        ))}
      </div>

      {/* Step 1 — Type */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quel type de notification ?</h2>
          <p className="text-gray-500 text-sm mb-6">Choisissez le type de preuve sociale à afficher</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {WIDGET_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setForm(f => ({ ...f, type: type.id }))}
                className={`p-5 rounded-xl border-2 text-left transition-all ${form.type === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 ${type.color}`}>
                  {type.icon}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{type.label}</h3>
                  {form.type === type.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-gray-500 mb-3">{type.description}</p>
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 italic">{type.preview}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Config */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-500 text-sm mb-6">Personnalisez le comportement et l&apos;apparence</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du widget</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={`Widget ${selectedType.label}`}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map(pos => (
                    <button
                      key={pos.id}
                      onClick={() => setForm(f => ({ ...f, position: pos.id }))}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${form.position === pos.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Délai (sec)</label>
                  <input type="number" min={0} max={30} value={form.delay} onChange={e => setForm(f => ({ ...f, delay: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Durée (sec)</label>
                  <input type="number" min={2} max={30} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Intervalle (sec)</label>
                  <input type="number" min={5} max={60} value={form.interval} onChange={e => setForm(f => ({ ...f, interval: +e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Fond</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{form.bg_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Texte</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.text_color} onChange={e => setForm(f => ({ ...f, text_color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{form.text_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Accent</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                    <span className="text-xs text-gray-500 font-mono">{form.accent_color}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Border radius : {form.border_radius}px</label>
                <input type="range" min={0} max={24} value={form.border_radius} onChange={e => setForm(f => ({ ...f, border_radius: +e.target.value }))} className="w-full accent-indigo-600" />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Afficher sur mobile</span>
                <button onClick={() => setForm(f => ({ ...f, mobile: !f.mobile }))} className={`relative w-10 h-5 rounded-full transition-colors ${form.mobile ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.mobile ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Aperçu en temps réel</p>
              <div className="bg-gray-100 rounded-2xl h-80 relative overflow-hidden border border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">Votre site web</div>
                <div
                  className={`absolute ${form.position.includes('bottom') ? 'bottom-4' : 'top-4'} ${form.position.includes('left') ? 'left-4' : 'right-4'} max-w-xs`}
                  style={{
                    backgroundColor: form.bg_color,
                    color: form.text_color,
                    borderRadius: `${form.border_radius}px`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: form.accent_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>S</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>🛍️ Sophie de Paris</div>
                    <div style={{ opacity: 0.7, fontSize: 11 }}>vient d&apos;acheter <span style={{ color: form.accent_color, fontWeight: 600 }}>Pack Premium</span></div>
                    <div style={{ opacity: 0.5, fontSize: 10, marginTop: 2 }}>il y a 2 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors">
              ← Retour
            </button>
            <button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Récapitulatif</h2>
          <p className="text-gray-500 text-sm mb-6">Vérifiez les paramètres avant de créer votre widget</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900">{selectedType.label}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Nom</span><span className="font-medium text-gray-900">{form.name || `Widget ${selectedType.label}`}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Position</span><span className="font-medium text-gray-900">{POSITIONS.find(p => p.id === form.position)?.label}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Délai</span><span className="font-medium text-gray-900">{form.delay}s</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Durée</span><span className="font-medium text-gray-900">{form.duration}s</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Mobile</span><span className="font-medium text-gray-900">{form.mobile ? 'Activé' : 'Désactivé'}</span></div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors">
              ← Retour
            </button>
            <button onClick={createWidget} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2">
              {saving ? 'Création...' : '🚀 Créer le widget'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
