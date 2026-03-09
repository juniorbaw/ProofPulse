'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'

const POSITIONS = [
  { id: 'bottom-left', label: 'Bas gauche' },
  { id: 'bottom-right', label: 'Bas droite' },
  { id: 'top-left', label: 'Haut gauche' },
  { id: 'top-right', label: 'Haut droite' },
]

interface WidgetConfig {
  position: string
  delay: number
  duration: number
  interval: number
  style: { bg_color: string; text_color: string; accent_color: string; border_radius: number }
  mobile: boolean
  custom_text: string
}

interface WidgetData {
  id: string
  name: string
  type: string
  is_active: boolean
  config: WidgetConfig
}

export default function WidgetEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [widget, setWidget] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<WidgetConfig>({
    position: 'bottom-left',
    delay: 3,
    duration: 5,
    interval: 10,
    style: { bg_color: '#ffffff', text_color: '#1f2937', accent_color: '#6366f1', border_radius: 12 },
    mobile: true,
    custom_text: '',
  })
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch(`/api/widgets/${id}`)
    if (res.ok) {
      const data = await res.json() as WidgetData
      setWidget(data)
      setName(data.name)
      setIsActive(data.is_active)
      if (data.config) setForm(data.config)
    } else {
      router.push('/dashboard/widgets')
    }
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    await fetch(`/api/widgets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, is_active: isActive, config: form }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  if (loading) return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded w-48" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/widgets" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
            />
            <p className="text-gray-500 text-sm px-2">Éditeur de widget · {widget?.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsActive(!isActive)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            {isActive ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6" />}
            {isActive ? 'Actif' : 'Inactif'}
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Position & Timing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITIONS.map(pos => (
                    <button key={pos.id} onClick={() => setForm(f => ({ ...f, position: pos.id }))}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${form.position === pos.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'delay', label: 'Délai (s)', min: 0, max: 30 },
                  { key: 'duration', label: 'Durée (s)', min: 2, max: 30 },
                  { key: 'interval', label: 'Intervalle (s)', min: 5, max: 120 },
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                    <input type="number" min={min} max={max}
                      value={form[key as keyof Pick<WidgetConfig, 'delay' | 'duration' | 'interval'>]}
                      onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Afficher sur mobile</span>
                <button onClick={() => setForm(f => ({ ...f, mobile: !f.mobile }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.mobile ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.mobile ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Style</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'bg_color', label: 'Fond' },
                  { key: 'text_color', label: 'Texte' },
                  { key: 'accent_color', label: 'Accent' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={form.style[key as keyof typeof form.style] as string}
                        onChange={e => setForm(f => ({ ...f, style: { ...f.style, [key]: e.target.value } }))}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                      <span className="text-xs text-gray-400 font-mono">{form.style[key as keyof typeof form.style]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Border radius : {form.style.border_radius}px
                </label>
                <input type="range" min={0} max={24} value={form.style.border_radius}
                  onChange={e => setForm(f => ({ ...f, style: { ...f.style, border_radius: +e.target.value } }))}
                  className="w-full accent-indigo-600" />
              </div>
            </div>
          </div>

          {widget?.type === 'custom' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Message personnalisé</h3>
              <p className="text-xs text-gray-400 mb-3">Variables disponibles : {'{buyer_name}'}, {'{buyer_city}'}, {'{product_name}'}, {'{time_ago}'}</p>
              <textarea
                value={form.custom_text}
                onChange={e => setForm(f => ({ ...f, custom_text: e.target.value }))}
                rows={3}
                placeholder="🎉 {buyer_name} de {buyer_city} vient d'acheter {product_name}"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Preview live */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Aperçu en temps réel</p>
          <div className="bg-gray-100 rounded-2xl h-96 relative overflow-hidden border border-gray-200 sticky top-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-300">
                <div className="text-4xl mb-2">🌐</div>
                <p className="text-sm">Votre site web</p>
              </div>
            </div>
            <div
              className={`absolute ${form.position.includes('bottom') ? 'bottom-4' : 'top-4'} ${form.position.includes('left') ? 'left-4' : 'right-4'}`}
              style={{
                backgroundColor: form.style.bg_color,
                color: form.style.text_color,
                borderRadius: `${form.style.border_radius}px`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                border: '1px solid rgba(0,0,0,0.06)',
                maxWidth: '260px',
                animation: 'slideIn 0.3s ease',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: form.style.accent_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>S</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>🛍️ Sophie de Paris</div>
                <div style={{ opacity: 0.7, fontSize: 11 }}>vient d&apos;acheter <span style={{ color: form.style.accent_color, fontWeight: 600 }}>Pack Premium</span></div>
                <div style={{ opacity: 0.5, fontSize: 10, marginTop: 2 }}>il y a 2 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
