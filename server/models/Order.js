/**
 * طلب — يضمّ أصناف الطلب مباشرة (مستند واحد) بدل جدول منفصل، لأن أصناف
 * الطلب لا تُقرأ أو تُعدَّل إلا مع الطلب نفسه. كل المبالغ بالوحدة الصغرى (× 100).
 */
import { Schema, model } from 'mongoose'

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPriceMinor: { type: Number, required: true, min: 0 },
    lineTotalMinor: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
)

export const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']

const orderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    subtotalMinor: { type: Number, required: true, min: 0 },
    discountMinor: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: null },
    deliveryMinor: { type: Number, required: true, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    customer: { type: customerSchema, required: true },
    payment: { type: String, default: 'الدفع عند الاستلام' },
    status: { type: String, enum: ORDER_STATUSES, default: 'new' },
    read: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: true } }
)

orderSchema.index({ createdAt: -1 })

export const Order = model('Order', orderSchema)
