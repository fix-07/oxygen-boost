import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { User } from '../models/User.js'
import { DUMMY_HASH, hashPassword, requireAdmin, signToken, verifyPassword } from '../auth.js'
import { bad, email as validateEmail, int, str, strictObject } from '../validate.js'
import { sendPasswordChangedEmail, sendEmailChangedNotice } from '../mailer.js'
import { listAdminProducts, updateProduct } from '../services/productService.js'
import { listOrdersAdmin, updateOrderAdmin } from '../services/orderService.js'
import { listCoupons, upsertCoupon, deleteCoupon } from '../services/couponService.js'
import { listDeliveryZones, upsertDeliveryZone, deleteDeliveryZone } from '../services/deliveryService.js'
import { updateSettings } from '../services/settingsService.js'
import { toMinor } from '../utils/money.js'
import { ORDER_STATUSES } from '../models/Order.js'

export const adminRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'محاولات دخول كثيرة. حاول بعد ١٥ دقيقة.' },
})

adminRouter.post('/admin/login', loginLimiter, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['email', 'password'])
    const mail = validateEmail(body.email)
    const password = str(body.password, { field: 'password', min: 1, max: 200 })

    const user = await User.findOne({ email: mail })
    /* نتحقّق دائماً — حتى مع مستخدم غير موجود — حتى لا يكشف زمن الاستجابة البُرد المسجّلة */
    const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)

    if (!user || !ok) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة.' })
    if (user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية.' })

    res.json({ token: signToken(user), expiresIn: config.tokenTtl, role: user.role })
  } catch (err) {
    next(err)
  }
})

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'محاولات كثيرة. حاول بعد ١٥ دقيقة.' },
})

/** تغيير كلمة مرور المشرف الحالي — يتطلّب كلمة المرور الحالية */
adminRouter.patch('/admin/password', requireAdmin, passwordChangeLimiter, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['currentPassword', 'newPassword'])
    const currentPassword = str(body.currentPassword, { field: 'currentPassword', min: 1, max: 200 })
    const newPassword = str(body.newPassword, { field: 'newPassword', min: 8, max: 200 })

    const user = await User.findOne({ email: req.user.email })
    /* 400 لا 401 — الرمز صالح والمستخدم موثّق فعلاً، فقط أخطأ كلمة المرور الحالية.
       401 هنا يجعل عميل الواجهة يظنّ الجلسة منتهية ويسجّل خروجاً تلقائياً. */
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      bad('كلمة المرور الحالية غير صحيحة.')
    }

    user.passwordHash = hashPassword(newPassword)
    await user.save()

    sendPasswordChangedEmail(user.email).catch((err) => console.error('[mail]', err.message))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

const emailChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'محاولات كثيرة. حاول بعد ١٥ دقيقة.' },
})

/** تغيير بريد المشرف الحالي — يتطلّب كلمة المرور الحالية، ويصدر رمزاً جديداً لأن الرمز القديم يحمل البريد القديم */
adminRouter.patch('/admin/email', requireAdmin, emailChangeLimiter, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['currentPassword', 'newEmail'])
    const currentPassword = str(body.currentPassword, { field: 'currentPassword', min: 1, max: 200 })
    const newEmail = validateEmail(body.newEmail)

    const user = await User.findOne({ email: req.user.email })
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      bad('كلمة المرور الحالية غير صحيحة.')
    }
    if (newEmail === user.email) bad('البريد الجديد مطابق للبريد الحالي.')
    if (await User.exists({ email: newEmail })) bad('هذا البريد مستخدم بالفعل.')

    const oldEmail = user.email
    user.email = newEmail
    await user.save()

    sendEmailChangedNotice(oldEmail, newEmail).catch((err) => console.error('[mail]', err.message))
    res.json({ ok: true, token: signToken(user), expiresIn: config.tokenTtl, role: user.role })
  } catch (err) {
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/*  المنتجات                                                                   */
/* -------------------------------------------------------------------------- */

adminRouter.get('/admin/products', requireAdmin, async (req, res, next) => {
  try {
    res.json({ products: await listAdminProducts() })
  } catch (err) {
    next(err)
  }
})

/** تعديل منتج — الحقول المقبولة من قائمة ثابتة فقط */
adminRouter.patch('/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['name', 'price', 'stock', 'active'])
    const patch = {}

    if (body.name !== undefined) patch.name = str(body.name, { field: 'name', min: 2, max: 120 })
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isFinite(price) || price < 0 || price > 1_000_000) bad('السعر غير صحيح.')
      patch.priceMinor = toMinor(price)
    }
    if (body.stock !== undefined) patch.stock = int(body.stock, { field: 'stock', min: 0, max: 100_000 })
    if (body.active !== undefined) {
      if (typeof body.active !== 'boolean') bad('الحقل «active» يجب أن يكون true أو false.')
      patch.active = body.active
    }
    if (!Object.keys(patch).length) bad('لا توجد حقول للتعديل.')

    res.json({ product: await updateProduct(req.params.id, patch) })
  } catch (err) {
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/*  الطلبات                                                                    */
/* -------------------------------------------------------------------------- */

adminRouter.get('/admin/orders', requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 200)
    res.json({ orders: await listOrdersAdmin(limit) })
  } catch (err) {
    next(err)
  }
})

/** تعديل حالة الطلب أو علامة "مقروء" */
adminRouter.patch('/admin/orders/:number', requireAdmin, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['status', 'read'])
    const patch = {}

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) bad('حالة الطلب غير صحيحة.')
      patch.status = body.status
    }
    if (body.read !== undefined) {
      if (typeof body.read !== 'boolean') bad('الحقل «read» يجب أن يكون true أو false.')
      patch.read = body.read
    }
    if (!Object.keys(patch).length) bad('لا توجد حقول للتعديل.')

    res.json({ order: await updateOrderAdmin(req.params.number, patch) })
  } catch (err) {
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/*  أكواد الخصم                                                                 */
/* -------------------------------------------------------------------------- */

adminRouter.get('/admin/coupons', requireAdmin, async (req, res, next) => {
  try {
    res.json({ coupons: await listCoupons() })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/admin/coupons', requireAdmin, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['code', 'type', 'value', 'note', 'active'])
    const code = str(body.code, { field: 'code', min: 2, max: 40 })
    if (!['percent', 'fixed', 'shipping'].includes(body.type)) bad('نوع الكوبون غير صحيح.')
    const value = body.type === 'shipping' ? 0 : Number(body.value)
    if (body.type !== 'shipping' && (!Number.isFinite(value) || value < 0)) bad('قيمة الكوبون غير صحيحة.')

    res.json({
      coupon: await upsertCoupon({
        code,
        type: body.type,
        value,
        note: body.note ? str(body.note, { field: 'note', min: 0, max: 120 }) : '',
        active: body.active === undefined ? true : Boolean(body.active),
      }),
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/admin/coupons/:code', requireAdmin, async (req, res, next) => {
  try {
    await deleteCoupon(req.params.code)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/*  مناطق التوصيل                                                               */
/* -------------------------------------------------------------------------- */

adminRouter.get('/admin/delivery-zones', requireAdmin, async (req, res, next) => {
  try {
    res.json({ zones: await listDeliveryZones() })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/admin/delivery-zones', requireAdmin, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['location', 'region', 'price', 'order'])
    const location = str(body.location, { field: 'location', min: 2, max: 80 })
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) bad('سعر التوصيل غير صحيح.')
    const order = body.order === undefined ? 0 : int(body.order, { field: 'order', min: 0, max: 1000 })

    res.json({
      zone: await upsertDeliveryZone({
        location,
        region: body.region ? str(body.region, { field: 'region', min: 0, max: 60 }) : '',
        price,
        order,
      }),
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/admin/delivery-zones/:location', requireAdmin, async (req, res, next) => {
  try {
    await deleteDeliveryZone(req.params.location)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/*  الإعدادات                                                                   */
/* -------------------------------------------------------------------------- */

adminRouter.patch('/admin/settings', requireAdmin, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['deliveryFee', 'freeDeliveryOver'])
    const patch = {}

    if (body.deliveryFee !== undefined) {
      const v = Number(body.deliveryFee)
      if (!Number.isFinite(v) || v < 0) bad('تكلفة التوصيل غير صحيحة.')
      patch.deliveryFee = v
    }
    if (body.freeDeliveryOver !== undefined) {
      const v = Number(body.freeDeliveryOver)
      if (!Number.isFinite(v) || v < 0) bad('قيمة التوصيل المجاني غير صحيحة.')
      patch.freeDeliveryOver = v
    }
    if (!Object.keys(patch).length) bad('لا توجد حقول للتعديل.')

    res.json(await updateSettings(patch))
  } catch (err) {
    next(err)
  }
})
