/**
 * إشعار الطلبات عبر Resend (HTTPS API).
 * لماذا ليس Gmail SMTP: استضافات مثل Render المجانية تحجب منافذ SMTP الصادرة (25، 465، 587)
 * لمنع إساءة الاستخدام، فيفشل الاتصال دوماً بغضّ النظر عن صحة البيانات. HTTPS (443) لا يُحجب أبداً.
 * أنشئ مفتاحاً مجانياً من https://resend.com/api-keys وضعه في RESEND_API_KEY.
 */
import { config } from './config.js'

const enabled = Boolean(config.mail.apiKey && config.mail.to)

if (!enabled) {
  console.warn('[mail] إعدادات Resend ناقصة — سيتم تسجيل الطلبات دون إرسال بريد.')
}

const money = (major) => `${Number(major).toFixed(2)} ${config.currency}`

/** تهريب HTML — بيانات العميل نص غير موثوق ولا يجوز حقنه في جسم الرسالة */
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )

/** إرسال فعلي عبر واجهة Resend البرمجية — لا يرمي أبداً، يُسجّل الفشل فقط */
async function sendMail({ to, subject, text, html, replyTo }, errorLabel) {
  if (!enabled) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.mail.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Oxygen Boost <${config.mail.from}>`,
        to,
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`)
    }
  } catch (err) {
    console.error(`[mail] ${errorLabel}:`, err.message)
  }
}

/**
 * يُرسل بريد الطلب الجديد. لا يرمي أبداً: فشل البريد يجب ألا يُفشل طلباً مسجّلاً بالفعل.
 * order بالشكل العلني (وحدات كبرى) الذي يعيده orderService.
 */
export async function sendOrderEmail(order) {
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

  await sendMail(
    {
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
    },
    `تعذّر إرسال بريد الطلب ${order.number}`
  )
}

/** إشعار أمني — يُرسَل لصاحب الحساب نفسه بعد كل تغيير لكلمة مروره */
export async function sendPasswordChangedEmail(toEmail) {
  const when = new Date().toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' })
  await sendMail(
    {
      to: toEmail,
      subject: 'تم تغيير كلمة مرور حساب المشرف',
      text: `تم تغيير كلمة مرور حساب المشرف (${toEmail}) بتاريخ ${when}.\n\nإن لم تكن أنت من قام بهذا التغيير، تواصل فوراً مع مسؤول النظام.`,
      html: `<div dir="rtl" style="font-family:system-ui,Segoe UI,Arial,sans-serif">
  <h2 style="margin:0 0 12px">تم تغيير كلمة المرور</h2>
  <p>تم تغيير كلمة مرور حساب المشرف <b>${esc(toEmail)}</b> بتاريخ ${esc(when)}.</p>
  <p style="color:#888">إن لم تكن أنت من قام بهذا التغيير، غيّر كلمة المرور فوراً وتحقّق من أمان حسابك.</p>
</div>`,
    },
    'تعذّر إرسال إشعار تغيير كلمة المرور'
  )
}

/** إشعار أمني مزدوج — يُرسَل للبريد القديم (تنبيه) وللبريد الجديد (تأكيد) بعد تغيير بريد الحساب */
export async function sendEmailChangedNotice(oldEmail, newEmail) {
  const when = new Date().toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' })
  await Promise.all([
    sendMail(
      {
        to: oldEmail,
        subject: 'تم تغيير البريد الإلكتروني لحساب المشرف',
        text: `تم تغيير بريد حساب المشرف من ${oldEmail} إلى ${newEmail} بتاريخ ${when}.\n\nإن لم تكن أنت من قام بهذا التغيير، تواصل فوراً مع مسؤول النظام.`,
        html: `<div dir="rtl" style="font-family:system-ui,Segoe UI,Arial,sans-serif">
  <h2 style="margin:0 0 12px">تم تغيير البريد الإلكتروني</h2>
  <p>تم تغيير بريد حساب المشرف من <b>${esc(oldEmail)}</b> إلى <b>${esc(newEmail)}</b> بتاريخ ${esc(when)}.</p>
  <p style="color:#888">إن لم تكن أنت من قام بهذا التغيير، تواصل فوراً مع مسؤول النظام.</p>
</div>`,
      },
      'تعذّر إرسال إشعار تغيير البريد (القديم)'
    ),
    sendMail(
      {
        to: newEmail,
        subject: 'تأكيد: هذا بريد حساب المشرف الآن',
        text: `تم تعيين هذا البريد (${newEmail}) بريداً لتسجيل دخول المشرف بدلاً من ${oldEmail} بتاريخ ${when}.`,
        html: `<div dir="rtl" style="font-family:system-ui,Segoe UI,Arial,sans-serif">
  <h2 style="margin:0 0 12px">تأكيد تغيير البريد الإلكتروني</h2>
  <p>تم تعيين <b>${esc(newEmail)}</b> بريداً لتسجيل دخول حساب المشرف بدلاً من ${esc(oldEmail)} بتاريخ ${esc(when)}.</p>
</div>`,
      },
      'تعذّر إرسال إشعار تغيير البريد (الجديد)'
    ),
  ])
}
