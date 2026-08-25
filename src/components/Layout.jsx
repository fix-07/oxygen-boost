import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from './Icon'
import Art from './Art'
import { EmptyState, Qty } from './ui'
import { useStore } from '../store/StoreContext'
import { SITE, money, waLink } from '../config'

const NAV = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/shop', label: 'المتجر' },
  { to: '/how-to-use', label: 'طريقة الاستخدام' },
  { to: '/#reviews', label: 'آراء العملاء', plain: true },
  { to: '/contact', label: 'تواصل معنا' },
]

/** رابط تنقّل — الروابط التي تشير إلى قسم داخل صفحة لا تأخذ حالة "نشط" */
const NavItem = ({ item, onClick }) =>
  item.plain ? (
    <Link to={item.to} onClick={onClick}>
      {item.label}
    </Link>
  ) : (
    <NavLink to={item.to} end={item.end} onClick={onClick}>
      {item.label}
    </NavLink>
  )

/* ---------------------------- التمرير للأعلى / الروابط الداخلية ---------------------------- */

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // القسم قد لا يكون موجوداً فوراً إذا كانت الصفحة تُحمّل بالكسل
      let tries = 0
      const seek = () => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 20) setTimeout(seek, 80)
      }
      setTimeout(seek, 60)
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

/* ---------------------------- الشريط الإعلاني ---------------------------- */

function TopBar() {
  return (
    <div className="topbar">
      <span>
        <i className="dot" />
        توصيل إلى مختلف المدن الليبية — الدفع عند الاستلام
      </span>
    </div>
  )
}

/* ---------------------------- شريط التنقل ---------------------------- */

function Navbar({ onMenu, menuOpen }) {
  const { cartCount, setCartOpen } = useStore()
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${stuck ? 'is-stuck' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__logo" aria-label="Oxygen Boost — الرئيسية">
          <img src="/logo.svg" alt="Oxygen Boost" width="120" height="40" />
        </Link>

        <ul className="nav__links">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        <div className="nav__actions">
          <button type="button" className="cart-btn" onClick={() => setCartOpen(true)} aria-label="سلة التسوق">
            <Icon name="cart" size={20} />
            {cartCount > 0 && <span className="cart-btn__count">{cartCount}</span>}
          </button>

          <Link to="/checkout" className="btn btn--sm">
            اطلب الآن
          </Link>

          <button
            type="button"
            className={`burger ${menuOpen ? 'is-open' : ''}`}
            onClick={onMenu}
            aria-label="القائمة"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

/* ---------------------------- قائمة الجوال ---------------------------- */

function MobileMenu({ onClose }) {
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="mobile-menu" role="dialog" aria-label="القائمة">
        <div className="mobile-menu__head">
          <img src="/logo.svg" alt="Oxygen Boost" width="114" height="38" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <Icon name="x" size={18} />
          </button>
        </div>

        <nav>
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} onClick={onClose} />
          ))}
          <NavLink to="/track" onClick={onClose}>
            تتبّع طلبك
          </NavLink>
          <NavLink to="/about" onClick={onClose}>
            من نحن
          </NavLink>
        </nav>

        <div className="mobile-menu__foot">
          <Link to="/checkout" className="btn btn--block" onClick={onClose}>
            اطلب الآن
          </Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn--wa btn--block">
            <Icon name="whatsapp" size={18} />
            تواصل عبر واتساب
          </a>
        </div>
      </aside>
    </>
  )
}

/* ---------------------------- السلة الجانبية ---------------------------- */

function CartDrawer() {
  const { cartOpen, setCartOpen, cartLines, setQty, removeFromCart, totals } = useStore()
  if (!cartOpen) return null

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer" role="dialog" aria-label="سلة التسوق">
        <div className="cart-drawer__head">
          <h3>سلة التسوق</h3>
          <button type="button" className="icon-btn" onClick={() => setCartOpen(false)} aria-label="إغلاق">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {cartLines.length === 0 ? (
            <EmptyState title="سلتك فارغة" text="أضف منتجاً لتبدأ الطلب.">
              <Link to="/shop" className="btn btn--sm" onClick={() => setCartOpen(false)}>
                تصفّح المنتجات
              </Link>
            </EmptyState>
          ) : (
            cartLines.map((line) => (
              <div className="cart-line" key={line.id}>
                <Link
                  to={`/product/${line.product.slug}`}
                  className="cart-line__art"
                  onClick={() => setCartOpen(false)}
                >
                  <Art name={line.product.art?.[0]} photo={`${line.product.id}.jpg`} />
                </Link>
                <div>
                  <div className="cart-line__name">{line.product.name}</div>
                  <div className="cart-line__price">{money(line.lineTotal)}</div>
                  <div style={{ marginTop: 8 }}>
                    <Qty value={line.qty} onChange={(q) => setQty(line.id, q)} />
                  </div>
                </div>
                <button type="button" className="link-danger" onClick={() => removeFromCart(line.id)} aria-label="حذف">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartLines.length > 0 && (
          <div className="cart-drawer__foot">
            <div className="summary__line">
              <span>المجموع الفرعي</span>
              <strong>{money(totals.subtotal)}</strong>
            </div>
            <div className="summary__line">
              <span>التوصيل</span>
              <strong>{totals.delivery === 0 ? 'مجاني' : money(totals.delivery)}</strong>
            </div>
            <div className="summary__line summary__total">
              <span>الإجمالي</span>
              <span className="price">{money(totals.total)}</span>
            </div>
            <Link to="/checkout" className="btn btn--block btn--lg" onClick={() => setCartOpen(false)}>
              إتمام الطلب
            </Link>
            <Link
              to="/cart"
              className="btn btn--ghost btn--sm btn--block"
              style={{ marginTop: 8 }}
              onClick={() => setCartOpen(false)}
            >
              عرض السلة
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

/* ---------------------------- زر واتساب + التنبيهات ---------------------------- */

function WhatsAppFab() {
  return (
    <a className="wa-fab" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="تحتاج مساعدة؟ تواصل معنا">
      <span className="wa-fab__pulse" />
      <Icon name="whatsapp" size={22} />
      <span className="wa-fab__label">تحتاج مساعدة؟ تواصل معنا</span>
    </a>
  )
}

function Toasts() {
  const { toasts } = useStore()
  if (!toasts.length) return null
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name="check-circle" size={17} style={{ color: 'var(--ok)' }} />
          {t.message}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------- الفوتر ---------------------------- */

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/logo.svg" alt="Oxygen Boost" width="234" height="78" />
            <p style={{ maxWidth: '38ch', fontSize: '0.9rem' }}>
              Oxygen Boost — تجربة تنفّس أكثر راحة بتصميم عملي يناسب أسلوب حياتك.
            </p>
            <div className="social">
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="إنستقرام">
                <Icon name="instagram" size={18} />
              </a>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="واتساب">
                <Icon name="whatsapp" size={18} />
              </a>
              <a href={`mailto:${SITE.email}`} aria-label="البريد الإلكتروني">
                <Icon name="mail" size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4>روابط سريعة</h4>
            <ul>
              <li><Link to="/shop">جميع المنتجات</Link></li>
              <li><Link to="/how-to-use">طريقة الاستخدام</Link></li>
              <li><Link to="/about">من نحن</Link></li>
              <li><Link to="/track">تتبّع طلبك</Link></li>
              <li><Link to="/contact">تواصل معنا</Link></li>
            </ul>
          </div>

          <div>
            <h4>السياسات</h4>
            <ul>
              <li><Link to="/shipping">الشحن والتوصيل</Link></li>
              <li><Link to="/returns">الاستبدال والإرجاع</Link></li>
              <li><Link to="/privacy">سياسة الخصوصية</Link></li>
              <li><Link to="/privacy#terms">شروط الاستخدام</Link></li>
            </ul>
          </div>

          <div>
            <h4>تواصل معنا</h4>
            <ul>
              <li>
                <a href={waLink()} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" size={16} /> {SITE.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" size={16} /> @{SITE.instagram}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`}>
                  <Icon name="mail" size={16} /> {SITE.email}
                </a>
              </li>
              <li>
                <span><Icon name="pin" size={16} /> توصيل داخل ليبيا</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Oxygen Boost — جميع الحقوق محفوظة.</span>
          <span>صُمّم للاستخدام الخارجي فقط · ليس بديلاً عن الاستشارة الطبية.</span>
        </div>
      </div>
    </footer>
  )
}

/* ---------------------------- الهيكل العام ---------------------------- */

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMenuOpen(false), [pathname])

  const { cartOpen } = useStore()
  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, cartOpen])

  return (
    <>
      <ScrollManager />
      <TopBar />
      <Navbar onMenu={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      <CartDrawer />
      <Toasts />

      <main>
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  )
}
