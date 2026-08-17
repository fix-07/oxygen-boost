/** تحويل بين الوحدة الصغرى (المخزَّنة) والوحدة الكبرى (المعروضة)، لتفادي أخطاء الفاصلة العائمة */
export const toMajor = (minor) => minor / 100
export const toMinor = (major) => Math.round(major * 100)
