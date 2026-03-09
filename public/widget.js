/**
 * ProofPulse Widget v1.0.0
 * Social proof notifications — Vanilla JS, zero dependencies
 * Usage: <script src="https://votre-domaine.vercel.app/widget.js" data-key="pp_xxx" async></script>
 */
;(function () {
  'use strict'

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  var API_KEY = script.getAttribute('data-key')
  var API_BASE = script.src.replace('/widget.js', '')

  if (!API_KEY) {
    console.warn('[ProofPulse] Clé API manquante. Ajoutez data-key="pp_xxx" à la balise script.')
    return
  }

  var config = null
  var notifications = []
  var currentIndex = 0
  var container = null
  var notifEl = null
  var timer = null
  var sessionId = Math.random().toString(36).slice(2)

  // ── Styles ──────────────────────────────────────────────────────────────────
  function injectStyles(cfg) {
    var style = document.createElement('style')
    var pos = cfg.position || 'bottom-left'
    var isBottom = pos.indexOf('bottom') !== -1
    var isLeft = pos.indexOf('left') !== -1
    var br = (cfg.style && cfg.style.border_radius != null) ? cfg.style.border_radius : 12
    var bg = (cfg.style && cfg.style.bg_color) ? cfg.style.bg_color : '#ffffff'
    var tc = (cfg.style && cfg.style.text_color) ? cfg.style.text_color : '#1f2937'
    var ac = (cfg.style && cfg.style.accent_color) ? cfg.style.accent_color : '#6366f1'

    style.textContent = [
      '#pp-container {',
      '  position: fixed;',
      isBottom ? 'bottom: 20px;' : 'top: 20px;',
      isLeft ? 'left: 20px;' : 'right: 20px;',
      '  z-index: 2147483647;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
      '  max-width: 320px;',
      '  pointer-events: none;',
      '}',
      '#pp-notif {',
      '  background: ' + bg + ';',
      '  color: ' + tc + ';',
      '  border-radius: ' + br + 'px;',
      '  box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);',
      '  padding: 12px 14px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  pointer-events: all;',
      '  cursor: pointer;',
      '  border: 1px solid rgba(0,0,0,0.06);',
      '  transition: transform 0.2s ease, opacity 0.2s ease;',
      '}',
      '#pp-notif:hover { transform: scale(1.02); }',
      '#pp-avatar {',
      '  width: 38px; height: 38px;',
      '  border-radius: 50%;',
      '  background: ' + ac + ';',
      '  color: white;',
      '  font-weight: 700;',
      '  font-size: 15px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  flex-shrink: 0;',
      '}',
      '#pp-body { flex: 1; min-width: 0; }',
      '#pp-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }',
      '#pp-desc { font-size: 11px; opacity: 0.7; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '#pp-desc span { color: ' + ac + '; font-weight: 600; }',
      '#pp-time { font-size: 10px; opacity: 0.45; }',
      '#pp-close {',
      '  position: absolute; top: 6px; right: 8px;',
      '  font-size: 16px; opacity: 0.3; cursor: pointer; line-height: 1;',
      '  color: ' + tc + ';',
      '}',
      '#pp-close:hover { opacity: 0.7; }',
      '@keyframes pp-slide-in-left { from { transform: translateX(-120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }',
      '@keyframes pp-slide-in-right { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }',
      '@keyframes pp-slide-out-left { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-120%); opacity: 0; } }',
      '@keyframes pp-slide-out-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }',
      '.pp-in { animation: ' + (isLeft ? 'pp-slide-in-left' : 'pp-slide-in-right') + ' 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }',
      '.pp-out { animation: ' + (isLeft ? 'pp-slide-out-left' : 'pp-slide-out-right') + ' 0.35s ease-in both; }',
      '@media (max-width: 480px) {',
      '  #pp-container { left: 10px !important; right: 10px !important; max-width: calc(100vw - 20px); bottom: 10px !important; top: auto !important; }',
      '}',
    ].join('\n')
    document.head.appendChild(style)
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  function createContainer() {
    container = document.createElement('div')
    container.id = 'pp-container'
    document.body.appendChild(container)
  }

  function formatMessage(notif) {
    var data = notif.data || {}
    var title = '🛍️ ' + (data.buyer_name || 'Un client')
    var desc = 'vient d\'acheter'
    var product = data.product_name ? '<span>' + data.product_name + '</span>' : ''
    if (notif.type === 'live_visitors') {
      title = '👀 ' + (data.count || Math.floor(Math.random() * 20) + 5) + ' personnes'
      desc = 'regardent cette page en ce moment'
      product = ''
    } else if (notif.type === 'stock_urgency') {
      title = '⚡ Plus que ' + (data.stock || 3) + ' en stock !'
      desc = (data.views || Math.floor(Math.random() * 10) + 2) + ' personnes regardent cet article'
      product = ''
    } else if (notif.type === 'social_count') {
      title = '🎉 ' + (data.count || '1 247') + ' clients'
      desc = 'nous font confiance'
      product = ''
    }
    var timeAgo = data.time_ago || 'à l\'instant'
    return { title: title, desc: desc, product: product, timeAgo: timeAgo, initial: (data.buyer_name || 'A')[0].toUpperCase() }
  }

  function showNotification(notif) {
    if (!container) return
    var msg = formatMessage(notif)

    notifEl = document.createElement('div')
    notifEl.id = 'pp-notif'
    notifEl.innerHTML = [
      '<div id="pp-avatar">' + msg.initial + '</div>',
      '<div id="pp-body">',
      '  <div id="pp-title">' + msg.title + '</div>',
      '  <div id="pp-desc">' + msg.desc + (msg.product ? ' ' + msg.product : '') + '</div>',
      '  <div id="pp-time">' + msg.timeAgo + '</div>',
      '</div>',
      '<span id="pp-close">×</span>',
    ].join('')

    notifEl.classList.add('pp-in')
    container.appendChild(notifEl)

    // Track impression
    trackImpression(notif.id)

    // Click → track + redirect
    notifEl.addEventListener('click', function (e) {
      if (e.target && (e.target as Element).id === 'pp-close') { hideNotification(); return }
      trackClick(notif.id)
      if (notif.url) window.open(notif.url, '_blank')
    })

    // Close button
    var closeBtn = document.getElementById('pp-close')
    if (closeBtn) closeBtn.addEventListener('click', function () { hideNotification() })
  }

  function hideNotification() {
    if (!notifEl) return
    notifEl.classList.remove('pp-in')
    notifEl.classList.add('pp-out')
    var el = notifEl
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el)
    }, 400)
    notifEl = null
  }

  // ── Tracking ────────────────────────────────────────────────────────────────
  function trackImpression(notifId) {
    fetch(API_BASE + '/api/widget/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY, notification_id: notifId, session_id: sessionId, url: window.location.href }),
    }).catch(function () {})
  }

  function trackClick(notifId) {
    fetch(API_BASE + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY, type: 'click', data: { notification_id: notifId, url: window.location.href } }),
    }).catch(function () {})
  }

  // ── Loop ────────────────────────────────────────────────────────────────────
  function nextNotification() {
    if (!notifications.length) return
    hideNotification()

    setTimeout(function () {
      var notif = notifications[currentIndex % notifications.length]
      currentIndex++
      showNotification(notif)

      var duration = ((config && config.duration) || 5) * 1000
      setTimeout(function () {
        hideNotification()
      }, duration)

      var interval = ((config && config.interval) || 10) * 1000
      timer = setTimeout(nextNotification, duration + interval)
    }, notifEl ? 400 : 0)
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    // Récupérer la config widget
    fetch(API_BASE + '/api/widget?key=' + API_KEY)
      .then(function (r) { return r.ok ? r.json() : null })
      .then(function (data) {
        if (!data || !data.config) return
        config = data.config

        // Vérifier mobile
        if (!config.mobile && window.innerWidth <= 768) return

        injectStyles(config)
        createContainer()

        // Récupérer les notifications
        return fetch(API_BASE + '/api/widget/notifications?key=' + API_KEY)
          .then(function (r) { return r.ok ? r.json() : null })
          .then(function (notifData) {
            if (!notifData || !notifData.notifications || !notifData.notifications.length) {
              // Données de démo si aucun événement réel
              notifications = [
                { id: 'demo1', type: 'recent_purchase', data: { buyer_name: 'Sophie M.', buyer_city: 'Paris', product_name: 'Pack Premium', time_ago: 'il y a 2 min' } },
                { id: 'demo2', type: 'recent_purchase', data: { buyer_name: 'Thomas L.', buyer_city: 'Lyon', product_name: 'Abonnement Pro', time_ago: 'il y a 5 min' } },
                { id: 'demo3', type: 'recent_purchase', data: { buyer_name: 'Emma R.', buyer_city: 'Bordeaux', product_name: 'Formation X', time_ago: 'il y a 8 min' } },
              ]
            } else {
              notifications = notifData.notifications
            }

            // Démarrer après le délai configuré
            var delay = ((config && config.delay) || 3) * 1000
            setTimeout(nextNotification, delay)
          })
      })
      .catch(function (err) { console.warn('[ProofPulse] Erreur init:', err) })
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
