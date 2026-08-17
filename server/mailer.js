/**
 * إشعار الطلبات عبر Gmail SMTP.
 * يتطلّب تفعيل التحقّق بخطوتين ثم إنشاء «كلمة مرور تطبيقات» — لا تستخدم كلمة مرور الحساب.
 */
import nodemailer from 'nodemailer'
import { config } from './config.js'

const enabled = Boolean(config.mail.user && config.mail.pass && config.mail.to)

if (!enabled) {
  console.warn('[mail] إعدادات Gmail ناقصة — سيتم تسجيل الطلبات دون إرسال بريد.')
}

const transporter = enabled
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: config.mail.user, pass: config.mail.pass },
    })
  : null

const money = (major) => `${Number(major).toFixed(2)} ${config.currency}`

/** تهريب HTML — بيانات العميل نص غير موثوق ولا يجوز حقنه في جسم الرسالة */
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )

/**
 * يُرسل بريد الطلب الجديد. لا يرمي أبداً: فشل البريد يجب ألا يُفشل طلباً مسجّلاً بالفعل.
 * order بالشكل العلني (وحدات كبرى) الذي يعيده orderService.
 */
export async function sendOrderEmail(order) {
  if (!transporter) return

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="border:1px solid #ddd">${esc(i.name)}</td><td style="border:1px solid #ddd">${i.qty}</td><td style="border:1px solid #ddd">${money(i.price * i.qty)}</td></tr>`
    )
    .join('')
  const itemsText = order.items.map((i) => `${i.name} × ${i.qty} — ${money(i.price * i.qty)}`).join('\n')

  const rows = [
    ['المجموع الفرعي', money(order.subtotal)],
    order.discount > 0 ? [`الخصم${order.coupon ? ` (${order.coupon})` : ''}`, `-${money(order.discount)}`] : null,
    ['التوصيل', order.delivery === 0 ? 'مجاني' : money(order.delivery)],
    ['الإجمالي', money(order.total)],
    ['طريقة الدفع', order.payment],
    ['العميل', order.customer.name],
    ['الهاتف', order.customer.phone],
    ['المدينة', order.customer.city],
    ['العنوان', order.customer.address],
    ['ملاحظات', order.customer.notes || '—'],
  ].filter(Boolean)

  try {
    await transporter.sendMail({
      from: `"Oxygen Boost" <${config.mail.from}>`,
      to: config.mail.to,
      replyTo: config.mail.to,
      subject: `طلب جديد ${order.number} — ${money(order.total)}`,
      text: `طلب جديد ${order.number}\n\nالمنتجات:\n${itemsText}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}`,
      html: `<div dir="rtl" style="font-family:system-ui,Segoe UI,Arial,sans-serif">
  <h2 style="margin:0 0 12px">طلب جديد — ${esc(order.number)}</h2>
  <table cellpadding="6" style="border-collapse:collapse;margin-bottom:12px">
    <tr><th style="border:1px solid #ddd;background:#fafafa">المنتج</th><th style="border:1px solid #ddd;background:#fafafa">الكمية</th><th style="border:1px solid #ddd;background:#fafafa">السعر</th></tr>
    ${itemsHtml}
  </table>
  <table cellpadding="6" style="border-collapse:collapse">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd;background:#fafafa"><b>${esc(k)}</b></td>` +
          `<td style="border:1px solid #ddd">${esc(v)}</td></tr>`
      )
      .join('')}
  </table>
</div>`,
    })
  } catch (err) {
    console.error(`[mail] تعذّر إرسال بريد الطلب ${order.number}:`, err.message)
  }
}
