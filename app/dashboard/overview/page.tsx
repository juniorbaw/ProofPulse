'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

const INDIGO = '#4F46E5'
const PURPLE = '#7C3AED'
const GREEN = '#10B981'
const AMBER = '#F59E0B'

interface Analytics {
  kpis: { total_impressions: number; total_clicks: number; ctr: number; monthly_impressions: number; impressions_limit: number; plan: string }
  daily_data: { date: string; impressions: number; clicks: number }[]
  widgets: { id: string; name: string; type: string; impressions: number; clicks: number; is_active: boolean }[]
  events_count: number
}

function KpiCard({ icon, label, value, sub, color, badge }: { icon: string; label: string; value: string | number; sub: string; color: string; badge?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s', cursor: 'default' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}40`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${color}15, transparent 70%)` }} />
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: -1, marginBottom: 4 }}>{typeof value === 'number' ? formatNumber(value) : value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#555' }}>{sub}</div>
      {badge && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${color}15`, color }}>{badge}</div>}
    </div>
  )
}

export default function OverviewPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [range, setRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/analytics?range=${range}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [range])

  useEffect(() => { load() }, [load])

  const maxImpressions = Math.max(...(data?.daily_data.map(d => d.impressions) || [1]), 1)
  const usagePct = data ? Math.min((data.kpis.monthly_impressions / data.kpis.impressions_limit) * 100, 100) : 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>Vue d&apos;ensemble 📊</h1>
          <p style={{ fontSize: 13, color: '#555' }}>Vos performances en temps réel</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 3 }}>
          {['7d', '30d', '90d'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: range === r ? INDIGO : 'transparent', color: range === r ? 'white' : '#555', transition: 'all 0.15s'
            }}>{r === '7d' ? '7 jours' : r === '30d' ? '30 jours' : '90 jours'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${INDIGO}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#444', fontSize: 13 }}>Chargement...</p>
        </div>
      ) : (
        <>
          {/* Usage bar */}
          {data?.kpis.plan === 'free' && (
            <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#818CF8' }}>Impressions ce mois</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#818CF8' }}>{formatNumber(data.kpis.monthly_impressions)} / {formatNumber(data.kpis.impressions_limit)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ width: `${usagePct}%`, height: '100%', borderRadius: 3, background: usagePct > 80 ? AMBER : INDIGO, transition: 'width 0.5s' }} />
                </div>
              </div>
              <Link href="/dashboard/billing" style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 700, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                ⚡ Passer au Pro
              </Link>
            </div>
          )}

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <KpiCard icon="👁️" label="Impressions totales" value={data?.kpis.total_impressions || 0} sub={`sur ${range === '7d' ? '7' : range === '30d' ? '30' : '90'} jours`} color={INDIGO} />
            <KpiCard icon="🖱️" label="Clics totaux" value={data?.kpis.total_clicks || 0} sub="sur les notifications" color={PURPLE} />
            <KpiCard icon="🎯" label="Taux de clic (CTR)" value={`${data?.kpis.ctr || 0}%`} sub="clics / impressions" color={GREEN} badge={data && data.kpis.ctr > 3 ? '🔥 Excellent' : undefined} />
            <KpiCard icon="⚡" label="Widgets actifs" value={data?.widgets.filter(w => w.is_active).length || 0} sub={`sur ${data?.widgets.length || 0} créés`} color={AMBER} />
          </div>

          {/* Chart */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800 }}>📈 Impressions par jour</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: INDIGO }} />
                <span style={{ fontSize: 11, color: '#555' }}>Impressions</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 100, overflowX: 'auto' }}>
              {data?.daily_data.map((d, i) => {
                const h = Math.max((d.impressions / maxImpressions) * 90, 4)
                const isToday = d.date === new Date().toISOString().split('T')[0]
                return (
                  <div key={i} style={{ flex: 1, minWidth: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'default' }}
                    title={`${d.date}: ${d.impressions} impressions, ${d.clicks} clics`}>
                    <div style={{ width: '100%', height: h, borderRadius: '3px 3px 0 0', background: isToday ? PURPLE : d.impressions > 0 ? INDIGO : 'rgba(255,255,255,0.04)', opacity: isToday ? 1 : 0.8, transition: 'height 0.4s ease' }} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Widget list */}
          {(data?.widgets.length || 0) > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800 }}>⚡ Vos widgets</h3>
                <Link href="/dashboard/widgets" style={{ fontSize: 12, color: INDIGO, fontWeight: 700, textDecoration: 'none' }}>Tout voir →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data?.widgets.slice(0, 5).map(w => {
                  const ctr = w.impressions > 0 ? Math.round((w.clicks / w.impressions) * 100 * 10) / 10 : 0
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.is_active ? GREEN : '#444', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{w.type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa' }}>{formatNumber(w.impressions)}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>CTR {ctr}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(data?.widgets.length || 0) === 0 && (
            <div style={{ background: 'rgba(79,70,229,0.06)', border: '1px dashed rgba(79,70,229,0.3)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Créez votre premier widget</h3>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Commencez à afficher des notifications de social proof sur votre site en 2 minutes.</p>
              <Link href="/dashboard/widgets" style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
                Créer un widget →
              </Link>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
