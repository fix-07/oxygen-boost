import { Coupon } from '../models/Coupon.js'
import { toMinor } from '../utils/money.js'
import { HttpError } from '../validate.js'

const shape = (c) => ({ code: c.code, type: c.type, value: c.value, note: c.note, active: c.active })

/**
 * يحسب مبلغ الخصم بالوحدة الصغرى وما إذا كان الكوبون يمنح توصيلاً مجانياً.
 * value للنوع «fixed» يُدخله المشرف بالوحدة الكبرى (كما في نموذج اللوحة) فيُحوَّل هنا.
 */
export function computeDiscount(coupon, subtotalMinor) {
  if (!coupon) return { discountMinor: 0, freeShipping: false }
  if (coupon.type === 'percent') {
    return { discountMinor: Math.round((subtotalMinor * coupon.value) / 100), freeShipping: false }
  }
  if (coupon.type === 'fixed') {
    return { discountMinor: Math.min(subtotalMinor, toMinor(coupon.value)), freeShipping: false }
  }
  if (coupon.type === 'shipping') {
    return { discountMinor: 0, freeShipping: true }
  }
  return { discountMinor: 0, freeShipping: false }
}

export async function findActiveCoupon(code) {
  if (!code) return null
  return Coupon.findOne({ code: code.toUpperCase(), active: true })
}

/**
 * معاينة كوبون قبل إتمام الطلب — لا تكشف قائمة الأكواد، فقط تتحقق من كود بعينه.
 * تُعيد النوع والقيمة (لا مبلغ خصم جاهز) لأن الواجهة تعيد حساب الخصم محلياً كلما
 * تغيّرت السلة؛ الحساب النهائي المعتمد يبقى دائماً داخل createOrder.
 */
export async function previewCoupon(code) {
  const coupon = await findActiveCoupon(code)
  if (!coupon) return { ok: false, message: 'كود الخصم غير صحيح أو منتهي الصلاحية.' }
  return {
    ok: true,
    message: `تم تفعيل الكود ${coupon.code} — ${coupon.note}`,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
  }
}

export async function listCoupons() {
  const rows = await Coupon.find({}).sort({ code: 1 }).lean()
  return rows.map(shape)
}

export async function upsertCoupon({ code, type, value, note, active }) {
  const updated = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $set: { type, value, note: note ?? '', active: active ?? true } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )
  return shape(updated)
}

export async function deleteCoupon(code) {
  const result = await Coupon.deleteOne({ code: code.toUpperCase() })
  if (result.deletedCount === 0) throw new HttpError(404, 'كود الخصم غير موجود.')
}
