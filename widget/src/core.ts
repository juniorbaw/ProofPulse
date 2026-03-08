// ProofPulse Widget — Vanilla JS, zero dependencies, < 15KB gzipped
// Usage: <script src="https://cdn.proofpulse.io/widget.js" data-key="pp_live_xxx" async></script>

(function() {
  'use strict'

  const script = document.currentScript as HTMLScriptElement | null
  const API_KEY = script?.getAttribute('data-key') || ''
  const API_BASE = script?.getAttribute('data-api') || 'https://proofpulse.io'

  if (!API_KEY) { console.warn('[ProofPulse] data-key manquant'); return }

  // ─── State ────────────────────────────────────────────────────────────────
  let widgets: WidgetConfig[] = []
  let events: EventData[] = []
  let currentIndex = 0
  let isVisible = false
  let container: HTMLDivElement | null = null

  interface WidgetConfig {
    id: string
    type: 'recent_purchase' | 'live_visitors' | 'stock_urgency' | 'social_count' | 'custom'
    config: {
      enabled: boolean
      position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
      delay_seconds: number
      duration_seconds: number
      interval_seconds: number
      theme: 'light' | 'dark' | 'auto'
      animation: 'slide-in' | 'fade' | 'bounce'
      show_on_mobile: boolean
      text_template: string | null
      style: { border_radius: number; accent_color: string; text_color: string; bg_color: string }
    }
    name: string
  }

  interface EventData {
    id: string
    type: string
    data: Record<string, unknown>
    created_at: string
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  async function init() {
    // Skip bots
    if (/bot|crawler|spider/i.test(navigator.userAgent)) return

    try {
      const res = await fetch(`${API_BASE}/api/widget?key=${API_KEY}`)
      if (!res.ok) return
      const payload = await res.json()
      if (payload.limit_reached) return

      widgets = payload.widgets || []
      events = payload.events || []

      if (widgets.length === 0) return

      injectStyles()
      createContainer()

      // Premier affichage après délai
      const delay = (widgets[0]?.config?.delay_seconds || 3) * 1000
      setTimeout(showNext, delay)
    } catch (e) {
      // Silent fail — ne pas impacter le site
    }
  }

  // ─── Styles inline ────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('pp-styles')) return
    const style = document.createElement('style')
    style.id = 'pp-styles'
    style.textContent = `
      #pp-container {
        position: fixed; z-index: 999999; max-width: 320px; width: calc(100vw - 32px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        pointer-events: none;
      }
      #pp-container.pp-bottom-left { bottom: 24px; left: 16px; }
      #pp-container.pp-bottom-right { bottom: 24px; right: 16px; }
      #pp-container.pp-top-left { top: 24px; left: 16px; }
      #pp-container.pp-top-right { top: 24px; right: 16px; }
      .pp-notification {
        pointer-events: all; cursor: pointer;
        border-radius: 12px; padding: 14px 16px;
        display: flex; align-items: center; gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
        opacity: 0; transform: translateX(-20px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        position: relative;
      }
      .pp-notification.pp-visible { opacity: 1; transform: translateX(0); }
      .pp-notification.pp-slide-right { transform: translateX(20px); }
      .pp-notification.pp-fade { transform: none; }
      .pp-icon { font-size: 28px; flex-shrink: 0; line-height: 1; }
      .pp-content { flex: 1; min-width: 0; }
      .pp-title { font-size: 13px; font-weight: 700; line-height: 1.3; margin-bottom: 2px; }
      .pp-sub { font-size: 12px; opacity: 0.7; line-height: 1.3; }
      .pp-time { font-size: 11px; opacity: 0.5; margin-top: 4px; }
      .pp-close {
        position: absolute; top: 8px; right: 10px;
        background: none; border: none; cursor: pointer;
        font-size: 16px; opacity: 0.4; color: inherit; line-height: 1; padding: 2px;
      }
      .pp-close:hover { opacity: 0.8; }
      .pp-badge { font-size: 10px; opacity: 0.4; margin-top: 6px; display: block; }
      @media (max-width: 480px) { #pp-container { max-width: calc(100vw - 32px); } }
      @keyframes pp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      .pp-bounce.pp-visible { animation: pp-bounce 0.5s ease 0.35s; }
    `
    document.head.appendChild(style)
  }

  // ─── Container ────────────────────────────────────────────────────────────
  function createContainer() {
    const pos = widgets[0]?.config?.position || 'bottom-left'
    container = document.createElement('div')
    container.id = 'pp-container'
    container.className = `pp-${pos}`
    document.body.appendChild(container)
  }

  // ─── Notification builder ──────────────────────────────────────────────────
  function buildNotification(widget: WidgetConfig, event: EventData | null): string {
    const { type, config } = widget
    const data = event?.data || {}
    const isDark = config.theme === 'dark' || (config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const bg = isDark ? '#1a1a2e' : (config.style?.bg_color || '#ffffff')
    const color = isDark ? '#f0f0f0' : (config.style?.text_color || '#111827')
    const accent = config.style?.accent_color || '#4F46E5'
    const radius = config.style?.border_radius || 12

    let icon = '🛒'
    let title = ''
    let sub = ''
    let time = ''

    if (config.text_template) {
      title = config.text_template
        .replace('{buyer_name}', String(data.buyer_name || 'Un client'))
        .replace('{buyer_city}', String(data.buyer_city || 'France'))
        .replace('{product_name}', String(data.product_name || 'un produit'))
        .replace('{time_ago}', event ? timeAgo(event.created_at) : 'récemment')
    } else {
      switch (type) {
        case 'recent_purchase':
          icon = '🛒'
          title = `${data.buyer_name || 'Quelqu\'un'} de ${data.buyer_city || 'France'}`
          sub = `vient d'acheter "${data.product_name || 'un produit'}"`
          time = event ? timeAgo(event.created_at) : ''
          break
        case 'live_visitors':
          icon = '🔥'
          title = `${data.visitors_count || Math.floor(Math.random() * 15) + 3} personnes regardent`
          sub = 'ce produit en ce moment'
          break
        case 'stock_urgency':
          icon = '⚡'
          title = `Plus que ${data.stock_remaining || 3} en stock !`
          sub = `${data.quantity || Math.floor(Math.random() * 10) + 2} personnes l'ont dans leur panier`
          break
        case 'social_count':
          icon = '🏆'
          title = `${data.purchases_count || 147} personnes ont acheté`
          sub = 'ce produit cette semaine'
          break
        case 'custom':
          icon = '💬'
          title = String(data.custom_message || 'Message personnalisé')
          break
      }
    }

    return `
      <div class="pp-notification pp-${config.animation || 'slide-in'}" id="pp-notif"
        style="background:${bg};color:${color};border-radius:${radius}px;border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}">
        <div class="pp-icon">${icon}</div>
        <div class="pp-content">
          <div class="pp-title" style="color:${color}">${title}</div>
          ${sub ? `<div class="pp-sub">${sub}</div>` : ''}
          ${time ? `<div class="pp-time">⏱ ${time}</div>` : ''}
          <span class="pp-badge">ProofPulse</span>
        </div>
        <button class="pp-close" onclick="this.closest('.pp-notification').style.display='none'" title="Fermer">×</button>
      </div>
    `
  }

  // ─── Show / Hide ──────────────────────────────────────────────────────────
  function showNext() {
    if (!container || isVisible) return
    const widget = widgets[currentIndex % widgets.length]
    if (!widget?.config?.enabled) { scheduleNext(widget); return }
    if (!widget.config.show_on_mobile && window.innerWidth < 768) { scheduleNext(widget); return }

    // Trouver un événement du bon type
    const event = events.find(e => {
      if (widget.type === 'recent_purchase') return e.type === 'purchase'
      if (widget.type === 'live_visitors') return e.type === 'page_view'
      if (widget.type === 'stock_urgency') return e.type === 'add_to_cart'
      return true
    }) || null

    container.innerHTML = buildNotification(widget, event)
    isVisible = true
    currentIndex++

    // Apparition
    requestAnimationFrame(() => {
      const notif = document.getElementById('pp-notif')
      if (notif) notif.classList.add('pp-visible')
    })

    // Track impression
    trackImpression(widget.id)

    // Disparition automatique
    const duration = (widget.config.duration_seconds || 5) * 1000
    setTimeout(() => hide(widget), duration)
  }

  function hide(widget: WidgetConfig) {
    const notif = document.getElementById('pp-notif')
    if (notif) {
      notif.classList.remove('pp-visible')
      setTimeout(() => {
        if (container) container.innerHTML = ''
        isVisible = false
        scheduleNext(widget)
      }, 400)
    }
  }

  function scheduleNext(widget: WidgetConfig) {
    const interval = (widget?.config?.interval_seconds || 8) * 1000
    setTimeout(showNext, interval)
  }

  // ─── Analytics ────────────────────────────────────────────────────────────
  function trackImpression(widgetId: string) {
    fetch(`${API_BASE}/api/widget/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY, widget_id: widgetId, clicked: false }),
      keepalive: true,
    }).catch(() => {})
  }

  // ─── Utils ────────────────────────────────────────────────────────────────
  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'à l\'instant'
    if (m < 60) return `il y a ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `il y a ${h}h`
    return `il y a ${Math.floor(h / 24)}j`
  }

  // ─── Start ────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
