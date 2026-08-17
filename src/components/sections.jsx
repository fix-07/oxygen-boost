import { useState } from 'react'
import Icon from './Icon'
import Art, { NoseFlowArt } from './Art'
import { Accordion, Notice, Reveal, SectionHead, Stars } from './ui'
import { FAQS, REVIEWS, STEPS, TRUST_POINTS, USE_CASES } from '../data/content'
import { SITE } from '../config'

/* ---------------------------- خطوات الاستخدام ---------------------------- */

export function StepsSection({ withHead = true }) {
  return (
    <>
      {withHead && (
        <SectionHead
          eyebrow="طريقة الاستخدام"
          title="أربع خطوات بسيطة وتكون جاهزاً"
          text="لا تحتاج أدوات ولا خبرة — الطريقة نفسها في كل مرة."
        />
      )}
      <div className="grid steps">
        {STEPS.map((s, i) => (
          <Reveal className="step" key={s.title} delay={i * 90}>
            <div className="step__num">{i + 1}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <Notice>
          للاستخدام الخارجي فقط. أوقف الاستخدام عند حدوث تهيّج في الجلد. هذا المنتج ليس بديلاً عن الاستشارة الطبية إذا
          كنت تعاني من مشكلة تنفّس مستمرة.
        </Notice>
      </Reveal>
    </>
  )
}

/* ---------------------------- فيديو الشرح ---------------------------- */

export function HowToVideo() {
  const [playing, setPlaying] = useState(false)
  const src = SITE.howToVideo

  return (
    <Reveal className="video-box">
      {playing && src ? (
        src.endsWith('.mp4') ? (
          <video src={src} controls autoPlay playsInline />
        ) : (
          <iframe
            src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`}
            title="طريقة استخدام Oxygen Boost"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <div className="video-box__placeholder">
          <button
            type="button"
            className="play-btn"
            onClick={() => src && setPlaying(true)}
            aria-label="تشغيل فيديو طريقة الاستخدام"
          >
            <Icon name="play" size={26} style={{ marginInlineStart: 4 }} />
          </button>
          <h3 style={{ marginBottom: 4 }}>شاهد طريقة التركيب</h3>
          <p className="small" style={{ margin: 0 }}>
            {src ? 'فيديو قصير يوضّح الخطوات الأربع.' : 'مساحة مخصّصة لفيديو قصير يوضّح طريقة التركيب.'}
          </p>
        </div>
      )}
    </Reveal>
  )
}

/* ---------------------------- قبل وبعد ---------------------------- */

export function BeforeAfter() {
  return (
    <>
      <SectionHead
        eyebrow="قبل وبعد"
        title="تصميم بسيط يصنع فرقاً في تجربة تنفّسك"
        text="رسم توضيحي مبسّط لفكرة مرور الهواء قبل استخدام موسّع الأنف وبعد تركيبه. النتيجة تختلف من شخص لآخر."
      />
      <div className="grid ba-grid">
        <Reveal className="ba-card">
          <NoseFlowArt />
          <span className="badge badge--soft" style={{ marginBottom: 10 }}>
            قبل الاستخدام
          </span>
          <h3>مجرى أضيق</h3>
          <p>فتحتا الأنف في وضعهما الطبيعي، ومرور الهواء قد يبدو محدوداً لدى البعض.</p>
        </Reveal>

        <Reveal className="ba-card ba-card--after" delay={140}>
          <NoseFlowArt open />
          <span className="badge" style={{ marginBottom: 10 }}>
            بعد التركيب
          </span>
          <h3>مجرى أوسع</h3>
          <p>التصميم يرفع جانبَي الأنف بلطف من الخارج، ما قد يدعم مرور الهواء بشكل أكثر راحة.</p>
        </Reveal>
      </div>
      <Reveal>
        <p className="placeholder-note">رسوم توضيحية للفكرة فقط — ليست ادّعاءً طبياً ولا نتيجة مضمونة.</p>
      </Reveal>
    </>
  )
}

/* ---------------------------- لمن يناسب ---------------------------- */

export function AudienceSection() {
  return (
    <>
      <SectionHead
        eyebrow="لمن يناسب؟"
        title="يرافقك في يومك أينما كنت"
        text="حجم صغير واستخدام سريع يجعله عملياً في أكثر من موقف."
      />
      <div className="grid audience">
        {USE_CASES.map((u, i) => (
          <Reveal className="use-case" key={u.title} delay={i * 90}>
            <div className="use-case__art">
              <Art name={u.art} photo={`use-${u.art}.jpg`} alt={u.title} />
            </div>
            <div className="use-case__body">
              <h3>{u.title}</h3>
              <p>{u.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

/* ---------------------------- آراء العملاء ---------------------------- */

export function ReviewsSection() {
  const hasReal = REVIEWS.some((r) => !r.placeholder)

  return (
    <>
      <SectionHead
        eyebrow="آراء العملاء"
        title="تجربة استثنائية، وثقتك أولويتنا"
        text="نعرض هنا آراء عملائنا كما وصلتنا، دون تعديل أو مبالغة."
      />
      <div className="reviews-rail">
        {REVIEWS.map((r, i) => (
          <Reveal className="review" key={i} delay={i * 70}>
            <Stars value={r.stars} />
            <p className="review__text">{r.text}</p>
            <div className="review__who">
              <div className="review__avatar">{r.name.charAt(0)}</div>
              <div>
                <div className="review__name">{r.name}</div>
                <div className="review__meta">
                  {r.city}
                  {r.verified && ' · مشترٍ موثّق'}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      {!hasReal && (
        <p className="placeholder-note">
          هذه نصوص مبدئية مخصّصة لعرض التصميم — ستُستبدل بآراء عملاء حقيقية فور وصولها.
        </p>
      )}
    </>
  )
}

/* ---------------------------- الأسئلة الشائعة ---------------------------- */

export function FaqSection({ limit }) {
  return <Accordion items={limit ? FAQS.slice(0, limit) : FAQS} />
}

/* ---------------------------- شريط الثقة ---------------------------- */

export function TrustBar() {
  return (
    <div className="grid trust-bar">
      {TRUST_POINTS.map((t, i) => (
        <Reveal className="trust-item" key={t.title} delay={i * 70}>
          <Icon name={t.icon} size={26} />
          <strong>{t.title}</strong>
          <span>{t.text}</span>
        </Reveal>
      ))}
    </div>
  )
}
