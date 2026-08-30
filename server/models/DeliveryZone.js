/**
 * مناطق التوصيل وأسعارها — تُدار من لوحة التحكم. اسم الموقع هو المفتاح الذي
 * يرسله العميل ضمن بيانات الطلب؛ السعر الفعلي يُقرأ من هنا فقط عند إنشاء الطلب.
 */
import { Schema, model } from 'mongoose'

const deliveryZoneSchema = new Schema(
  {
    location: { type: String, required: true, unique: true, trim: true },
    region: { type: String, default: '', trim: true },
    feeMinor: { type: Number, required: true, min: 0 },
    order: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true }
)

export const DeliveryZone = model('DeliveryZone', deliveryZoneSchema)
