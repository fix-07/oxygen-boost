/**
 * إنشاء أو تحديث حساب المشرف.
 * الاستخدام: ضع ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env ثم شغّل: npm run seed:admin
 * كلمة المرور تُقرأ من البيئة ولا تُمرَّر في سطر الأوامر حتى لا تُسجَّل في سجلّ الأوامر.
 */
import { hashPassword } from './auth.js'
import { connectDb, disconnectDb } from './db.js'
import { User } from './models/User.js'

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''

if (!email || !password) {
  console.error('ضع ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env أولاً.')
  process.exit(1)
}
if (password.length < 12) {
  console.error('كلمة مرور المشرف يجب أن تكون 12 حرفاً على الأقل.')
  process.exit(1)
}

await connectDb()

await User.updateOne(
  { email },
  { $set: { email, passwordHash: hashPassword(password), role: 'admin' } },
  { upsert: true }
)

console.log(`تم ضبط حساب المشرف: ${email}`)
await disconnectDb()
