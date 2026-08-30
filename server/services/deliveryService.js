import { DeliveryZone } from '../models/DeliveryZone.js'
import { toMajor, toMinor } from '../utils/money.js'
import { HttpError } from '../validate.js'

const shape = (z) => ({ location: z.location, region: z.region, price: toMajor(z.feeMinor), order: z.order })

export async function listDeliveryZones() {
  const rows = await DeliveryZone.find({}).sort({ order: 1, location: 1 }).lean()
  return rows.map(shape)
}

/** يبحث عن سعر التوصيل الخاص بموقع بعينه — مطابقة تامة لاسم الموقع كما يُخزَّن. لا يوجد سعر مطابق يعني الرجوع لسعر التوصيل الافتراضي في الإعدادات */
export async function findZoneFeeMinor(location) {
  if (!location) return null
  const zone = await DeliveryZone.findOne({ location }).lean()
  return zone ? zone.feeMinor : null
}

export async function upsertDeliveryZone({ location, region, price, order }) {
  const updated = await DeliveryZone.findOneAndUpdate(
    { location },
    { $set: { region: region ?? '', feeMinor: toMinor(price), order: order ?? 0 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )
  return shape(updated)
}

export async function deleteDeliveryZone(location) {
  const result = await DeliveryZone.deleteOne({ location })
  if (result.deletedCount === 0) throw new HttpError(404, 'منطقة التوصيل غير موجودة.')
}
