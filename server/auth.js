/**
 * المصادقة — تجزئة كلمات المرور بـ scrypt (مدمجة في Node) وجلسات موقّعة بـ JWT.
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { config } from './config.js'

const KEYLEN = 64
const COST = { N: 16384, r: 8, p: 1 }

/** يُنتج: scrypt$N$r$p$salt$hash */
export function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEYLEN, COST)
  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('hex'), hash.toString('hex')].join('$')
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, N, r, p, saltHex, hashHex] = String(stored).split('$')
    if (scheme !== 'scrypt') return false
    const expected = Buffer.from(hashHex, 'hex')
    const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    })
    return timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

/** تجزئة وهمية تُقارَن عند عدم وجود المستخدم، حتى لا يكشف زمن الاستجابة أي بريد مسجّل */
export const DUMMY_HASH = hashPassword(randomBytes(32).toString('hex'))

export const signToken = (user) =>
  jwt.sign({ email: user.email, role: user.role }, config.jwtSecret, {
    subject: String(user.id),
    expiresIn: config.tokenTtl,
  })

/** يسمح فقط لحاملي رمز صالح بدور admin */
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'مطلوب تسجيل الدخول.' })

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    if (payload.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية.' })
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'رمز الدخول غير صالح أو منتهي الصلاحية.' })
  }
}
