'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Copy, Trash2, ToggleLeft, ToggleRight, Pencil, Bell, Users, AlertTriangle, BarChart2, MessageSquare, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Widget } from '@/lib/types/database'

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  recent_purchase: { label: 'Achat récent', icon: <Bell className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  live_visitors: { label: 'Visiteurs live', icon: <Users className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  stock_urgency: { label: 'Urgence stock', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
  social_count: { label: 'Compteur social', icon: <BarChart2 className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  custom: { label: 'Message custom', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
}

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchWidgets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/widgets')
    if (res.ok) {
      const data = await res.json()
      setWidgets(data.widgets ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchWidgets() }, [fetchWidgets])

  async function toggleWidget(widget: Widget) {
    setTogglingId(widget.id)
    await fetch(`/api/widgets/${widget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !widget.is_active }),
    })
    setWidgets((prev) => prev.map((w) => w.id === widget.id ? { ...w, is_active: !w.is_active } : w))
    setTogglingId(null)
  }

  async function duplicateWidget(widget: Widget) {
    const res = await fetch('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${widget.name} (copie)`,
        type: widget.type,
        config: widget.config,
      }),
    })
    if (res.ok) fetchWidgets()
  }

  async function deleteWidget(id: string) {
    if (!confirm('Supprimer ce widget ? Cette action est irréversible.')) return
    setDeletingId(id)
    await fetch(`/api/widgets/${id}`, { method: 'DELETE' })
    setWidgets((prev) => prev.filter((w) => w.id !== id))
    setDeletingId(null)
  }

  async function copyApiKey(widget: Widget) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const orgRes = await supabase.from('organizations').select('api_key').eq('owner_id', user.id).single()
    const org = orgRes.data as { api_key: string } | null
    if (org?.api_key) {
      await navigator.clipboard.writeText(org.api_key)
      alert('Clé API copiée !')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Widgets</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos widgets de preuve sociale</p>
        </div>
        <Link
          href="/dashboard/widgets/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau widget
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun widget</h3>
          <p className="text-gray-400 text-sm mb-6">Créez votre premier widget de preuve sociale</p>
          <Link href="/dashboard/widgets/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Créer un widget
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {widgets.map((widget) => {
            const typeInfo = TYPE_LABELS[widget.type] ?? TYPE_LABELS.custom
            return (
              <div key={widget.id} className={`bg-white rounded-xl border p-5 flex flex-col gap-4 transition-all ${widget.is_active ? 'border-gray-100 shadow-sm' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{widget.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWidget(widget)}
                    disabled={togglingId === widget.id}
                    className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
                    title={widget.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {widget.is_active
                      ? <ToggleRight className="w-6 h-6 text-indigo-600" />
                      : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <Link
                    href={`/dashboard/widgets/${widget.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Éditer
                  </Link>
                  <button
                    onClick={() => duplicateWidget(widget)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => copyApiKey(widget)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Copier la clé API"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    API Key
                  </button>
                  <button
                    onClick={() => deleteWidget(widget.id)}
                    disabled={deletingId === widget.id}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 py-1.5 px-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
