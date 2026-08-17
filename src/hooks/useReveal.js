import { useEffect, useRef } from 'react'

/**
 * مراقب واحد مشترك لكل عناصر الظهور — أخفّ من إنشاء مراقب لكل عنصر.
 */
let observer = null

const getObserver = () => {
  if (observer) return observer
  if (typeof IntersectionObserver === 'undefined') return null

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const delay = Number(el.dataset.delay || 0)
        if (delay) setTimeout(() => el.classList.add('is-in'), delay)
        else el.classList.add('is-in')
        observer.unobserve(el)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  )
  return observer
}

/**
 * شبكة أمان: عناصر الظهور تبدأ بشفافية صفر، فلو تعذّر عمل المراقب لأي سبب
 * (تبويب مفتوح في الخلفية مثلاً) يبقى المحتوى مخفياً. هذه المكنسة تضمن ظهوره.
 */
let safetyArmed = false

const sweep = () => {
  document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight * 1.25 && r.bottom > -240) el.classList.add('is-in')
  })
}

const armSafety = () => {
  if (safetyArmed) return
  safetyArmed = true
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(sweep, 120)
  })
  setTimeout(sweep, 2500)
}

/**
 * يُرجع ref يُسجّل العنصر تلقائياً — يعمل مع الصفحات المُحمّلة بالكسل (lazy)
 * لأن التسجيل يحدث عند تركيب العنصر نفسه لا عند تغيّر المسار.
 */
export function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = getObserver()
    if (!io) {
      el.classList.add('is-in')
      return
    }

    armSafety()
    io.observe(el)
    return () => io.unobserve(el)
  }, [])

  return ref
}
