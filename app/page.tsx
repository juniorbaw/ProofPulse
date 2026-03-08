'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Zap, Shield, Globe, BarChart3, Bell, Users, TrendingUp, Star, ChevronDown } from 'lucide-react'

// Widget demo simulation
function DemoWidget() {
  const notifications = [
    { name: 'Sophie M.', city: 'Paris', product: 'Pack Premium', time: '2 min' },
    { name: 'Thomas L.', city: 'Lyon', product: 'Abonnement Pro', time: '5 min' },
    { name: 'Emma R.', city: 'Bordeaux', product: 'Formation X', time: '8 min' },
    { name: 'Lucas B.', city: 'Marseille', product: 'Pack Starter', time: '12 min' },
  ]
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % notifications.length)
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const n = notifications[current]
  return (
    <div
      className={`transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[280px] border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {n.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            🛍️ {n.name} de {n.city}
          </p>
          <p className="text-xs text-gray-500 truncate">
            vient d&apos;acheter <span className="text-indigo-600 font-medium">{n.product}</span>
          </p>
          <p className="text-xs text-gray-400">il y a {n.time}</p>
        </div>
      </div>
    </div>
  )
}

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    description: 'Pour tester ProofPulse',
    features: ['1 site', '1 widget', '1 000 impressions/mois', 'Type : achat récent uniquement', 'Badge "Powered by ProofPulse"'],
    cta: 'Commencer gratuitement',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Starter',
    monthly: 27,
    annual: 270,
    description: 'Pour les boutiques qui démarrent',
    features: ['3 sites', '5 widgets', '10 000 impressions/mois', 'Tous les types de notifications', 'Analytics basiques', 'Support email', 'Sans badge'],
    cta: 'Essayer 14 jours gratuits',
    href: '/signup?plan=starter',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthly: 67,
    annual: 670,
    description: 'Pour scaler vos conversions',
    features: ['10 sites', 'Widgets illimités', '100 000 impressions/mois', 'A/B testing', 'Analytics avancés', 'Intégrations Shopify & WooCommerce', 'CSS personnalisé', 'Support prioritaire'],
    cta: 'Essayer 14 jours gratuits',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Agency',
    monthly: 147,
    annual: 1470,
    description: 'Pour les agences et revendeurs',
    features: ['Sites illimités', 'Widgets illimités', '500 000 impressions/mois', 'White label', 'Multi-comptes clients', 'Accès API complet', 'Account manager dédié'],
    cta: 'Contacter les ventes',
    href: '/signup?plan=agency',
    highlighted: false,
  },
]

const FAQS = [
  { q: 'Comment fonctionne l\'installation ?', a: 'Copiez une ligne de code JavaScript dans votre site. C\'est tout. Compatible avec n\'importe quel CMS ou site custom.' },
  { q: 'Est-ce que ProofPulse ralentit mon site ?', a: 'Non. Le widget se charge de façon asynchrone et pèse moins de 15KB. Impact sur votre Lighthouse score : zéro.' },
  { q: 'ProofPulse est-il RGPD compliant ?', a: 'Oui. Aucun cookie posé. Les IPs sont anonymisées côté serveur avant stockage. Toutes les données sont supprimables.' },
  { q: 'Puis-je afficher mes propres données d\'achat ?', a: 'Absolument. Via webhook Shopify/WooCommerce (auto) ou via notre API et webhook générique pour n\'importe quelle source.' },
  { q: 'Que se passe-t-il si je dépasse ma limite ?', a: 'Les notifications s\'arrêtent simplement d\'être affichées. Aucun surcoût. Vous recevez un email pour upgrader.' },
]

export default function LandingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ProofPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Connexion</Link>
            <Link href="/signup" className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-indigo-950 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
            <TrendingUp className="w-3.5 h-3.5" />
            Trusted by 500+ e-commerces francophones
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transformez vos visiteurs en
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> acheteurs</span>
            <br />avec la preuve sociale
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            +23% de conversions en moyenne. Installation en 60 secondes. Compatible Shopify, WooCommerce et tout site.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
              Essayer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg border border-white/10">
              Voir la démo
            </a>
          </div>
          {/* Demo widget */}
          <div id="demo" className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-400">Widget en action ↓</p>
            <DemoWidget />
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm text-gray-400 mb-8">Compatible avec vos outils préférés</p>
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-400 font-semibold text-lg">
            {['Shopify', 'WooCommerce', 'Stripe', 'Zapier', 'Make', 'Webflow', 'WordPress', 'Wix'].map((name) => (
              <span key={name} className="hover:text-gray-600 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
            <p className="text-gray-500 text-lg">En 3 étapes, votre site affiche de la preuve sociale en temps réel</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Globe className="w-6 h-6" />, title: 'Copiez le code', desc: 'Une seule ligne de JavaScript à coller dans votre site. Aucune dépendance, aucun impact sur les performances.' },
              { step: '02', icon: <Bell className="w-6 h-6" />, title: 'Personnalisez', desc: 'Configurez votre widget depuis le dashboard : couleurs, position, timing, messages. Aperçu en temps réel.' },
              { step: '03', icon: <TrendingUp className="w-6 h-6" />, title: 'Convertissez', desc: 'Vos visiteurs voient les achats récents. La FOMO fait le reste. Vos conversions augmentent.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all">
                <div className="text-6xl font-bold text-gray-50 absolute top-4 right-6 select-none">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tout ce qu&apos;il vous faut</h2>
            <p className="text-gray-500 text-lg">Des fonctionnalités pensées pour les e-commerces francophones</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: '+23% de conversions', desc: 'Résultat moyen constaté sur les boutiques utilisant ProofPulse pendant 30 jours.' },
              { icon: <Zap className="w-5 h-5" />, title: 'Installation 60 secondes', desc: 'Une ligne de code. Pas de plugin, pas de configuration complexe.' },
              { icon: <Shield className="w-5 h-5" />, title: 'RGPD compliant', desc: 'Zéro cookie. IPs anonymisées. Données supprimables sur demande.' },
              { icon: <Globe className="w-5 h-5" />, title: 'Compatible partout', desc: 'Shopify, WooCommerce, Webflow, WordPress, sites custom... tout fonctionne.' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Analytics détaillés', desc: 'Impressions, clics, CTR par widget. Heatmap horaire. A/B testing.' },
              { icon: <Users className="w-5 h-5" />, title: '4 types de notifications', desc: 'Achat récent, visiteurs live, urgence stock, compteur social, message custom.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ils adorent ProofPulse</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Marie Dupont', role: 'Fondatrice', company: 'BioBeauté Shop', quote: 'En 2 semaines, mon taux de conversion est passé de 1.8% à 2.4%. ProofPulse a été le seul changement que j\'ai fait.', stat: '+33% de conversions' },
              { name: 'Antoine Bernard', role: 'CEO', company: 'TechGadgets FR', quote: 'Installation en 5 minutes chrono. Les clients voient les achats en temps réel et ça crée vraiment de la FOMO. Impressionnant.', stat: '+28% de conversions' },
              { name: 'Julie Martin', role: 'E-commerce Manager', company: 'ModeActuelle.fr', quote: 'Le meilleur ROI de tous mes outils marketing. 27€/mois pour des centaines d\'euros de CA supplémentaire chaque semaine.', stat: '+19% de conversions' },
            ].map(({ name, role, company, quote, stat }) => (
              <div key={name} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm flex-1 mb-4 italic">&ldquo;{quote}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role} · {company}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{stat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h2>
            <p className="text-gray-500 text-lg mb-8">Commencez gratuitement, évoluez quand vous êtes prêt</p>
            <div className="inline-flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Mensuel</button>
              <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                Annuel
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${annual ? 'bg-indigo-500 text-white' : 'bg-green-100 text-green-700'}`}>-2 mois</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative p-6 rounded-2xl border flex flex-col ${plan.highlighted ? 'border-indigo-500 bg-indigo-600 text-white shadow-2xl scale-105' : 'border-gray-200 bg-white'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.monthly === 0 ? '0€' : `${annual ? Math.round((plan.annual / 12)) : plan.monthly}€`}
                    </span>
                    {plan.monthly > 0 && <span className={`text-sm mb-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>/mois</span>}
                  </div>
                  {annual && plan.annual > 0 && (
                    <p className={`text-xs mt-1 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {plan.annual}€/an · 2 mois offerts
                    </p>
                  )}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-500'}`} />
                      <span className={plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-colors ${plan.highlighted ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à booster vos conversions ?</h2>
          <p className="text-indigo-100 text-lg mb-8">Rejoignez 500+ boutiques qui font confiance à ProofPulse. Gratuit, sans carte bancaire.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg">
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">ProofPulse</span>
              </div>
              <p className="text-sm">La preuve sociale pour les e-commerces francophones.</p>
            </div>
            {[
              { title: 'Produit', links: [{ label: 'Fonctionnalités', href: '#features' }, { label: 'Tarifs', href: '#pricing' }, { label: 'Documentation', href: '/docs' }, { label: 'Changelog', href: '/changelog' }] },
              { title: 'Entreprise', links: [{ label: 'À propos', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'Carrières', href: '/careers' }, { label: 'Contact', href: '/contact' }] },
              { title: 'Légal', links: [{ label: 'Mentions légales', href: '/legal' }, { label: 'Confidentialité', href: '/privacy' }, { label: 'CGU', href: '/terms' }, { label: 'Cookies', href: '/cookies' }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}><Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2025 ProofPulse. Tous droits réservés.</p>
            <p className="text-sm">Made with ❤️ in Paris</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
