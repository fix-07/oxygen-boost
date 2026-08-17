/**
 * التحقّق من المدخلات — قائمة سماح صارمة.
 * أي مفتاح غير معروف يُرفَض بدل تجاهله بصمت، فلا يمكن لعميل أن يمرّر سعراً أو إجمالياً.
 */

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const bad = (message) => {
  throw new HttpError(400, message)
}

/** يرفض أي حقل خارج القائمة المسموحة ويعيد كائناً نظيفاً */
export function strictObject(value, allowed, label = 'الطلب') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    bad(`صيغة ${label} غير صحيحة.`)
  }
  const unknown = Object.keys(value).filter((k) => !allowed.includes(k))
  if (unknown.length) {
    throw new HttpError(400, `حقول غير مسموح بها في ${label}: ${unknown.join(', ')}`)
  }
  return value
}

export function str(value, { field, min = 1, max = 200 }) {
  if (typeof value !== 'string') bad(`الحقل «${field}» مطلوب.`)
  const trimmed = value.trim()
  if (trimmed.length < min) bad(`الحقل «${field}» قصير جداً (الحد الأدنى ${min} حرفاً).`)
  if (trimmed.length > max) bad(`الحقل «${field}» طويل جداً (الحد الأقصى ${max} حرفاً).`)
  return trimmed
}

export function optionalStr(value, opts) {
  if (value === undefined || value === null || value === '') return ''
  return str(value, { ...opts, min: 0 })
}

export function int(value, { field, min, max }) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n)) bad(`الحقل «${field}» يجب أن يكون عدداً صحيحاً.`)
  if (n < min || n > max) bad(`الحقل «${field}» يجب أن يكون بين ${min} و ${max}.`)
  return n
}

/** رقم هاتف ليبي/دولي — نتحقّق من عدد الأرقام بعد إزالة الفواصل */
export function phone(value) {
  const raw = str(value, { field: 'phone', min: 6, max: 25 })
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 15) bad('رقم الهاتف غير صحيح.')
  return raw
}

export function email(value) {
  const v = str(value, { field: 'email', min: 5, max: 160 }).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) bad('صيغة البريد الإلكتروني غير صحيحة.')
  return v
}
