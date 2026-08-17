import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { useSeo } from '../hooks/useSeo'
import { ORDER_STATUSES } from '../data/content'
import { money, waLink } from '../config'
import { api } from '../services/api'

const FLOW = ['new', 'confirmed', 'shipped', 'delivered']

export default function Track() {
  const [number, setNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useSeo({
    title: 'تتبّع طلبك',
    description: 'أدخل رقم طلبك ورقم هاتفك لمعرفة حالة الطلب وموعد التوصيل المتوقّع.',
    path: '/track',
  })

  const search = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!number.trim()) {
      setError('يرجى إدخال رقم الطلب.')
      return
    }
    setBusy(true)
    try {
      const query = phone.trim() ? `?phone=${encodeURIComponent(phone.trim())}` : ''
      const order = await api.get(`/orders/${encodeURIComponent(number.trim())}${query}`)
      setResult(order)
    } catch {
      setError('لم نعثر على طلب بهذه البيانات. تواصل معنا عبر واتساب وسنتحقّق لك فوراً.')
    } finally {
      setBusy(false)
    }
  }

  const stepIndex = result ? FLOW.indexOf(result.status) : -1

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">تتبّع الطلب</span>
          <h1>أين وصل طلبك؟</h1>
          <p>أدخل رقم الطلب الذي وصلك بعد الشراء، وسنعرض لك حالته الحالية.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <Reveal className="panel panel--glow">
            <form onSubmit={search}>
              <label className="field">
                <span>
                  رقم الطلب <i className="req">*</i>
                </span>
                <input
                  className="input"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="OB-XXXXXXX"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </label>
              <label className="field">
                <span>رقم الهاتف (اختياري للتأكيد)</span>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXX"
                  inputMode="tel"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </label>
              <button type="submit" className="btn btn--block btn--lg" disabled={busy}>
                <Icon name="search" size={18} />
                {busy ? 'جارٍ البحث…' : 'تتبّع الطلب'}
              </button>
            </form>

            {error && (
              <div className="notice" style={{ marginTop: 20 }}>
                <Icon name="alert" size={18} />
                <p>{error}</p>
              </div>
            )}
          </Reveal>

          {result && (
            <Reveal className="panel" style={{ marginTop: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>الطلب {result.number}</h3>
                  <p className="small" style={{ margin: 0 }}>
                    {new Date(result.createdAt).toLocaleDateString('ar-LY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`status-pill status-${result.status}`}>{ORDER_STATUSES[result.status]}</span>
              </div>

              {result.status !== 'cancelled' && (
                <div className="steps-bar" style={{ justifyContent: 'flex-start', marginBlock: 24 }}>
                  {FLOW.map((s, i) => (
                    <div key={s} style={{ display: 'contents' }}>
                      {i > 0 && <span className="steps-bar__sep" />}
                      <span className={`steps-bar__item ${i <= stepIndex ? 'is-on' : ''}`}>
                        <b>{i <= stepIndex ? '✓' : i + 1}</b>
                        {ORDER_STATUSES[s]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <hr className="divider" />

              <div style={{ marginTop: 16 }}>
                {result.items.map((i) => (
                  <div className="summary__line" key={i.id}>
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <strong>{money(i.price * i.qty)}</strong>
                  </div>
                ))}
                <div className="summary__line summary__total">
                  <span>الإجمالي</span>
                  <span className="price">{money(result.total)}</span>
                </div>
              </div>
            </Reveal>
          )}

          <Reveal style={{ textAlign: 'center', marginTop: 26 }}>
            <p className="small muted" style={{ marginBottom: 12 }}>
              لا تجد رقم طلبك؟ نحن نساعدك في ثوانٍ.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={waLink('السلام عليكم، أريد الاستفسار عن حالة طلبي.')} target="_blank" rel="noopener noreferrer" className="btn btn--wa btn--sm">
                <Icon name="whatsapp" size={17} />
                استفسر عبر واتساب
              </a>
              <Link to="/contact" className="btn btn--ghost btn--sm">
                طرق التواصل الأخرى
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
