import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal, SectionHead } from '../components/ui'
import { BeforeAfter, FaqSection, HowToVideo, StepsSection, TrustBar } from '../components/sections'
import { useSeo } from '../hooks/useSeo'

const TIPS = [
  { icon: 'search', title: 'بشرة نظيفة وجافة', text: 'الزيوت والعرق يقلّلان قوة اللصق — نظّف وجفّف قبل التركيب.' },
  { icon: 'clock', title: 'ابدأ بفترات قصيرة', text: 'جرّب الاستخدام لفترة قصيرة أولاً حتى تعتاد عليه.' },
  { icon: 'refresh', title: 'استبدل اللصقة عند الحاجة', text: 'اللصقة للاستخدام مرة واحدة عادةً؛ استبدلها فور ضعف الالتصاق.' },
  { icon: 'package', title: 'خزّنه في مكان جاف', text: 'أعد القطعة إلى علبتها بعد الاستخدام للحفاظ عليها.' },
]

export default function HowToUse() {
  useSeo({
    title: 'طريقة الاستخدام',
    description:
      'شرح مبسّط بأربع خطوات لتركيب موسّع الأنف المغناطيسي Oxygen Boost، مع نصائح عملية وتنبيهات الاستخدام الآمن.',
    path: '/how-to-use',
  })

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">دليل الاستخدام</span>
          <h1>طريقة الاستخدام خطوة بخطوة</h1>
          <p>لا يحتاج المنتج إلى أدوات ولا خبرة سابقة — أربع خطوات فقط وتكون جاهزاً.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <StepsSection withHead={false} />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container" style={{ maxWidth: 900 }}>
          <SectionHead eyebrow="فيديو" title="شاهد التركيب خطوة بخطوة" />
          <HowToVideo />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="نصائح" title="نصائح تجعل تجربتك أفضل" />
          <div className="grid features">
            {TIPS.map((t, i) => (
              <Reveal className="card feature" key={t.title} delay={i * 80}>
                <div className="feature__icon">
                  <Icon name={t.icon} size={24} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <BeforeAfter />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="أسئلة الاستخدام" title="أسئلة شائعة حول التركيب" />
          <FaqSection limit={5} />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <TrustBar />
          <Reveal style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/shop" className="btn btn--lg">
              <Icon name="cart" size={18} />
              اطلب Oxygen Boost الآن
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
