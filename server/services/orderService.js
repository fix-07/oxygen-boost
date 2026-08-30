/**
 * إنشاء الطلبات — القاعدة الأمنية الأساسية: كل سعر ومجموع يُحسب هنا من قاعدة
 * البيانات فقط. العميل يرسل productId/qty وكود خصم اختياري لا غير.
 *
 * خصم المخزون وإدراج الطلب يتمّان داخل معاملة MongoDB واحدة (يتطلّب Atlas أو أي
 * replica set) — فإما ينجح كل شيء معاً أو يتراجع كل شيء، فلا بيع زائد عند
 * الطلبات المتزامنة ولا مخزوناً يُخصَم بلا طلب مقابل.
 */
import { randomInt } from 'node:crypto'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { getSettings } from './settingsService.js'
import { findActiveCoupon, computeDiscount } from './couponService.js'
import { findZoneFeeMinor } from './deliveryService.js'
import { sendOrderEmail } from '../mailer.js'
import { HttpError } from '../validate.js'
import { toMajor } from '../utils/money.js'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const orderNumber = () =>
  'OB-' + Array.from({ length: 7 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')

/** يحوّل مستند الطلب إلى الشكل الذي تتوقعه الواجهة (وحدات كبرى، حقول مسطّحة) */
const publicOrder = (o) => ({
  number: o.number,
  createdAt: o.createdAt,
  status: o.status,
  read: o.read,
  items: o.items.map((i) => ({ id: i.productId, name: i.name, qty: i.qty, price: toMajor(i.unitPriceMinor) })),
  subtotal: toMajor(o.subtotalMinor),
  discount: toMajor(o.discountMinor),
  coupon: o.couponCode,
  delivery: toMajor(o.deliveryMinor),
  total: toMajor(o.totalMinor),
  payment: o.payment,
  customer: o.customer,
})

/**
 * items: [{ productId, qty }]
 * customer: { name, phone, city, address, notes }
 * couponCode: string | undefined
 */
export async function createOrder({ items, couponCode, customer }) {
  const session = await mongoose.startSession()
  let order

  try {
    await session.withTransaction(async () => {
      const lineItems = []
      let subtotalMinor = 0

      for (const { productId, qty } of items) {
        const product = await Product.findOneAndUpdate(
          { _id: productId, active: true, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { returnDocument: 'after', session }
        )
        if (!product) {
          const exists = await Product.exists({ _id: productId, active: true }).session(session)
          throw new HttpError(exists ? 409 : 404, exists ? `الكمية غير متوفرة لمنتج «${productId}».` : 'أحد المنتجات في الطلب غير موجود.')
        }
        const lineTotalMinor = product.priceMinor * qty
        subtotalMinor += lineTotalMinor
        lineItems.push({
          productId: product._id,
          name: product.name,
          qty,
          unitPriceMinor: product.priceMinor,
          lineTotalMinor,
        })
      }

      const settings = await getSettings()
      const coupon = await findActiveCoupon(couponCode)
      const { discountMinor, freeShipping } = computeDiscount(coupon, subtotalMinor)

      const zoneFeeMinor = await findZoneFeeMinor(customer.city)
      const baseDeliveryMinor = zoneFeeMinor ?? settings.deliveryFeeMinor

      const afterDiscount = Math.max(0, subtotalMinor - discountMinor)
      const qualifiesFree = settings.freeDeliveryOverMinor > 0 && afterDiscount >= settings.freeDeliveryOverMinor
      const deliveryMinor = freeShipping || qualifiesFree ? 0 : baseDeliveryMinor
      const totalMinor = afterDiscount + deliveryMinor

      let created = null
      for (let attempt = 0; attempt < 5 && !created; attempt++) {
        const number = orderNumber()
        const taken = await Order.exists({ number }).session(session)
        if (taken) continue
        ;[created] = await Order.create(
          [
            {
              number,
              items: lineItems,
              subtotalMinor,
              discountMinor,
              couponCode: coupon ? coupon.code : null,
              deliveryMinor,
              totalMinor,
              customer,
            },
          ],
          { session }
        )
      }
      if (!created) throw new HttpError(500, 'تعذّر توليد رقم طلب فريد.')
      order = created
    })
  } finally {
    await session.endSession()
  }

  const shaped = publicOrder(order)
  sendOrderEmail(shaped).catch((err) => console.error('[mail]', err.message))
  return shaped
}

/** بحث علني برقم الطلب — رقم الهاتف اختياري للتأكيد (نفس سلوك اللوحة المحلية سابقاً) */
export async function findOrderByNumber(number, phone) {
  const order = await Order.findOne({ number: number.toUpperCase() }).lean()
  if (!order) return null
  if (phone) {
    const a = order.customer.phone.replace(/\D/g, '').slice(-8)
    const b = String(phone).replace(/\D/g, '').slice(-8)
    if (a !== b) return null
  }
  return publicOrder(order)
}

export async function listOrdersAdmin(limit) {
  const rows = await Order.find({}).sort({ createdAt: -1 }).limit(limit).lean()
  return rows.map(publicOrder)
}

export async function updateOrderAdmin(number, patch) {
  const fields = {}
  if (patch.status !== undefined) fields.status = patch.status
  if (patch.read !== undefined) fields.read = patch.read

  const updated = await Order.findOneAndUpdate({ number: number.toUpperCase() }, { $set: fields }, { returnDocument: 'after' })
  if (!updated) throw new HttpError(404, 'الطلب غير موجود.')
  return publicOrder(updated)
}
