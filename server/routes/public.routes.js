import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { bad, int, optionalStr, phone, str, strictObject } from '../validate.js'
import { listPublicProducts } from '../services/productService.js'
import { getPublicSettings } from '../services/settingsService.js'
import { previewCoupon } from '../services/couponService.js'
import { createOrder, findOrderByNumber } from '../services/orderService.js'

export const publicRouter = Router()

/* ملاحظة: كثير من العملاء في ليبيا يخرجون من نفس عنوان IP عبر شبكة المشغّل،
   لذا اجعل الحد سخياً بما يكفي حتى لا تُحجب طلبات حقيقية — اضبطه عبر ORDER_RATE_LIMIT. */
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.orderRateLimit,
  message: { error: 'طلبات كثيرة خلال وقت قصير. حاول بعد قليل.' },
})

publicRouter.get('/health', (req, res) => res.json({ ok: true }))

/** الكتالوج — المصدر الوحيد للأسعار والمخزون التي يعرضها الموقع */
publicRouter.get('/products', async (req, res, next) => {
  try {
    res.json({ products: await listPublicProducts() })
  } catch (err) {
    next(err)
  }
})

/** إعدادات الشحن المعروضة للزائر — مصدرها الوحيد لحساب التوصيل والعتبة المجانية */
publicRouter.get('/settings', async (req, res, next) => {
  try {
    res.json(await getPublicSettings())
  } catch (err) {
    next(err)
  }
})

/** معاينة كوبون قبل تأكيد الطلب — لا تُرجع قائمة الأكواد أبداً، تتحقق فقط من كود بعينه */
publicRouter.post('/coupons/validate', async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['code'])
    const code = str(body.code, { field: 'code', max: 40 })
    res.json(await previewCoupon(code))
  } catch (err) {
    next(err)
  }
})

const itemSchema = (raw) => {
  const it = strictObject(raw, ['productId', 'qty'], 'عنصر السلة')
  return {
    productId: str(it.productId, { field: 'productId', max: 64 }),
    qty: int(it.qty, { field: 'qty', min: 1, max: config.maxQty }),
  }
}

const customerSchema = (raw) => {
  const c = strictObject(raw ?? bad('بيانات العميل مطلوبة.'), ['name', 'phone', 'city', 'address', 'notes'], 'بيانات العميل')
  return {
    name: str(c.name, { field: 'name', min: 3, max: 80 }),
    phone: phone(c.phone),
    city: str(c.city, { field: 'city', min: 2, max: 60 }),
    address: str(c.address, { field: 'address', min: 6, max: 200 }),
    notes: optionalStr(c.notes, { field: 'notes', max: 500 }),
  }
}

/**
 * POST /orders
 * الجسم المقبول: { items: [{ productId, qty }], couponCode?, customer }
 * لا يُقبل أي سعر أو إجمالي من العميل — تُحسب كل المبالغ من قاعدة البيانات.
 */
publicRouter.post('/orders', orderLimiter, async (req, res, next) => {
  try {
    const body = strictObject(req.body, ['items', 'couponCode', 'customer'])

    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
      bad('عناصر الطلب غير صحيحة.')
    }
    const items = body.items.map(itemSchema)
    const couponCode = body.couponCode ? str(body.couponCode, { field: 'couponCode', max: 40 }) : undefined
    const customer = customerSchema(body.customer)

    const order = await createOrder({ items, couponCode, customer })
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
})

/** تتبّع طلب برقمه — رقم الهاتف اختياري للتأكيد الإضافي (بدون تسجيل دخول، كما يُعلن الموقع) */
publicRouter.get('/orders/:number', async (req, res, next) => {
  try {
    const order = await findOrderByNumber(req.params.number, req.query.phone)
    if (!order) return res.status(404).json({ error: 'لم نعثر على طلب بهذا الرقم.' })
    res.json(order)
  } catch (err) {
    next(err)
  }
})
