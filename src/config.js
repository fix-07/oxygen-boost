/**
 * إعدادات المتجر — عدّل هذا الملف فقط لتغيير أرقام التواصل والشحن والتتبّع.
 */

/** عنوان الخادم الخلفي (Express) — اضبط VITE_API_URL في بيئة الإنتاج */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
export const SITE = {
  name: 'Oxygen Boost',
  tagline: 'تجربة تنفّس أكثر راحة بتصميم عملي يناسب أسلوب حياتك.',
  url: 'https://oxygenboost.ly',

  // ⚠️ استبدل الرقم برقم واتساب الحقيقي (صيغة دولية بدون + وبدون أصفار بادئة)
  whatsapp: '21692252223',
  whatsappDisplay: '+216 92 252 223',
  instagram: 'oxy.genboost',
  instagramUrl: 'https://www.instagram.com/oxy.genboost?igsh=NDg5M25jYTlxd3dq&igsi=NDg5M25jYTlxd3dq',
  email: 'azizalisugh@gmail.com',

  currency: 'د.ل',
  deliveryFee: 10,
  freeDeliveryOver: 250,
  deliveryDays: 'من ٢ إلى ٥ أيام عمل حسب المدينة',

  // ضع المعرّفات هنا لتفعيل التتبّع (اتركها فارغة أثناء التطوير)
  analytics: {
    ga4: '', // مثال: 'G-XXXXXXXXXX'
    metaPixel: '', // مثال: '123456789012345'
  },

  // رابط فيديو الشرح (YouTube embed أو ملف mp4). اتركه فارغاً لعرض صورة الغلاف.
  howToVideo: '',
}

export const WHATSAPP_DEFAULT_MSG = 'السلام عليكم، أريد الاستفسار عن منتجات Oxygen Boost.'

export const waLink = (msg = WHATSAPP_DEFAULT_MSG) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`

export const money = (n) =>
  `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${SITE.currency}`

export const LIBYAN_CITIES = [
  'طرابلس',
  'بنغازي',
  'مصراتة',
  'الزاوية',
  'زليتن',
  'الخمس',
  'صبراتة',
  'صرمان',
  'ترهونة',
  'غريان',
  'سرت',
  'بني وليد',
  'زوارة',
  'العجيلات',
  'الجميل',
  'رقدالين',
  'نالوت',
  'يفرن',
  'جادو',
  'البيضاء',
  'المرج',
  'درنة',
  'طبرق',
  'شحات',
  'أجدابيا',
  'سبها',
  'براك الشاطئ',
  'أوباري',
  'مرزق',
  'الكفرة',
  'هون',
  'ودان',
  'الجفرة',
  'مدينة أخرى',
]
