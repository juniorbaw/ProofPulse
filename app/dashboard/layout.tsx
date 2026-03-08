'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard/overview',      icon: '📊', label: 'Vue d\'ensemble' },
  { href: '/dashboard/widgets',       icon: '⚡', label: 'Widgets' },
  { href: '/dashboard/analytics',     icon: '📈', label: 'Analytics' },
  { href: '/dashboard/integrations',  icon: '🔌', label: 'Intégrations' },
  { href: '/dashboard/installation',  icon: '🛠️', label: 'Installation' },
  { href: '/dashboard/settings',      icon: '⚙️', label: 'Paramètres' },
  { href: '/dashboard/billing',       icon: '💳', label: 'Abonnement' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [orgName, setOrgName] = useState('')
  const [plan, setPlan] = useState('free')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('organizations').select('name, plan').eq('owner_id', user.id).single()
        .then(({ data }) => {
          const org = data as { name: string; plan: string } | null
          if (org) { setOrgName(org.name); setPlan(org.plan) }
        })
    })
  }, [router])

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const planColors: Record<string, string> = { free: '#6B7280', starter: '#3B82F6', pro: '#8B5CF6', agency: '#F59E0B' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, system-ui, sans-serif', color: '#f0f0f0' }}>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 64 : 240, flexShrink: 0, background: '#0d0d14', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: mobileOpen ? 0 : undefined,
        height: '100vh', zIndex: 50, transition: 'width 0.2s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, background: 'linear-gradient(135deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ProofPulse</span>}
        </div>

        {/* Plan badge */}
        {!collapsed && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#aaa' }}>
                {orgName[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgName || 'Mon organisation'}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: planColors[plan] || '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{plan}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px', justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s',
                background: active ? 'rgba(79,70,229,0.15)' : 'transparent',
                color: active ? '#818CF8' : '#666',
                fontWeight: active ? 700 : 500, fontSize: 13,
                borderLeft: active ? '2px solid #4F46E5' : '2px solid transparent',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: collapsed ? '10px 0' : '10px 12px', width: '100%',
            background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer',
            borderRadius: 8, fontFamily: 'inherit'
          }}>
            <span style={{ fontSize: 14 }}>{collapsed ? '→' : '←'}</span>
            {!collapsed && 'Réduire'}
          </button>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: collapsed ? '10px 0' : '10px 12px', width: '100%',
            background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer',
            borderRadius: 8, fontFamily: 'inherit', transition: 'color 0.15s'
          }}>
            <span style={{ fontSize: 14 }}>🚪</span>
            {!collapsed && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, marginLeft: collapsed ? 64 : 240, minHeight: '100vh', transition: 'margin-left 0.2s ease' }}>
        {/* Top bar */}
        <header style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setMobileOpen(true)} style={{ display: 'none', background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }} className="pp-mobile-menu">☰</button>
          <div style={{ flex: 1 }} />
          <Link href="/dashboard/billing" style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: 'none',
            background: plan === 'free' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.04)',
            color: plan === 'free' ? 'white' : '#888',
            border: plan === 'free' ? 'none' : '1px solid rgba(255,255,255,0.08)',
          }}>
            {plan === 'free' ? '⚡ Passer au Pro' : `Plan ${plan}`}
          </Link>
        </header>
        <div style={{ padding: 'clamp(16px, 3vw, 32px)' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .pp-mobile-menu { display: block !important; }
          main { margin-left: 0 !important; }
          aside { transform: translateX(${mobileOpen ? '0' : '-100%'}); }
        }
      `}</style>
    </div>
  )
}
