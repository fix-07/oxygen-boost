import { Link } from 'react-router-dom'
import Art, { HeroWaves } from '../components/Art'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import OrderForm from '../components/OrderForm'
import { Reveal, SectionHead, Stars } from '../components/ui'
import {
  AudienceSection,
  BeforeAfter,
  FaqSection,
  HowToVideo,
  ReviewsSection,
  StepsSection,
  TrustBar,
} from '../components/sections'
import { FEATURES } from '../data/content'
import { useStore } from '../store/StoreContext'
import { useSeo } from '../hooks/useSeo'
import { money } from '../config'

/* ---------------------------- الواجهة الرئيسية ---------------------------- */

function Hero() {
  return (
    <section className="hero">
      <HeroWaves />
      <div className="container hero__grid">
        <div>
          <Reveal>
            <span className="eyebrow">توصيل داخل ليبيا · الدفع عند الاستلام</span>
          </Reveal>

          <Reveal delay={80}>
            <h1>
              تنفّس <span className="gradient-text">بسهولة أكبر</span> مع Oxygen Boost
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="hero__lead">
              موسّع أنف مغناطيسي بتصميم عملي وخفيف يساعد على فتح مجرى الأنف وتحسين تدفق الهواء أثناء النوم والرياضة
              والأنشطة اليومية.
            </p>
          </Reveal>

          <Reveal delay={220} className="hero__cta">
            <Link to="/checkout" className="btn btn--lg">
              <Icon name="cart" size={19} />
              اطلبه الآن
            </Link>
            <a href="#how" className="btn btn--ghost btn--lg">
              <Icon name="play" size={17} />
              شاهد طريقة الاستخدام
            </a>
          </Reveal>

          <Reveal delay={280}>
            <ul className="hero__trust">
              <li>
                <Icon name="check-circle" size={18} /> سهل الاستخدام
              </li>
              <li>
                <Icon name="check-circle" size={18} /> تصميم خفيف ومريح
              </li>
              <li>
                <Icon name="check-circle" size={18} /> توصيل والدفع عند الاستلام
              </li>
            </ul>
          </Reveal>

          <Reveal delay={340} className="hero__rating">
            <Stars value={5} size={17} />
            <p>
              <strong>تجربة استثنائية، وثقتك أولويتنا</strong>
              نلتزم بوصف دقيق للمنتج ودعم سريع قبل الطلب وبعده.
            </p>
          </Reveal>
        </div>

        <Reveal className="hero__visual" delay={120}>
          <div className="hero__halo" />
          <div className="hero__product">
            <Art name="kit" photo="hero.jpg" alt="طقم Oxygen Boost" />
            <div className="hero__tag">
              <Icon name="magnet" size={15} style={{ color: 'var(--cyan-400)', display: 'inline' }} /> تثبيت مغناطيسي
            </div>
            <div className="hero__tag hero__tag--2">
              <Icon name="wind" size={15} style={{ color: 'var(--cyan-400)', display: 'inline' }} /> تدفّق هواء أفضل
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------- شريط متحرك ---------------------------- */

const TICKER = [
  { icon: 'truck', text: 'توصيل إلى مختلف المدن الليبية' },
  { icon: 'wallet', text: 'الدفع عند الاستلام' },
  { icon: 'whatsapp', text: 'دعم سريع عبر واتساب' },
  { icon: 'package', text: 'تغليف بعناية' },
  { icon: 'shield', text: 'خامات مريحة للاستخدام اليومي' },
]

function Ticker() {
  const row = [...TICKER, ...TICKER]
  return (
    <div className="ticker">
      <div className="ticker__track">
        {row.map((t, i) => (
          <span className="ticker__item" key={i}>
            <Icon name={t.icon} size={17} />
            {t.text}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------- الباقات ---------------------------- */

function Bundles() {
  const { bundles, addToCart } = useStore()

  return (
    <div className="grid bundles">
      {bundles.map((b, i) => {
        const save = b.compareAt ? b.compareAt - b.price : 0
        return (
          <Reveal className={`bundle ${b.best ? 'bundle--best' : ''}`} key={b.id} delay={i * 90}>
            {b.badges?.[0] && (
              <span className={`badge bundle__flag ${b.best ? '' : 'badge--soft'}`}>{b.badges[0]}</span>
            )}
            <h3>{b.name}</h3>
            <p className="bundle__sub">{b.short}</p>

            <div className="price bundle__price">{money(b.price)}</div>
            {save > 0 ? (
              <span className="bundle__save">توفير {money(save)}</span>
            ) : (
              <span className="bundle__save" style={{ opacity: 0, pointerEvents: 'none' }}>
                —
              </span>
            )}

            <ul>
              {b.contents.map((c) => (
                <li key={c}>
                  <Icon name="check" size={15} />
                  {c}
                </li>
              ))}
            </ul>

            <button type="button" className={`btn btn--block ${b.best ? '' : 'btn--ghost'}`} onClick={() => addToCart(b.id, 1, { open: true })}>
              اختر هذه الباقة
            </button>
          </Reveal>
        )
      })}
    </div>
  )
}

/* ---------------------------- الصفحة ---------------------------- */

export default function Home() {
  const { products } = useStore()

  useSeo({
    title: 'تنفّس بسهولة أكبر — موسّع الأنف المغناطيسي',
    description:
      'موسّع أنف مغناطيسي بتصميم عملي وخفيف يساعد على فتح مجرى الأنف وتحسين تدفق الهواء أثناء النوم والرياضة. توصيل داخل ليبيا والدفع عند الاستلام.',
    path: '/',
  })

  return (
    <>
      <Hero />
      <Ticker />

      {/* لماذا Oxygen Boost */}
      <section className="section" id="features">
        <div className="container">
          <SectionHead
            eyebrow="لماذا Oxygen Boost؟"
            title="تنفّس أفضل، حركة أفضل، ونوم براحة أكبر"
            text="تفاصيل صغيرة في التصميم تُحدث فرقاً ملموساً في تجربة الاستخدام اليومية."
          />
          <div className="grid features">
            {FEATURES.map((f, i) => (
              <Reveal className="card feature" key={f.title} delay={i * 80}>
                <div className="feature__icon">
                  <Icon name={f.icon} size={25} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* المنتجات */}
      <section className="section" id="products">
        <div className="container">
          <SectionHead
            eyebrow="المنتجات"
            title="اختر ما يناسب استخدامك"
            text="الجهاز الأساسي وعبوات اللصقات البديلة بأحجام مختلفة."
          />
          <div className="grid products-grid">
            {products.map((p, i) => (
              <ProductCard product={p} key={p.id} delay={i * 80} />
            ))}
          </div>
          <Reveal style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/shop" className="btn btn--ghost">
              عرض كل المنتجات
              <Icon name="arrow-back" size={17} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* الباقات */}
      <section className="section" id="bundles">
        <div className="container">
          <SectionHead
            eyebrow="الباقات والعروض"
            title="وفّر أكثر مع الباقات الجاهزة"
            text="اجمع الجهاز مع عبوة اللصقات المناسبة لك واحصل على سعر أفضل."
          />
          <Bundles />
        </div>
      </section>

      {/* طريقة الاستخدام */}
      <section className="section" id="how">
        <div className="container">
          <StepsSection />
          <div style={{ marginTop: 46, maxWidth: 860, marginInline: 'auto' }}>
            <HowToVideo />
          </div>
        </div>
      </section>

      {/* قبل وبعد */}
      <section className="section" id="before-after">
        <div className="container">
          <BeforeAfter />
        </div>
      </section>

      {/* لمن يناسب */}
      <section className="section" id="audience">
        <div className="container">
          <AudienceSection />
        </div>
      </section>

      {/* آراء العملاء */}
      <section className="section" id="reviews">
        <div className="container">
          <ReviewsSection />
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="section" id="faq">
        <div className="container">
          <SectionHead
            eyebrow="الأسئلة الشائعة"
            title="كل ما تحتاج معرفته قبل الطلب"
            text="لم تجد سؤالك؟ راسلنا على واتساب وسنجيبك مباشرة."
          />
          <FaqSection limit={6} />
          <Reveal style={{ textAlign: 'center', marginTop: 30 }}>
            <Link to="/faq" className="btn btn--ghost btn--sm">
              عرض كل الأسئلة
            </Link>
          </Reveal>
        </div>
      </section>

      {/* الطلب السريع */}
      <section className="section" id="order">
        <div className="container">
          <SectionHead
            eyebrow="الطلب السريع"
            title="اطلب في أقل من دقيقة"
            text="بدون تسجيل حساب — املأ البيانات وسنتواصل معك لتأكيد الطلب."
          />
          <Reveal>
            <OrderForm mode="quick" />
          </Reveal>
        </div>
      </section>

      {/* شريط الثقة */}
      <section className="section section--tight" id="trust">
        <div className="container">
          <TrustBar />
        </div>
      </section>
    </>
  )
}
