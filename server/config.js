/**
 * إعدادات الخادم — كل القيم الحسّاسة تأتي من متغيّرات البيئة (.env) ولا تُكتب في الكود.
 */
import { randomBytes } from 'node:crypto'

const isProd = process.env.NODE_ENV === 'production'

/** يقرأ متغيّراً مطلوباً في الإنتاج فقط، مع قيمة افتراضية آمنة للتطوير */
function requiredInProd(key, devFallback) {
  const value = process.env[key]
  if (value) return value
  if (isProd) {
    console.error(`[config] المتغيّر ${key} مطلوب عند التشغيل في وضع الإنتاج.`)
    process.exit(1)
  }
  return devFallback
}

const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) ? n : fallback
}

/** سلسلة اتصال MongoDB مطلوبة دائماً — لا يوجد بديل محلي بدونها */
function requiredMongoUri() {
  const uri = process.env.MONGODB_URI
  if (uri) return uri
  console.error(
    '[config] المتغيّر MONGODB_URI مطلوب. أنشئ عنقوداً مجانياً على MongoDB Atlas وضع سلسلة الاتصال في server/.env'
  )
  process.exit(1)
}

export const config = {
  isProd,
  port: int(process.env.PORT, 4000),

  /** سرّ توقيع الجلسات — يُولَّد عشوائياً في التطوير فقط (يُبطل الجلسات عند كل إعادة تشغيل) */
  jwtSecret: requiredInProd('JWT_SECRET', randomBytes(32).toString('hex')),
  tokenTtl: process.env.TOKEN_TTL || '2h',

  /** المصادر المسموح لها بالطلب من المتصفح */
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  mongodbUri: requiredMongoUri(),

  /** عدد الوسطاء (proxies) الموثوقين أمام الخادم — لازم لضبط تحديد المعدّل خلف Nginx/Render */
  trustProxy: int(process.env.TRUST_PROXY, 0),

  /** الشحن — يُحسب في الخادم دائماً، لا يأتي من العميل */
  deliveryFeeMinor: int(process.env.DELIVERY_FEE, 10) * 100,
  freeDeliveryOverMinor: int(process.env.FREE_DELIVERY_OVER, 250) * 100,
  currency: process.env.CURRENCY || 'LYD',

  /** البريد عبر Resend (HTTPS) — استضافات مثل Render المجانية تحجب منافذ SMTP الصادرة،
      لذا لم نعد نستخدم Gmail SMTP مباشرة. أنشئ مفتاحاً من https://resend.com/api-keys */
  mail: {
    apiKey: process.env.RESEND_API_KEY || '',
    to: process.env.ORDER_EMAIL_TO || process.env.GMAIL_USER || '',
    from: process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev',
  },

  /** حدود الطلب */
  maxQty: int(process.env.MAX_QTY, 10),
  orderRateLimit: int(process.env.ORDER_RATE_LIMIT, 20),
}
