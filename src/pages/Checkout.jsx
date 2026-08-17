import { Link } from 'react-router-dom'
import OrderForm from '../components/OrderForm'
import Icon from '../components/Icon'
import { EmptyState, Reveal } from '../components/ui'
import { StepsBar } from './Cart'
import { useStore } from '../store/StoreContext'
import { useSeo } from '../hooks/useSeo'
import { SITE } from '../config'

export default function Checkout() {
  const { cartLines } = useStore()

  useSeo({
    title: 'إتمام الطلب',
    description: 'أكمل طلبك في خطوات قليلة — الدفع عند الاستلام وتوصيل داخل ليبيا.',
    path: '/checkout',
  })

  return (
    <>
      <div className="container page-head">
        <Reveal>
          <span className="eyebrow">خطوة واحدة تفصلك</span>
          <h1>إتمام الطلب</h1>
          <p>بدون تسجيل حساب — املأ بياناتك وسيتواصل معك فريقنا لتأكيد الطلب وموعد التسليم.</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <StepsBar step={2} />

          {cartLines.length === 0 ? (
            <Reveal className="panel" style={{ maxWidth: 620, marginInline: 'auto' }}>
              <EmptyState title="لا توجد منتجات في السلة" text="اختر منتجاً أو باقة أولاً، أو استخدم الطلب السريع من الصفحة الرئيسية.">
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/shop" className="btn">
                    تصفّح المنتجات
                  </Link>
                  <Link to="/#order" className="btn btn--ghost">
                    الطلب السريع
                  </Link>
                </div>
              </EmptyState>
            </Reveal>
          ) : (
            <>
              <Reveal>
                <OrderForm mode="checkout" />
              </Reveal>

              <Reveal
                style={{
                  display: 'flex',
                  gap: 22,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: 34,
                  color: 'var(--muted)',
                  fontSize: '0.85rem',
                }}
              >
                <span>
                  <Icon name="lock" size={15} style={{ display: 'inline', verticalAlign: '-3px' }} /> بياناتك تُستخدم
                  لتنفيذ الطلب فقط
                </span>
                <span>
                  <Icon name="truck" size={15} style={{ display: 'inline', verticalAlign: '-3px' }} />{' '}
                  {SITE.deliveryDays}
                </span>
                <span>
                  <Icon name="wallet" size={15} style={{ display: 'inline', verticalAlign: '-3px' }} /> الدفع عند
                  الاستلام
                </span>
              </Reveal>
            </>
          )}
        </div>
      </section>
    </>
  )
}
