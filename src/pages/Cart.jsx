import { Link } from 'react-router-dom'
import Art from '../components/Art'
import Icon from '../components/Icon'
import { EmptyState, Qty, Reveal } from '../components/ui'
import { useStore } from '../store/StoreContext'
import { useSeo } from '../hooks/useSeo'
import { money } from '../config'

function StepsBar({ step = 1 }) {
  const steps = ['السلة', 'بيانات الطلب', 'تأكيد']
  return (
    <div className="steps-bar">
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'contents' }}>
          {i > 0 && <span className="steps-bar__sep" />}
          <span className={`steps-bar__item ${i + 1 <= step ? 'is-on' : ''}`}>
            <b>{i + 1}</b>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

export { StepsBar }

export default function Cart() {
  const { cartLines, setQty, removeFromCart, totals, settings } = useStore()

  useSeo({ title: 'سلة التسوق', description: 'مراجعة منتجات سلتك قبل إتمام الطلب.', path: '/cart' })

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <h1>سلة التسوق</h1>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <StepsBar step={1} />

          {cartLines.length === 0 ? (
            <Reveal className="panel" style={{ maxWidth: 560, marginInline: 'auto' }}>
              <EmptyState title="سلتك فارغة" text="ابدأ بإضافة الجهاز أو إحدى الباقات الموفّرة.">
                <Link to="/shop" className="btn">
                  تصفّح المنتجات
                </Link>
              </EmptyState>
            </Reveal>
          ) : (
            <div className="order-wrap">
              <div className="cart-table">
                {cartLines.map((line, i) => (
                  <Reveal className="cart-row" key={line.id} delay={i * 60}>
                    <Link to={`/product/${line.product.slug}`} className="cart-row__art">
                      <Art name={line.product.art?.[0]} photo={`${line.product.id}.jpg`} />
                    </Link>
                    <div>
                      <h3>
                        <Link to={`/product/${line.product.slug}`}>{line.product.name}</Link>
                      </h3>
                      <p className="small" style={{ margin: 0 }}>
                        {money(line.product.price)} للقطعة
                      </p>
                      <button
                        type="button"
                        className="link-danger"
                        onClick={() => removeFromCart(line.id)}
                        style={{ marginTop: 6, paddingInline: 0 }}
                      >
                        <Icon name="trash" size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> إزالة
                      </button>
                    </div>
                    <Qty value={line.qty} onChange={(q) => setQty(line.id, q)} />
                    <strong className="price" style={{ fontSize: '1.05rem' }}>
                      {money(line.lineTotal)}
                    </strong>
                  </Reveal>
                ))}
              </div>

              <Reveal className="panel panel--glow summary">
                <h3 style={{ marginBottom: 16 }}>ملخّص السلة</h3>
                <div className="summary__line">
                  <span>المجموع الفرعي</span>
                  <strong>{money(totals.subtotal)}</strong>
                </div>
                <div className="summary__line">
                  <span>تكلفة التوصيل</span>
                  <strong>{totals.delivery === 0 ? 'مجاني' : money(totals.delivery)}</strong>
                </div>
                <div className="summary__line summary__total">
                  <span>الإجمالي</span>
                  <span className="price">{money(totals.total)}</span>
                </div>

                {settings.freeDeliveryOver > 0 && totals.delivery > 0 && (
                  <p className="small" style={{ marginTop: 8 }}>
                    أضف بقيمة {money(settings.freeDeliveryOver - totals.subtotal)} للحصول على توصيل مجاني.
                  </p>
                )}

                <Link to="/checkout" className="btn btn--lg btn--block" style={{ marginTop: 18 }}>
                  متابعة إتمام الطلب
                </Link>
                <Link to="/shop" className="btn btn--ghost btn--sm btn--block" style={{ marginTop: 10 }}>
                  متابعة التسوّق
                </Link>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
