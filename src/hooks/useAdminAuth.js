/**
 * جلسة المشرف — رمز JWT حقيقي من الخادم (وليس رمزاً محلياً في المتصفح).
 * يُحفظ في sessionStorage فقط (يُمسح عند إغلاق التبويب) لتقليل مدة تعرّضه.
 */
import { useCallback, useMemo, useState } from 'react'
import { api, ApiError } from '../services/api'

const KEY = 'ob:admin-session'

const parseTtlMs = (ttl) => {
  const m = String(ttl).match(/^(\d+)([smhd])$/)
  if (!m) return 2 * 60 * 60 * 1000
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]]
  return Number(m[1]) * mult
}

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.token || !session?.expiresAt || Date.now() >= session.expiresAt) return null
    return session
  } catch {
    return null
  }
}

export function useAdminAuth() {
  const [session, setSession] = useState(readSession)

  /** يُخزّن جلسة من استجابة تحمل { token, expiresIn, role } — تسجيل الدخول أو أي رمز مُجدَّد بعده */
  const applySession = useCallback((res) => {
    const next = { token: res.token, role: res.role, expiresAt: Date.now() + parseTtlMs(res.expiresIn) }
    sessionStorage.setItem(KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const login = useCallback(
    async (email, password) => {
      applySession(await api.post('/admin/login', { email, password }))
    },
    [applySession]
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(KEY)
    setSession(null)
  }, [])

  const call = useCallback(
    async (fn) => {
      if (!session) throw new ApiError('يجب تسجيل الدخول.', 401)
      try {
        return await fn(session.token)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) logout()
        throw err
      }
    },
    [session, logout]
  )

  return useMemo(
    () => ({
      isAuthed: Boolean(session),
      login,
      logout,
      applySession,
      get: (path) => call((token) => api.get(path, { token })),
      post: (path, body) => call((token) => api.post(path, body, { token })),
      patch: (path, body) => call((token) => api.patch(path, body, { token })),
      delete: (path) => call((token) => api.delete(path, { token })),
    }),
    [session, login, logout, applySession, call]
  )
}
