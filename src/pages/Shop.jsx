import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import { Reveal, SectionHead } from '../components/ui'
import { TrustBar } from '../components/sections'
import { useStore } from '../store/StoreContext'
import { useSeo } from '../hooks/useSeo'
import { money } from '../config'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'device', label: 'الجهاز' },
  { id: 'pads', label: 'اللصقات البديلة' },
  { id: 'bundle', label: 'الباقات' },
]

export default function Shop() {
  const { items, addToCart } = useStore()
  const [filter, setFilter] = useState('all')

  useSeo({
    title: 'جميع المنتجات',
    description:
      'تصفّح جهاز Oxygen Boost وعبوات اللصقات البديلة ٣٠ و٦٠ و٩٠ لصقة والباقات الموفّرة. توصيل داخل ليبيا والدفع عند الاستلام.',
    path: '/shop',
  })

  const shown = filter === 'all' ? items : items.filter((p) => p.type === filter)

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">المتجر</span>
          <h1>جميع المنتجات</h1>
          <p>الجهاز الأساسي، عبوات اللصقات البديلة، والباقات الموفّرة — كلها متاحة مع الدفع عند الاستلام.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <Reveal className="admin-tabs" style={{ justifyContent: 'center', marginBottom: 34 }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? 'is-active' : ''}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </Reveal>

          {shown.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center' }}>
              لا توجد منتجات في هذا التصنيف حالياً.
            </p>
          ) : (
            <div className="grid products-grid">
              {shown.map((p, i) => (
                <ProductCard product={p} key={p.id} delay={i * 70} />
              ))}
            </div>
          )}

          <Reveal className="panel panel--glow" style={{ marginTop: 46, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 8 }}>غير متأكد أي خيار يناسبك؟</h3>
            <p style={{ maxWidth: '52ch', marginInline: 'auto' }}>
              ابدأ بباقة «الجهاز + ٦٠ لصقة» — الأكثر طلباً لأنها تغطّي شهرين من الاستخدام اليومي بسعر أفضل.
            </p>
            <button type="button" className="btn" onClick={() => addToCart('bundle-60', 1, { open: true })}>
              <Icon name="cart" size={18} />
              أضف الباقة الأكثر طلباً — {money(205)}
            </button>
          </Reveal>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <SectionHead title="لماذا الشراء من Oxygen Boost" />
          <TrustBar />
          <Reveal style={{ textAlign: 'center', marginTop: 30 }}>
            <Link to="/how-to-use" className="btn btn--ghost btn--sm">
              اطّلع على طريقة الاستخدام
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
