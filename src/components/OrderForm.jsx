import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { Qty } from './ui'
import { useStore } from '../store/StoreContext'
import { OTHER_CITY, SITE, money } from '../config'
import { ApiError } from '../services/api'
import { track } from '../analytics'

/** يبني نص رسالة واتساب لتفاصيل الطلب */
export function buildWhatsAppMessage(order) {
  const lines = order.items.map((i) => `• ${i.name} × ${i.qty} — ${money(i.price * i.qty)}`).join('\n')
  return [
    `طلب جديد من موقع ${SITE.name}`,
    `رقم الطلب: ${order.number}`,
    '',
    'المنتجات:',
    lines,
    '',
    `المجموع الفرعي: ${money(order.subtotal)}`,
    order.discount ? `الخصم${order.coupon ? ` (${order.coupon})` : ''}: -${money(order.discount)}` : null,
    `التوصيل: ${order.delivery === 0 ? 'مجاني' : money(order.delivery)}`,
    `الإجمالي: ${money(order.total)}`,
    `طريقة الدفع: ${order.payment}`,
    '',
    'بيانات العميل:',
    `الاسم: ${order.customer.name}`,
    `الهاتف: ${order.customer.phone}`,
    `المدينة: ${order.customer.city}`,
    `العنوان: ${order.customer.address}`,
    order.customer.notes ? `ملاحظات: ${order.customer.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

const validate = (v) => {
  const e = {}
  if (!v.name || v.name.trim().length < 3) e.name = 'يرجى كتابة الاسم الكامل.'
  const digits = (v.phone || '').replace(/\D/g, '')
  if (digits.length < 9) e.phone = 'يرجى إدخال رقم هاتف صحيح.'
  if (!v.city) e.city = 'يرجى اختيار المدينة.'
  if (!v.address || v.address.trim().length < 6) e.address = 'يرجى كتابة العنوان أو المنطقة بشكل واضح.'
  return e
}

/**
 * نموذج الطلب — يعمل بوضعين:
 * quick: اختيار منتج واحد مباشرة من الصفحة الرئيسية.
 * checkout: يستخدم محتويات السلة.
 */
export default function OrderForm({ mode = 'quick' }) {
  const navigate = useNavigate()
  const {
    items,
    cartLines,
    totals,
    settings,
    deliveryZones,
    deliveryFeeFor,
    createOrder,
    clearCart,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
  } = useStore()

  const [picked, setPicked] = useState('bundle-60')
  const [qty, setQty] = useState(1)
  const [values, setValues] = useState({ name: '', phone: '', city: '', address: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg] = useState(null)
  const [couponBusy, setCouponBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const available = useMemo(() => items.filter((p) => p.stock > 0), [items])
  const pickedItem = useMemo(() => available.find((p) => p.id === picked) || available[0], [available, picked])

  /* أسطر الطلب حسب الوضع */
  const lines = useMemo(() => {
    if (mode === 'checkout') return cartLines
    return pickedItem ? [{ id: pickedItem.id, qty, product: pickedItem, lineTotal: pickedItem.price * qty }] : []
  }, [mode, cartLines, pickedItem, qty])

  /* تجميع مناطق التوصيل حسب المنطقة لعرضها في القائمة المنسدلة بترتيب المصدر */
  const zoneGroups = useMemo(() => {
    const groups = new Map()
    for (const z of deliveryZones) {
      if (!groups.has(z.region)) groups.set(z.region, [])
      groups.get(z.region).push(z)
    }
    return [...groups.entries()]
  }, [deliveryZones])

  /* المبالغ — المجموع الفرعي والخصم من الخادم في وضع السلة، والتوصيل يُحسب دائماً
     محلياً حسب المدينة المختارة للعرض الفوري (تقدير فقط، الخادم يعيد حسابه عند التأكيد) */
  const amounts = useMemo(() => {
    const subtotal = mode === 'checkout' ? totals.subtotal : lines.reduce((n, l) => n + l.lineTotal, 0)
    const discount = mode === 'checkout' ? totals.discount : 0
    const couponFreeShipping = mode === 'checkout' && appliedCoupon?.type === 'shipping'

    const afterDiscount = Math.max(0, subtotal - discount)
    const qualifiesFree = settings.freeDeliveryOver > 0 && afterDiscount >= settings.freeDeliveryOver
    const freeShipping = couponFreeShipping || qualifiesFree
    const delivery = subtotal === 0 || freeShipping ? 0 : deliveryFeeFor(values.city)

    return { subtotal, discount, delivery, freeShipping, total: afterDiscount + delivery }
  }, [mode, totals, lines, settings, deliveryFeeFor, values.city, appliedCoupon])

  const set = (key) => (e) => {
    const v = e.target.value
    setValues((prev) => ({ ...prev, [key]: v }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onCoupon = async () => {
    if (!couponInput.trim()) {
      clearCoupon()
      setCouponMsg(null)
      return
    }
    setCouponBusy(true)
    const res = await applyCoupon(couponInput)
    setCouponMsg(res)
    setCouponBusy(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.querySelector('.input--err, .select--err')?.focus()
      return
    }
    if (!lines.length) return

    setBusy(true)
    setSubmitError('')
    try {
      const order = await createOrder(
        {
          name: values.name.trim(),
          phone: values.phone.trim(),
          city: values.city,
          address: values.address.trim(),
          notes: values.notes.trim(),
        },
        lines
      )

      track('Purchase', { value: amounts.total, currency: 'LYD', num_items: lines.length })
      if (mode === 'checkout') clearCart()
      navigate(`/order/${order.number}`, { state: { order } })
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'تعذّر إرسال الطلب. حاول مرة أخرى.')
      setBusy(false)
    }
  }

  return (
    <form className="order-wrap" onSubmit={submit} noValidate>
      <div className="panel">
        <h3 style={{ marginBottom: 18 }}>بيانات الطلب</h3>

        {mode === 'quick' && (
          <>
            <label className="field">
              <span>
                المنتج أو الباقة <i className="req">*</i>
              </span>
              <select className="select" value={pickedItem?.id || ''} onChange={(e) => setPicked(e.target.value)}>
                <optgroup label="الباقات">
                  {available
                    .filter((p) => p.type === 'bundle')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {money(p.price)}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="المنتجات">
                  {available
                    .filter((p) => p.type !== 'bundle')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {money(p.price)}
                      </option>
                    ))}
                </optgroup>
              </select>
            </label>

            <div className="field">
              <span>الكمية</span>
              <Qty value={qty} onChange={setQty} large />
            </div>
          </>
        )}

        <div className="form-row">
          <label className="field">
            <span>
              الاسم الكامل <i className="req">*</i>
            </span>
            <input
              className={`input ${errors.name ? 'input--err' : ''}`}
              value={values.name}
              onChange={set('name')}
              placeholder="مثال: محمد علي"
              autoComplete="name"
            />
            {errors.name && <em className="field-error">{errors.name}</em>}
          </label>

          <label className="field">
            <span>
              رقم الهاتف <i className="req">*</i>
            </span>
            <input
              className={`input ${errors.phone ? 'input--err' : ''}`}
              value={values.phone}
              onChange={set('phone')}
              placeholder="09XXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              style={{ textAlign: 'right' }}
            />
            {errors.phone && <em className="field-error">{errors.phone}</em>}
          </label>
        </div>

        <label className="field">
          <span>
            المدينة <i className="req">*</i>
          </span>
          <select
            className={`select ${errors.city ? 'select--err' : ''}`}
            value={values.city}
            onChange={set('city')}
          >
            <option value="">اختر مدينتك أو منطقتك</option>
            {zoneGroups.map(([region, zones]) => (
              <optgroup key={region || 'عام'} label={region || 'عام'}>
                {zones.map((z) => (
                  <option key={z.location} value={z.location}>
                    {z.location} — {money(z.price)}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER_CITY}>{OTHER_CITY} — {money(settings.deliveryFee)}</option>
          </select>
          {errors.city && <em className="field-error">{errors.city}</em>}
        </label>

        <label className="field">
          <span>
            العنوان التفصيلي أو المنطقة <i className="req">*</i>
          </span>
          <input
            className={`input ${errors.address ? 'input--err' : ''}`}
            value={values.address}
            onChange={set('address')}
            placeholder="اسم المنطقة، أقرب علامة مميزة"
            autoComplete="street-address"
          />
          {errors.address && <em className="field-error">{errors.address}</em>}
        </label>

        <label className="field">
          <span>ملاحظات (اختياري)</span>
          <textarea
            className="textarea"
            value={values.notes}
            onChange={set('notes')}
            placeholder="أي تفاصيل تساعدنا في التوصيل"
          />
        </label>
      </div>

      {/* ملخّص الطلب */}
      <aside className="panel panel--glow summary">
        <h3 style={{ marginBottom: 16 }}>ملخّص الطلب</h3>

        <div style={{ marginBottom: 16 }}>
          {lines.length === 0 ? (
            <p className="small muted">لم تختر أي منتج بعد.</p>
          ) : (
            lines.map((l) => (
              <div className="summary__line" key={l.id}>
                <span>
                  {l.product.name} × {l.qty}
                </span>
                <strong>{money(l.lineTotal)}</strong>
              </div>
            ))
          )}
        </div>

        {mode === 'checkout' && (
          <div style={{ marginBottom: 16 }}>
            <div className="coupon-row">
              <input
                className="input"
                placeholder="كود الخصم"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
              <button type="button" className="btn btn--ghost btn--sm" onClick={onCoupon} disabled={couponBusy}>
                {couponBusy ? '...' : 'تفعيل'}
              </button>
            </div>
            {couponMsg && (
              <em
                className="field-error"
                style={{ color: couponMsg.ok ? 'var(--ok)' : 'var(--danger)' }}
              >
                {couponMsg.message}
              </em>
            )}
          </div>
        )}

        <hr className="divider" />

        <div className="summary__line" style={{ marginTop: 10 }}>
          <span>المجموع الفرعي</span>
          <strong>{money(amounts.subtotal)}</strong>
        </div>
        {amounts.discount > 0 && (
          <div className="summary__line">
            <span>الخصم{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
            <strong style={{ color: 'var(--ok)' }}>−{money(amounts.discount)}</strong>
          </div>
        )}
        <div className="summary__line">
          <span>تكلفة التوصيل</span>
          <strong>{amounts.delivery === 0 ? 'مجاني' : money(amounts.delivery)}</strong>
        </div>
        <div className="summary__line summary__total">
          <span>الإجمالي</span>
          <span className="price">{money(amounts.total)}</span>
        </div>

        {settings.freeDeliveryOver > 0 && amounts.subtotal > 0 && amounts.delivery > 0 && (
          <p className="small" style={{ marginTop: 10 }}>
            أضف بقيمة {money(settings.freeDeliveryOver - amounts.subtotal)} للحصول على توصيل مجاني.
          </p>
        )}

        <div className="pay-option" style={{ marginTop: 18 }}>
          <Icon name="wallet" size={20} />
          <div>
            <strong>الدفع عند الاستلام</strong>
            <span>ادفع نقداً عند وصول الطلب — لا حاجة لأي دفع مسبق.</span>
          </div>
        </div>

        {submitError && (
          <div className="notice" style={{ marginTop: 14, marginBottom: 0 }}>
            <Icon name="alert" size={18} />
            <p>{submitError}</p>
          </div>
        )}

        <button type="submit" className="btn btn--lg btn--block" disabled={busy || lines.length === 0} style={{ marginTop: 14 }}>
          <Icon name="check-circle" size={19} />
          {busy ? 'جارٍ الإرسال…' : 'تأكيد الطلب'}
        </button>

        <p className="small muted" style={{ marginTop: 12, textAlign: 'center' }}>
          بالضغط على تأكيد الطلب أنت توافق على{' '}
          <a href="/privacy" style={{ color: 'var(--cyan-200)' }}>
            شروط الاستخدام
          </a>
          .
        </p>
      </aside>
    </form>
  )
}
