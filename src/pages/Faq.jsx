import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { FaqSection } from '../components/sections'
import { FAQS } from '../data/content'
import { useSeo } from '../hooks/useSeo'
import { waLink } from '../config'

export default function Faq() {
  useSeo({
    title: 'الأسئلة الشائعة',
    description:
      'إجابات واضحة عن طريقة عمل موسّع الأنف المغناطيسي، الاستخدام أثناء النوم والرياضة، اللصقات البديلة، التوصيل، والدفع عند الاستلام.',
    path: '/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  })

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">الأسئلة الشائعة</span>
          <h1>كل ما تحتاج معرفته</h1>
          <p>جمعنا هنا أكثر الأسئلة التي تصلنا. إن لم تجد سؤالك، نحن على بعد رسالة واحدة.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <FaqSection />

          <Reveal className="panel panel--glow" style={{ maxWidth: 820, margin: '46px auto 0', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 8 }}>لم تجد إجابتك؟</h3>
            <p style={{ maxWidth: '48ch', marginInline: 'auto' }}>
              راسلنا على واتساب وسيجيبك فريق Oxygen Boost في أسرع وقت ممكن.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn--wa">
                <Icon name="whatsapp" size={18} />
                تواصل عبر واتساب
              </a>
              <Link to="/contact" className="btn btn--ghost">
                صفحة التواصل
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
