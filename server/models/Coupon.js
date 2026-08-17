import { Schema, model } from 'mongoose'

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed', 'shipping'], required: true },
    value: { type: Number, default: 0, min: 0 },
    note: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
)

export const Coupon = model('Coupon', couponSchema)
