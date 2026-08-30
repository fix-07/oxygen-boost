/**
 * اتصال MongoDB (Mongoose) + بذر البيانات الأولية.
 * البذر غير هدّام: يُدرج فقط ما هو مفقود، ولا يدهس أي سعر أو كوداً عدّله المشرف لاحقاً.
 */
import { setServers } from 'node:dns'
import mongoose from 'mongoose'
import { config } from './config.js'
import { Product } from './models/Product.js'
import { Coupon } from './models/Coupon.js'
import { Settings } from './models/Settings.js'
import { DeliveryZone } from './models/DeliveryZone.js'

mongoose.set('strictQuery', true)

/**
 * mongodb+srv:// يتطلّب استعلام DNS من نوع SRV. على بعض الشبكات (خصوصاً عبر
 * راوترات منزلية أو مزوّدي إنترنت معيّنين على ويندوز) يفشل محلّل Node.js
 * المدمج في هذا الاستعلام تحديداً حتى لو كانت بقية الشبكة تعمل بشكل طبيعي.
 * نوجّه استعلامات DNS الخاصة بـ Node فقط (لا إعدادات النظام) إلى خوادم عامة
 * موثوقة لتفادي هذه المشكلة.
 */
if (config.mongodbUri.startsWith('mongodb+srv://')) {
  setServers(['8.8.8.8', '1.1.1.1'])
}

export async function connectDb() {
  mongoose.connection.on('error', (err) => console.error('[db] خطأ في اتصال MongoDB:', err.message))
  await mongoose.connect(config.mongodbUri)
  console.log('[db] مُتّصل بـ MongoDB')
  await seed()
}

export async function disconnectDb() {
  await mongoose.disconnect()
}

/* الكتالوج الأولي — نفس أسعار seed المستخدمة سابقاً في SQLite */
const PRODUCT_SEED = [
  { _id: 'device', name: 'جهاز Oxygen Boost', priceMinor: 14900, stock: 60 },
  { _id: 'pads-30', name: 'عبوة ٣٠ لصقة بديلة', priceMinor: 4500, stock: 120 },
  { _id: 'pads-60', name: 'عبوة ٦٠ لصقة بديلة', priceMinor: 7900, stock: 90 },
  { _id: 'pads-90', name: 'عبوة ٩٠ لصقة بديلة', priceMinor: 10500, stock: 70 },
  { _id: 'bundle-device', name: 'الجهاز فقط', priceMinor: 14900, stock: 60 },
  { _id: 'bundle-30', name: 'الجهاز + ٣٠ لصقة', priceMinor: 17900, stock: 50 },
  { _id: 'bundle-60', name: 'الجهاز + ٦٠ لصقة', priceMinor: 20500, stock: 45 },
  { _id: 'bundle-90', name: 'الجهاز + ٩٠ لصقة', priceMinor: 22500, stock: 40 },
]

const COUPON_SEED = [
  { code: 'OXY10', type: 'percent', value: 10, note: 'خصم ترحيبي ١٠٪', active: true },
  { code: 'FREESHIP', type: 'shipping', value: 0, note: 'توصيل مجاني', active: true },
]

/**
 * مناطق التوصيل الأولية — منقولة من منشور أسعار شركة التوصيل. عدّل الأسعار أو
 * أضف/احذف مناطق من لوحة التحكم (/admin) بدل تعديل هذا الملف بعد أول تشغيل.
 */
const zoneGroup = (region, price, locations) =>
  locations.map((location, i) => ({ location, region, feeMinor: price * 100, order: i }))

const DELIVERY_ZONE_SEED = [
  ...zoneGroup('غدامس', 40, ['غدامس', 'سيناون', 'الشعواء', 'أولاد']),

  ...zoneGroup('الجبل الغربي', 25, ['غريان']),
  ...zoneGroup('الجبل الغربي', 35, [
    'الأصابعة',
    'الرابطة',
    'القواليش',
    'القلعة',
    'الرجبان',
    'الزنتان',
    'الرقيبات',
    'جادو',
    'كاباو',
    'تيجي',
    'بدر',
    'الجوش',
  ]),

  ...zoneGroup('المنطقة الوسطى', 30, [
    'سرت',
    'هراوة',
    'بن جواد',
    'الرميلة',
    'رأس لانوف',
    'البريقة',
    'العقيلة',
    'هون',
    'سوكنة',
    'ودان',
    'الجفرة',
  ]),
  ...zoneGroup('المنطقة الوسطى', 40, ['زلة']),

  ...zoneGroup('المنطقة الشرقية', 25, ['بنغازي', 'اجدابيا']),
  ...zoneGroup('المنطقة الشرقية', 35, ['توكرة', 'المرج', 'البيضاء', 'سلوق', 'شحات', 'سوسة', 'القبة', 'طبرق']),
  ...zoneGroup('المنطقة الشرقية', 40, ['درنة']),
  ...zoneGroup('المنطقة الشرقية', 50, ['امساعد']),

  ...zoneGroup('جنوب طرابلس', 25, ['ترهونة', 'بني وليد']),
  ...zoneGroup('جنوب طرابلس', 20, ['وادي ربيع', 'قصر بن غشير', 'السبيعة', 'سوق الخميس', 'مسجحل', 'سيدي السايح']),

  ...zoneGroup('طرابلس', 10, ['داخل طرابلس']),
  ...zoneGroup('طرابلس', 15, ['كرنمية', 'طريق مطار', 'عين زارة', 'خلة', 'مشروع ضاحية كرنمية']),

  ...zoneGroup('شرق طرابلس', 20, ['قماطة', 'قرة بولي', 'قصر الأخيار', 'زليتن', 'مصراتة', 'مسلاتة']),

  ...zoneGroup('الجنوب الشرقي', 45, ['جالو', 'أوجلة', 'الواحات', 'الكفرة']),

  ...zoneGroup('المنطقة الجنوبية', 30, ['سبها', 'مزدة', 'الشويرف', 'القريات']),
  ...zoneGroup('المنطقة الجنوبية', 35, ['براك الشاطئ']),
  ...zoneGroup('المنطقة الجنوبية', 45, ['أوباري', 'أم الأرانب', 'مرزق', 'تراغن', 'القطرون']),
  ...zoneGroup('المنطقة الجنوبية', 50, ['غات']),

  ...zoneGroup('غرب طرابلس', 20, ['الماية', 'الزاوية', 'المعمر', 'صرمان', 'صرفانة']),
  ...zoneGroup('غرب طرابلس', 30, ['زوارة', 'العجيلات', 'الجميل', 'رقدالين', 'زلطن']),
  ...zoneGroup('غرب طرابلس', 40, ['رأس جدير']),
].map((zone, i) => ({ ...zone, order: i }))

async function seed() {
  await Promise.all(
    PRODUCT_SEED.map((p) =>
      Product.updateOne({ _id: p._id }, { $setOnInsert: p }, { upsert: true })
    )
  )
  await Promise.all(
    COUPON_SEED.map((c) =>
      Coupon.updateOne({ code: c.code }, { $setOnInsert: c }, { upsert: true })
    )
  )
  await Settings.updateOne(
    { _id: 'store' },
    {
      $setOnInsert: {
        deliveryFeeMinor: config.deliveryFeeMinor,
        freeDeliveryOverMinor: config.freeDeliveryOverMinor,
        currency: config.currency,
      },
    },
    { upsert: true }
  )
  await Promise.all(
    DELIVERY_ZONE_SEED.map((z) =>
      DeliveryZone.updateOne({ location: z.location }, { $setOnInsert: z }, { upsert: true })
    )
  )
}
