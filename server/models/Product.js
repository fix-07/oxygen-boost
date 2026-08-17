/**
 * منتج — المعرّف (_id) نص ثابت (slug) يطابق أسماء المنتجات في src/data/products.js
 * حتى لا يتغيّر أي رابط أو مرجع في الواجهة. السعر بالوحدة الصغرى (× 100).
 */
import { Schema, model } from 'mongoose'

const productSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    priceMinor: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { versionKey: false, timestamps: true }
)

export const Product = model('Product', productSchema)
