import { Product } from '../models/Product.js'
import { config } from '../config.js'
import { toMajor } from '../utils/money.js'
import { HttpError } from '../validate.js'

const publicShape = (p) => ({
  id: p._id,
  name: p.name,
  price: toMajor(p.priceMinor),
  currency: config.currency,
  stock: p.stock,
})

const adminShape = (p) => ({
  id: p._id,
  name: p.name,
  price: toMajor(p.priceMinor),
  currency: config.currency,
  stock: p.stock,
  active: p.active,
})

/** الكتالوج العام — المنتجات المفعّلة فقط، هو ما تعرضه الواجهة للزوّار */
export async function listPublicProducts() {
  const rows = await Product.find({ active: true }).sort({ _id: 1 }).lean()
  return rows.map(publicShape)
}

/** كل المنتجات (مفعّلة وغير مفعّلة) — للوحة التحكم فقط */
export async function listAdminProducts() {
  const rows = await Product.find({}).sort({ _id: 1 }).lean()
  return rows.map(adminShape)
}

export async function updateProduct(id, patch) {
  const fields = {}
  if (patch.name !== undefined) fields.name = patch.name
  if (patch.priceMinor !== undefined) fields.priceMinor = patch.priceMinor
  if (patch.stock !== undefined) fields.stock = patch.stock
  if (patch.active !== undefined) fields.active = patch.active

  const updated = await Product.findByIdAndUpdate(id, { $set: fields }, { returnDocument: 'after' })
  if (!updated) throw new HttpError(404, 'المنتج غير موجود.')
  return adminShape(updated)
}
