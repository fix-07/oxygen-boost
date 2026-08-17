import { Settings } from '../models/Settings.js'
import { toMajor, toMinor } from '../utils/money.js'
import { HttpError } from '../validate.js'

const shape = (s) => ({
  deliveryFee: toMajor(s.deliveryFeeMinor),
  freeDeliveryOver: toMajor(s.freeDeliveryOverMinor),
  currency: s.currency,
})

export async function getSettings() {
  const doc = await Settings.findById('store').lean()
  if (!doc) throw new HttpError(500, 'إعدادات المتجر غير مهيّأة.')
  return doc
}

export async function getPublicSettings() {
  return shape(await getSettings())
}

export async function updateSettings(patch) {
  const fields = {}
  if (patch.deliveryFee !== undefined) fields.deliveryFeeMinor = toMinor(patch.deliveryFee)
  if (patch.freeDeliveryOver !== undefined) fields.freeDeliveryOverMinor = toMinor(patch.freeDeliveryOver)

  const updated = await Settings.findByIdAndUpdate('store', { $set: fields }, { returnDocument: 'after' })
  if (!updated) throw new HttpError(500, 'إعدادات المتجر غير مهيّأة.')
  return shape(updated)
}
