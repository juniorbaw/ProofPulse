'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Eye, MousePointer, Clock } from 'lucide-react'

type Range = '7d' | '30d' | '90d'

interface AnalyticsData {
  total_impressions: number
  total_clicks: number
  ctr: number
  by_day: { date: string; impressions: number; clicks: number }[]
  by_widget: { widget_id: string; widget_name: string; impressions: number; clicks: number; ctr: number }[]
  by_hour: { hour: number; impressions: number }[]
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/analytics?range=${range}`)
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setLoading(false)
  }, [range])

  useEffect(() => { fetchData() }, [fetchData])

  const kpis = [
    { label: 'Impressions totales', value: data?.total_impressions?.toLocaleString('fr-FR') ?? '—', icon: <Eye className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Clics totaux', value: data?.total_clicks?.toLocaleString('fr-FR') ?? '—', icon: <MousePointer className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
    { label: 'CTR moyen', value: data ? `${data.ctr.toFixed(1)}%` : '—', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
    { label: 'Meilleure heure', value: data?.by_hour?.length ? `${data.by_hour.reduce((a, b) => a.impressions > b.impressions ? a : b).hour}h` : '—', icon: <Clock className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Performances de vos widgets de preuve sociale</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['7d', '30d', '90d'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {r === '7d' ? '7 jours' : r === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{loading ? <span className="animate-pulse bg-gray-100 rounded h-7 w-16 block" /> : value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Impressions par jour */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Impressions & Clics par jour</h2>
        {loading || !data ? (
          <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.by_day} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
             formatter={((value: number, name: string) => [value.toLocaleString('fr-FR'), name === 'impressions' ? 'Impressions' : 'Clics']) as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={((label: string) => label) as any}
              />
              <Bar dataKey="impressions" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="clicks" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heatmap heures */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Heatmap horaire</h2>
        {loading || !data ? (
          <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const hourData = data.by_hour.find((b) => b.hour === h)
              const max = Math.max(...data.by_hour.map((b) => b.impressions), 1)
              const intensity = hourData ? hourData.impressions / max : 0
              return (
                <div key={h} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full h-8 rounded transition-colors"
                    style={{ backgroundColor: `rgba(99, 102, 241, ${intensity})`, minHeight: '8px' }}
                    title={`${h}h : ${hourData?.impressions ?? 0} impressions`}
                  />
                  <span className="text-xs text-gray-400">{h}h</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Par widget */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Performance par widget</h2>
        {loading || !data ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : data.by_widget.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left font-medium text-gray-500 pb-3">Widget</th>
                  <th className="text-right font-medium text-gray-500 pb-3">Impressions</th>
                  <th className="text-right font-medium text-gray-500 pb-3">Clics</th>
                  <th className="text-right font-medium text-gray-500 pb-3">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.by_widget.map((w) => (
                  <tr key={w.widget_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{w.widget_name}</td>
                    <td className="py-3 text-right text-gray-600">{w.impressions.toLocaleString('fr-FR')}</td>
                    <td className="py-3 text-right text-gray-600">{w.clicks.toLocaleString('fr-FR')}</td>
                    <td className="py-3 text-right">
                      <span className="font-medium text-indigo-600">{w.ctr.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
