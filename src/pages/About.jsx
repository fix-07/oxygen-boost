import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Art from '../components/Art'
import { Reveal, SectionHead } from '../components/ui'
import { TrustBar } from '../components/sections'
import { useSeo } from '../hooks/useSeo'
import { SITE, waLink } from '../config'

const VALUES = [
  { icon: 'shield', title: 'وصف صادق للمنتج', text: 'نصف المنتج كما هو دون وعود مبالغ فيها أو ادّعاءات طبية.' },
  { icon: 'whatsapp', title: 'دعم قريب منك', text: 'فريق يجيب على أسئلتك قبل الطلب وبعده عبر واتساب.' },
  { icon: 'package', title: 'تغليف يحترم الطلب', text: 'كل شحنة تُجهّز وتُغلّف بعناية قبل خروجها.' },
  { icon: 'wallet', title: 'شراء بلا مخاطرة', text: 'الدفع عند الاستلام يعني أنك تدفع بعد وصول الطلب.' },
]

export default function About() {
  useSeo({
    title: 'من نحن',
    description:
      'Oxygen Boost متجر ليبي متخصّص في موسّع الأنف المغناطيسي واللصقات البديلة، بتجربة شراء بسيطة ودفع عند الاستلام.',
    path: '/about',
  })

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">من نحن</span>
          <h1>Oxygen Boost</h1>
          <p>تجربة تنفّس أكثر راحة بتصميم عملي يناسب أسلوب حياتك.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container hero__grid">
          <Reveal>
            <h2>قصة بسيطة وهدف واضح</h2>
            <p>
              بدأت Oxygen Boost من فكرة واحدة: أن تكون تجربة التنفّس اليومية أكثر راحة بأقل تعقيد ممكن. اخترنا منتجاً
              عملياً — موسّع أنف مغناطيسي خفيف — وركّزنا على أن تصل التجربة كاملة إلى بابك داخل ليبيا.
            </p>
            <p>
              نحن لا نبيع وعوداً طبية. نقدّم منتجاً بتصميم يساعد على توسيع فتحتَي الأنف من الخارج، وقد يدعم مرور الهواء
              براحة أكبر لدى كثير من المستخدمين. النتيجة تختلف من شخص لآخر، ونقولها بوضوح.
            </p>
            <p>
              التزامنا هو الوصف الدقيق، والدعم السريع، والتوصيل الموثوق مع الدفع عند الاستلام — حتى تطلب وأنت مطمئن.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
              <Link to="/shop" className="btn">
                تصفّح المنتجات
              </Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <Icon name="whatsapp" size={18} />
                تحدّث معنا
              </a>
            </div>
          </Reveal>

          <Reveal className="hero__visual" delay={120}>
            <div className="hero__halo" />
            <div className="hero__product" style={{ animation: 'none' }}>
              <Art name="device" photo="about.jpg" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="قيمنا" title="ما الذي نلتزم به" />
          <div className="grid features">
            {VALUES.map((v, i) => (
              <Reveal className="card feature" key={v.title} delay={i * 80}>
                <div className="feature__icon">
                  <Icon name={v.icon} size={24} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <TrustBar />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <Reveal className="panel panel--glow" style={{ textAlign: 'center', maxWidth: 760, marginInline: 'auto' }}>
            <h3>تابعنا على إنستقرام</h3>
            <p>نشارك هناك صور المنتج، نصائح الاستخدام، وتجارب العملاء.</p>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn">
              <Icon name="instagram" size={18} />@{SITE.instagram}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
