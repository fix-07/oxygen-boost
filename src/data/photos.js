/**
 * سجل الصور الحقيقية.
 *
 * كيف تستبدل الرسوم بصور فوتوغرافية:
 *   1. ضع الصورة داخل  public/photos/  بالاسم المذكور أدناه.
 *   2. أزل علامة التعليق (//) عن السطر المقابل.
 * أي اسم غير مذكور هنا يُعرض كرسم SVG تلقائياً — بدون أي طلب شبكة زائد.
 */
export const PHOTOS = new Set([
  // ---- الرئيسية والمنتجات ----
  // 'hero.jpg',            صورة الواجهة الرئيسية
  // 'about.jpg',           صورة صفحة من نحن
  // 'device.jpg',          صورة الجهاز في بطاقات المنتج
  // 'pads-30.jpg',
  // 'pads-60.jpg',
  // 'pads-90.jpg',
  // 'bundle-60.jpg',

  // ---- معرض صفحة المنتج (زوايا متعددة) ----
  // 'device-1.jpg', 'device-2.jpg', 'device-3.jpg',
  // 'pads-30-1.jpg', 'pads-30-2.jpg',

  // ---- مشاهد "لمن يناسب" ----
  // 'use-sport.jpg',
  // 'use-sleep.jpg',
  // 'use-run.jpg',
  // 'use-travel.jpg',
])

/** يُرجع مسار الصورة إن كانت مسجّلة، وإلا undefined */
export const photoSrc = (file) => (file && PHOTOS.has(file) ? `/photos/${file}` : undefined)
