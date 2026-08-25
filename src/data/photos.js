/**
 * سجل الصور الحقيقية.
  * كل سطر بالأسفل = مكان واحد في الموقع (منتج، صفحة، أو مشهد).
 *
 * كيف تضيف أو تغيّر صورة:
 *   1. ضع ملف الصورة داخل  public/photos/  باستخدام "اسم الملف" المكتوب بالضبط
 *      (نفس الحروف الكبيرة/الصغيرة ونفس الامتداد .jpg أو .jpeg).
 *   2. غيّر active من false إلى true في نفس السطر.
 * أي عنصر active: false يُعرض كرسم SVG بديل تلقائياً بدل الصورة الحقيقية.
 */

const ENTRIES = [
  // ---- المنتجات (تظهر في: بطاقة المنتج، السلة، صفحة المنتج) ----
  { product: 'جهاز Oxygen Boost', file: 'device.jpg', active: true },
  { product: 'عبوة ٣٠ لصقة بديلة', file: 'pads-30.jpg', active: true },
  { product: 'عبوة ٦٠ لصقة بديلة', file: 'pads-60.jpg', active: true },
  { product: 'عبوة ٩٠ لصقة بديلة', file: 'pads-90.jpg', active: true },
  { product: 'باقة: الجهاز فقط', file: 'bundle-device.jpg', active: false },
  { product: 'باقة: الجهاز + ٣٠ لصقة', file: 'bundle-30.jpg', active: true },
  { product: 'باقة: الجهاز + ٦٠ لصقة', file: 'bundle-60.jpg', active: true },
  { product: 'باقة: الجهاز + ٩٠ لصقة', file: 'bundle-90.jpg', active: true },

  // ---- صفحات ثابتة ----
  { product: 'الصفحة الرئيسية (صورة الواجهة)', file: 'hero.jpg', active: true },
  { product: 'صفحة "من نحن"', file: 'interface.jpeg', active: false },

  // ---- معرض صفحة المنتج (صور إضافية بزوايا مختلفة، اختيارية) ----
  { product: 'معرض الجهاز — صورة ١', file: 'device-1.jpg', active: false },
  { product: 'معرض الجهاز — صورة ٢', file: 'device-2.jpg', active: false },
  { product: 'معرض الجهاز — صورة ٣', file: 'device-3.jpg', active: false },
  { product: 'معرض عبوة ٣٠ لصقة — صورة ١', file: 'pads-30-1.jpg', active: false },
  { product: 'معرض عبوة ٣٠ لصقة — صورة ٢', file: 'pads-30-2.jpg', active: false },

  // ---- مشاهد "لمن يناسب" (الصفحة الرئيسية) ----
  { product: 'مشهد: الرياضة', file: 'use-sport.jpg', active: false },
  { product: 'مشهد: النوم', file: 'use-sleep.jpg', active: false },
  { product: 'مشهد: الجري', file: 'use-run.jpg', active: false },
  { product: 'مشهد: السفر', file: 'use-travel.jpg', active: false },
]

// ملاحظة: صور الباقات الثلاث أعلاه (bundle-30/60/90) تُظهر كمية لصقات لا تطابق
// اسم الباقة بدقة (٤٠، ٧٠، ١٣٠ بدل ٣٠، ٦٠، ٩٠) — فعّالة رغم ذلك بناءً على طلبك.

export const PHOTOS = new Set(ENTRIES.filter((e) => e.active).map((e) => e.file))

/** يُرجع مسار الصورة إن كانت مسجّلة وفعّالة، وإلا undefined */
export const photoSrc = (file) => (file && PHOTOS.has(file) ? `/photos/${file}` : undefined)
