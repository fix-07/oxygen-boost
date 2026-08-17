import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Art from '../components/Art'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import { Qty, Reveal, SectionHead } from '../components/ui'
import { ReviewsSection } from '../components/sections'
import { useStore } from '../store/StoreContext'
import { useSeo } from '../hooks/useSeo'
import { SITE, money, waLink } from '../config'
import { track } from '../analytics'

/* ---------------------------- معرض الصور مع التكبير ---------------------------- */

function Gallery({ product }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const boxRef = useRef(null)
  const art = product.art?.length ? product.art : ['device']

  useEffect(() => setActive(0), [product.id])

  /** يتبع مؤشر الفأرة أثناء التكبير */
  const onMove = (e) => {
    if (!zoom || !boxRef.current) return
    const r = boxRef.current.getBoundingClientRect()
    const inner = boxRef.current.querySelector('svg, img')
    if (!inner) return
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    inner.style.transformOrigin = `${x}% ${y}%`
  }

  return (
    <div>
      <div
        ref={boxRef}
        className={`gallery__main ${zoom ? 'is-zoomed' : ''}`}
        onClick={() => setZoom((v) => !v)}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setZoom((v) => !v)}
        aria-label="اضغط لتكبير الصورة"
      >
        <Art name={art[active]} photo={`${product.id}-${active + 1}.jpg`} alt={product.name} />
        <span className="gallery__hint">
          <Icon name="zoom" size={14} />
          {zoom ? 'اضغط للتصغير' : 'اضغط للتكبير'}
        </span>
      </div>

      {art.length > 1 && (
        <div className="gallery__thumbs">
          {art.map((a, i) => (
            <button
              key={a + i}
              type="button"
              className={`gallery__thumb ${i === active ? 'is-active' : ''}`}
              onClick={() => {
                setActive(i)
                setZoom(false)
              }}
              aria-label={`صورة ${i + 1}`}
            >
              <Art name={a} photo={`${product.id}-${i + 1}.jpg`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------------- التبويبات ---------------------------- */

function Details({ product }) {
  const [tab, setTab] = useState('includes')

  const tabs = [
    { id: 'includes', label: 'محتويات العبوة', list: product.includes },
    { id: 'features', label: 'المزايا', list: product.features },
    { id: 'usage', label: 'طريقة الاستخدام', list: product.usage },
    { id: 'warnings', label: 'تنبيهات الاستخدام', list: product.warnings },
  ].filter((t) => t.list?.length)

  const current = tabs.find((t) => t.id === tab) || tabs[0]
  if (!current) return null

  return (
    <div>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={current.id === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="spec-list">
        {current.list.map((item) => (
          <li key={item}>
            <Icon name={current.id === 'warnings' ? 'alert' : 'check'} size={16} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------- الصفحة ---------------------------- */

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getItem, items, addToCart } = useStore()
  const [qty, setQty] = useState(1)

  const product = getItem(slug)

  useSeo({
    title: product?.name,
    description: product ? `${product.short} السعر ${money(product.price)}. توصيل داخل ليبيا والدفع عند الاستلام.` : '',
    path: `/product/${slug}`,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.short,
          brand: { '@type': 'Brand', name: SITE.name },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'LYD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }
      : undefined,
  })

  /* شريط الشراء الثابت على الجوال */
  useEffect(() => {
    document.body.classList.add('has-sticky-bar')
    return () => document.body.classList.remove('has-sticky-bar')
  }, [])

  useEffect(() => {
    setQty(1)
    if (product) track('ViewContent', { content_name: product.name, value: product.price, currency: 'LYD' })
  }, [product])

  const suggested = useMemo(
    () => items.filter((p) => p.id !== product?.id && p.type !== 'bundle').slice(0, 4),
    [items, product]
  )

  if (!product) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h1>المنتج غير موجود</h1>
        <p>ربما تم تغيير الرابط أو حذف المنتج.</p>
        <Link to="/shop" className="btn">
          عرض جميع المنتجات
        </Link>
      </div>
    )
  }

  const soldOut = product.stock <= 0
  const lowStock = product.stock > 0 && product.stock <= 10

  const buyNow = () => {
    addToCart(product.id, qty, { silent: true })
    navigate('/checkout')
  }

  return (
    <>
      <div className="container">
        <nav className="breadcrumbs" aria-label="مسار التنقّل">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <Link to="/shop">المتجر</Link>
          <span>/</span>
          <span style={{ color: '#fff' }}>{product.name}</span>
        </nav>
      </div>

      <div className="container pdp">
        <Reveal>
          <Gallery product={product} />
        </Reveal>

        <Reveal delay={100}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {product.badges?.map((b) => (
              <span className="badge" key={b}>
                {b}
              </span>
            ))}
            <span className={`badge ${soldOut ? 'badge--out' : 'badge--ok'}`}>
              {soldOut ? 'غير متوفر حالياً' : lowStock ? `متبقٍ ${product.stock} قطع فقط` : 'متوفر في المخزون'}
            </span>
          </div>

          <h1 className="pdp__title">{product.name}</h1>
          <p>{product.short}</p>

          <div>
            <span className="price pdp__price">{money(product.price)}</span>
            {product.compareAt > product.price && <span className="price-old">{money(product.compareAt)}</span>}
          </div>
          <p className="small muted">السعر شامل المنتج — تُضاف تكلفة التوصيل عند إتمام الطلب.</p>

          {!soldOut && (
            <div className="pdp__buy">
              <Qty value={qty} onChange={setQty} large />
              <button type="button" className="btn btn--lg" onClick={() => addToCart(product.id, qty, { open: true })}>
                <Icon name="cart" size={19} />
                أضف إلى السلة
              </button>
              <button type="button" className="btn btn--ghost btn--lg" onClick={buyNow}>
                اطلب الآن
              </button>
            </div>
          )}

          {soldOut && (
            <div className="pdp__buy">
              <a href={waLink(`السلام عليكم، متى يتوفّر «${product.name}» مرة أخرى؟`)} target="_blank" rel="noopener noreferrer" className="btn btn--wa btn--lg">
                <Icon name="whatsapp" size={19} />
                أشعرني عند التوفّر
              </a>
            </div>
          )}

          <div className="pdp__meta">
            <div>
              <Icon name="truck" size={18} />
              مدة التوصيل المتوقّعة: {SITE.deliveryDays}
            </div>
            <div>
              <Icon name="wallet" size={18} />
              الدفع عند الاستلام في كل المدن التي نغطّيها
            </div>
            <div>
              <Icon name="whatsapp" size={18} />
              دعم مباشر عبر واتساب قبل الطلب وبعده
            </div>
          </div>

          <Details product={product} />
        </Reveal>
      </div>

      {/* آراء العملاء */}
      <section className="section">
        <div className="container">
          <ReviewsSection />
        </div>
      </section>

      {/* منتجات مقترحة */}
      {suggested.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <SectionHead
              eyebrow="قد يناسبك أيضاً"
              title="أكمل طلبك"
              text="اللصقات البديلة تضمن استمرار استخدامك دون انقطاع."
            />
            <div className="grid products-grid">
              {suggested.map((p, i) => (
                <ProductCard product={p} key={p.id} delay={i * 70} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* شريط ثابت للجوال */}
      <div className="sticky-bar">
        <button type="button" className="btn" onClick={buyNow} disabled={soldOut}>
          {soldOut ? 'غير متوفر' : 'اطلب الآن'}
        </button>
        <a
          href={waLink(`السلام عليكم، أريد الاستفسار عن «${product.name}».`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--wa"
        >
          <Icon name="whatsapp" size={18} />
          واتساب
        </a>
      </div>
    </>
  )
}
