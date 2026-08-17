/**
 * مستخدم — يُستخدم حالياً لحسابات المشرف فقط عبر seed-admin.js.
 */
import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
)

export const User = model('User', userSchema)
