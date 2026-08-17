import { useState } from 'react'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { useSeo } from '../hooks/useSeo'
import { SITE, waLink } from '../config'

const CHANNELS = [
  { icon: 'whatsapp', title: 'واتساب', value: SITE.whatsappDisplay, href: waLink(), note: 'الأسرع للرد' },
  { icon: 'instagram', title: 'إنستقرام', value: `@${SITE.instagram}`, href: SITE.instagramUrl, note: 'رسائل مباشرة' },
  { icon: 'mail', title: 'البريد الإلكتروني', value: SITE.email, href: `mailto:${SITE.email}`, note: 'للاستفسارات العامة' },
]

export default function Contact() {
  const [values, setValues] = useState({ name: '', phone: '', message: '' })
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  useSeo({
    title: 'تواصل معنا',
    description: 'تواصل مع فريق Oxygen Boost عبر واتساب أو إنستقرام أو البريد الإلكتروني — دعم سريع قبل الطلب وبعده.',
    path: '/contact',
  })

  const send = (e) => {
    e.preventDefault()
    const msg = [
      'السلام عليكم، أريد الاستفسار عن منتجات Oxygen Boost.',
      values.name && `الاسم: ${values.name}`,
      values.phone && `الهاتف: ${values.phone}`,
      values.message && `الرسالة: ${values.message}`,
    ]
      .filter(Boolean)
      .join('\n')
    window.open(waLink(msg), '_blank', 'noopener')
  }

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">تواصل معنا</span>
          <h1>نحن هنا للإجابة</h1>
          <p>اختر الطريقة الأنسب لك — نرد عادةً خلال وقت قصير خلال ساعات العمل.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="grid features" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 40 }}>
            {CHANNELS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <a className="card feature" href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                  <div className="feature__icon">
                    <Icon name={c.icon} size={24} />
                  </div>
                  <h3>{c.title}</h3>
                  <p style={{ color: 'var(--cyan-200)', fontWeight: 700, marginBottom: 4, direction: 'ltr', textAlign: 'start' }}>
                    {c.value}
                  </p>
                  <p className="small" style={{ margin: 0 }}>
                    {c.note}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal className="panel panel--glow" style={{ maxWidth: 720, marginInline: 'auto' }}>
            <h3 style={{ marginBottom: 6 }}>أرسل رسالتك مباشرة</h3>
            <p className="small">تُفتح الرسالة جاهزة في واتساب — لا نحتفظ بأي بيانات من هذا النموذج.</p>

            <form onSubmit={send} style={{ marginTop: 20 }}>
              <div className="form-row">
                <label className="field">
                  <span>الاسم</span>
                  <input className="input" value={values.name} onChange={set('name')} placeholder="اسمك" />
                </label>
                <label className="field">
                  <span>رقم الهاتف</span>
                  <input
                    className="input"
                    value={values.phone}
                    onChange={set('phone')}
                    placeholder="09XXXXXXXX"
                    inputMode="tel"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </label>
              </div>
              <label className="field">
                <span>رسالتك</span>
                <textarea
                  className="textarea"
                  value={values.message}
                  onChange={set('message')}
                  placeholder="كيف يمكننا مساعدتك؟"
                />
              </label>
              <button type="submit" className="btn btn--wa btn--block btn--lg">
                <Icon name="whatsapp" size={19} />
                إرسال عبر واتساب
              </button>
            </form>
          </Reveal>

          <Reveal style={{ textAlign: 'center', marginTop: 34 }}>
            <p className="small muted">
              <Icon name="pin" size={15} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 6 }} />
              نغطّي التوصيل إلى مختلف المدن الليبية · {SITE.deliveryDays}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
