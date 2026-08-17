import { SITE } from './config'

/**
 * تحميل Google Analytics 4 و Meta Pixel عند توفّر المعرّفات في config.js.
 * التحميل مؤجّل حتى لا يؤثر على سرعة أول رسم للصفحة.
 */
export function initAnalytics() {
  const { ga4, metaPixel } = SITE.analytics
  if (!ga4 && !metaPixel) return

  const load = () => {
    if (ga4) {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`
      document.head.appendChild(s)
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', ga4)
    }

    if (metaPixel) {
      /* eslint-disable */
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        }
        if (!f._fbq) f._fbq = n
        n.push = n
        n.loaded = !0
        n.version = '2.0'
        n.queue = []
        t = b.createElement(e)
        t.async = !0
        t.src = v
        s = b.getElementsByTagName(e)[0]
        s.parentNode.insertBefore(t, s)
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
      /* eslint-enable */
      window.fbq('init', metaPixel)
      window.fbq('track', 'PageView')
    }
  }

  if (document.readyState === 'complete') setTimeout(load, 1200)
  else window.addEventListener('load', () => setTimeout(load, 1200), { once: true })
}

/** تتبّع حدث في المنصّتين إن كانتا مفعّلتين */
export function track(event, params = {}) {
  try {
    window.gtag?.('event', event, params)
    window.fbq?.('track', event, params)
  } catch {
    /* التتبّع غير مفعّل */
  }
}

/** تتبّع مشاهدة صفحة عند تغيّر المسار */
export function trackPageView(path) {
  try {
    window.gtag?.('event', 'page_view', { page_path: path })
    window.fbq?.('track', 'PageView')
  } catch {
    /* التتبّع غير مفعّل */
  }
}
