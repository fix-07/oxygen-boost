/**
 * واجهة المتجر البرمجية.
 *
 * القاعدة الأمنية الأساسية: كل سعر ومبلغ يُقرأ ويُحسب من قاعدة البيانات فقط.
 * نقاط الطلب لا تقبل أي حقل يتعلّق بالمال من العميل — إرسال حقل غير مسموح به يُرفَض بالحالة 400.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { config } from './config.js'
import { publicRouter } from './routes/public.routes.js'
import { adminRouter } from './routes/admin.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const app = express()

app.set('trust proxy', config.trustProxy)
app.use(helmet())
app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '10kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }))

/* أداة تطوير محلية لاختبار تغيير كلمة مرور المشرف — غير متاحة في الإنتاج */
if (!config.isProd) {
  app.get('/admin/test', (req, res) => res.sendFile(path.join(__dirname, 'public', 'test-change-password.html')))
}

app.use(publicRouter)
app.use(adminRouter)

app.use((req, res) => res.status(404).json({ error: 'المسار غير موجود.' }))

/* معالج الأخطاء — لا يسرّب أي تفاصيل داخلية للعميل */
app.use((err, req, res, next) => {
  /* أخطاء محلّل الجسم تحمل رسائل داخلية — نستبدلها برسائل نظيفة */
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'صيغة JSON غير صحيحة.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'حجم الطلب كبير جداً.' })
  }

  const status = err.status || err.statusCode || 500
  if (status >= 500) console.error('[error]', err)
  res.status(status).json({ error: status < 500 ? err.message : 'حدث خطأ في الخادم.' })
})
