import { useEffect } from 'react'
import { SITE } from '../config'

/** يضبط (أو ينشئ) وسم meta واحداً */
const setMeta = (keyAttr, keyValue, content) => {
  if (content == null) return
  let el = document.head.querySelector(`meta[${keyAttr}="${keyValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(keyAttr, keyValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * يضبط عنوان الصفحة والوصف والرابط الأساسي وبيانات المشاركة لكل صفحة.
 */
export function useSeo({ title, description, path = '', jsonLd } = {}) {
  // نُسلسل البيانات المنظّمة حتى لا يُعاد تنفيذ الأثر مع كل إعادة رسم
  const ld = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    const full = title ? `${title} | ${SITE.name}` : `${SITE.name} — تنفّس بسهولة أكبر`
    document.title = full

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', `${SITE.url}${path}`)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `${SITE.url}${path}`

    let script
    if (ld) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = ld
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, path, ld])
}
