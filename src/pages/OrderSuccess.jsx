import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { buildWhatsAppMessage } from '../components/OrderForm'
import { useSeo } from '../hooks/useSeo'
import { ORDER_STATUSES } from '../data/content'
import { SITE, money, waLink } from '../config'
import { api } from '../services/api'

export default function OrderSuccess() {
  const { number } = useParams()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [order, setOrder] = useState(location.state?.order ?? null)
  const [notFound, setNotFound] = useState(false)

  /* الطلب يصل عادةً عبر state من نموذج الطلب مباشرة — نجلبه من الخادم فقط إذا
     فُتحت الصفحة مباشرة (رابط محفوظ أو إعادة تحميل) */
  useEffect(() => {
    if (order || !number) return
    api
      .get(`/orders/${encodeURIComponent(number)}`)
      .then(setOrder)
      .catch(() => setNotFound(true))
  }, [order, number])

  useSeo({
    title: 'تم استلام طلبك',
    description: 'تم استلام طلبك بنجاح — سيتواصل معك فريق Oxygen Boost لتأكيد الطلب وموعد التوصيل.',
    path: `/order/${number}`,
  })

  const waHref = order ? waLink(buildWhatsAppMessage(order)) : waLink()

  /* محاولة فتح واتساب تلقائياً مرة واحدة — إن منعها المتصفح يبقى الزر متاحاً */
  useEffect(() => {
    if (!order) return
    const key = `ob:wa-sent:${order.number}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    const t = setTimeout(() => window.open(waHref, '_blank', 'noopener'), 900)
    return () => clearTimeout(t)
  }, [order, waHref])

  const copy = () => {
    navigator.clipboard?.writeText(number).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {}
    )
  }

  if (!order && !notFound) {
    return (
      <div className="container section" style={{ textAlign: 'center', minHeight: '40vh' }}>
        <p className="muted">جارٍ تحميل تفاصيل الطلب…</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container success">
        <h1>لم نعثر على هذا الطلب</h1>
        <p>ربما تم فتح الرابط على جهاز آخر، أو تحقّق من رقم الطلب. تواصل معنا وسنساعدك فوراً.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={waLink(`السلام عليكم، أستفسر عن الطلب رقم ${number}`)} target="_blank" rel="noopener noreferrer" className="btn btn--wa">
            <Icon name="whatsapp" size={18} />
            تواصل عبر واتساب
          </a>
          <Link to="/" className="btn btn--ghost">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container success">
      <Reveal>
        <div className="success__check">
          <Icon name="check" size={44} stroke={2.4} />
        </div>

        <h1>تم استلام طلبك بنجاح!</h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '54ch', marginInline: 'auto' }}>
          سيتواصل معك فريق Oxygen Boost لتأكيد طلبك وموعد التوصيل. احتفظ برقم الطلب للمتابعة.
        </p>

        <button type="button" className="order-num" onClick={copy} title="اضغط لنسخ رقم الطلب">
          <Icon name={copied ? 'check' : 'ticket'} size={19} />
          {order.number}
        </button>
        {copied && (
          <p className="small" style={{ color: 'var(--ok)', marginTop: -18 }}>
            تم نسخ رقم الطلب
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn--wa btn--lg">
            <Icon name="whatsapp" size={19} />
            إرسال تفاصيل الطلب عبر واتساب
          </a>
          <Link to="/track" className="btn btn--ghost btn--lg">
            تتبّع طلبك
          </Link>
        </div>
        <p className="small muted">
          إن لم تُفتح نافذة واتساب تلقائياً، اضغط الزر أعلاه — سيصل الطلب إلينا مباشرة برقمه وتفاصيله.
        </p>
      </Reveal>

      {/* ملخّص الطلب */}
      <Reveal className="panel recap" delay={120}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>ملخّص الطلب</h3>
          <span className={`status-pill status-${order.status}`}>{ORDER_STATUSES[order.status]}</span>
        </div>

        {order.items.map((i) => (
          <div className="summary__line" key={i.id}>
            <span>
              {i.name} × {i.qty}
            </span>
            <strong>{money(i.price * i.qty)}</strong>
          </div>
        ))}

        <hr className="divider" style={{ margin: '12px 0' }} />

        <div className="summary__line">
          <span>المجموع الفرعي</span>
          <strong>{money(order.subtotal)}</strong>
        </div>
        {order.discount > 0 && (
          <div className="summary__line">
            <span>الخصم{order.coupon ? ` (${order.coupon})` : ''}</span>
            <strong style={{ color: 'var(--ok)' }}>−{money(order.discount)}</strong>
          </div>
        )}
        <div className="summary__line">
          <span>التوصيل</span>
          <strong>{order.delivery === 0 ? 'مجاني' : money(order.delivery)}</strong>
        </div>
        <div className="summary__line summary__total">
          <span>الإجمالي</span>
          <span className="price">{money(order.total)}</span>
        </div>

        <hr className="divider" style={{ margin: '18px 0' }} />

        <h4 style={{ fontFamily: 'Cairo, sans-serif', marginBottom: 10 }}>بيانات التوصيل</h4>
        <div className="pdp__meta" style={{ margin: 0 }}>
          <div>
            <Icon name="user" size={17} />
            {order.customer.name}
          </div>
          <div>
            <Icon name="phone" size={17} />
            <span dir="ltr">{order.customer.phone}</span>
          </div>
          <div>
            <Icon name="pin" size={17} />
            {order.customer.city} — {order.customer.address}
          </div>
          <div>
            <Icon name="wallet" size={17} />
            {order.payment}
          </div>
          <div>
            <Icon name="truck" size={17} />
            مدة التوصيل المتوقّعة: {SITE.deliveryDays}
          </div>
        </div>

        {order.customer.notes && (
          <p className="small" style={{ marginTop: 14 }}>
            <strong style={{ color: '#fff' }}>ملاحظات:</strong> {order.customer.notes}
          </p>
        )}
      </Reveal>

      <Reveal delay={200} style={{ marginTop: 30 }}>
        <Link to="/shop" className="btn btn--ghost">
          متابعة التسوّق
        </Link>
      </Reveal>
    </div>
  )
}
