/**
 * إعدادات المتجر — مستند واحد فقط بمعرّف ثابت (singleton).
 */
import { Schema, model } from 'mongoose'

const settingsSchema = new Schema(
  {
    _id: { type: String, default: 'store' },
    deliveryFeeMinor: { type: Number, required: true, min: 0 },
    freeDeliveryOverMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
  },
  { versionKey: false }
)

export const Settings = model('Settings', settingsSchema)
