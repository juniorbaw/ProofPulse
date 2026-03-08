import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json() as { name?: string; email?: string; password?: string }
    if (!name || !email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min)' }, { status: 400 })

    const admin = createAdminClient()

    // Créer l'utilisateur Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true
    })
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Erreur création compte' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Vérifier si le slug existe déjà
    let slug = slugify(name)
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/organizations?slug=eq.${encodeURIComponent(slug)}&select=slug`,
      { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` } }
    )
    const existing = await checkRes.json() as unknown[]
    if (existing.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`

    // Créer l'organisation via REST API (évite les contraintes de type Supabase non générées)
    const orgRes = await fetch(`${supabaseUrl}/rest/v1/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name,
        slug,
        owner_id: authData.user.id,
        plan: 'free',
        impressions_limit: 1000,
      }),
    })

    if (!orgRes.ok) {
      const err = await orgRes.text()
      // Supprimer l'utilisateur si l'organisation n'a pas pu être créée
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
