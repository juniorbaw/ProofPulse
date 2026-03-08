'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur lors de la création du compte'); setLoading(false); return }

    // Auto login
    const supabase = createClient()
    await supabase.auth.signInWithPassword({ email, password })
    router.push('/dashboard/overview')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>ProofPulse</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 6 }}>Commencer gratuitement</h1>
          <p style={{ fontSize: 14, color: '#666' }}>Aucune carte bancaire requise</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#F87171' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 6 }}>Nom de votre boutique / entreprise</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ma Boutique" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 6 }}>Mot de passe (min. 8 caractères)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 10, border: 'none', background: loading ? '#333' : 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Création...' : 'Créer mon compte gratuit →'}
          </button>
          <p style={{ fontSize: 11, color: '#444', textAlign: 'center', lineHeight: 1.5 }}>
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" style={{ color: '#555', textDecoration: 'underline' }}>CGU</Link>{' '}et notre{' '}
            <Link href="/privacy" style={{ color: '#555', textDecoration: 'underline' }}>politique de confidentialité</Link>.
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#555' }}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
