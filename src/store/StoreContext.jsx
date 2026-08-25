import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { ALL_ITEMS } from '../data/products'
import { SITE } from '../config'
import { api, ApiError } from '../services/api'
import { EmptyState } from '../components/ui'
import Icon from '../components/Icon'

/* -------------------------------------------------------------------------- */
/*  السلة — محلية في المتصفح فقط. هذا آمن لأنها ليست مصدر الحقيقة للسعر:      */
/*  الخادم يعيد حساب كل سعر ومجموع بشكل مستقل عند إنشاء الطلب فعلياً.        */
/* -------------------------------------------------------------------------- */

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* التخزين ممتلئ أو معطّل — نتجاهل بهدوء */
  }
}

const CART_KEY = 'ob:cart'

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'add': {
      const existing = state.find((l) => l.id === action.id)
      if (existing) {
        return state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(99, l.qty + action.qty) } : l))
      }
      return [...state, { id: action.id, qty: action.qty }]
    }
    case 'setQty':
      return state
        .map((l) => (l.id === action.id ? { ...l, qty: Math.max(0, Math.min(99, action.qty)) } : l))
        .filter((l) => l.qty > 0)
    case 'remove':
      return state.filter((l) => l.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */

const StoreContext = createContext(null)

const DEFAULT_SETTINGS = { deliveryFee: SITE.deliveryFee, freeDeliveryOver: SITE.freeDeliveryOver, currency: SITE.currency }

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => read(CART_KEY, []))
  const [cartOpen, setCartOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  /* ---------------------------- الكتالوج الحي من الخادم ---------------------------- */

  const [catalog, setCatalog] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  // الخادم المجاني (Render) قد "ينام" بعد فترة خمول ويحتاج نحو ٢٠-٣٠ ثانية للاستيقاظ،
  // فيفشل أول طلب بخطأ مؤقت. نعيد المحاولة بدل إظهار خطأ فوري لا داعي له.
  const RETRY_DELAYS_MS = [3000, 5000, 8000]

  const load = useCallback(async () => {
    setStatus('loading')
    for (let attempt = 0; ; attempt++) {
      try {
        const [{ products }, liveSettings] = await Promise.all([api.get('/products'), api.get('/settings')])
        setCatalog(products)
        setSettings(liveSettings)
        setStatus('ready')
        return
      } catch {
        if (attempt >= RETRY_DELAYS_MS.length) {
          setStatus('error')
          return
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
      }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => write(CART_KEY, cart), [cart])

  /* المنتجات — المحتوى التسويقي (المزايا، الاستخدام، الصور) ثابت في data/products.js،
     والسعر والمخزون والاسم حيّة من الخادم. أي منتج عطّله المشرف يختفي من الكتالوج تلقائياً. */
  const items = useMemo(() => {
    const live = new Map(catalog.map((p) => [p.id, p]))
    return ALL_ITEMS.filter((p) => live.has(p.id)).map((p) => {
      const l = live.get(p.id)
      return { ...p, name: l.name, price: l.price, stock: l.stock }
    })
  }, [catalog])

  const products = useMemo(() => items.filter((p) => p.type !== 'bundle'), [items])
  const bundles = useMemo(() => items.filter((p) => p.type === 'bundle'), [items])

  const getItem = useCallback((idOrSlug) => items.find((p) => p.id === idOrSlug || p.slug === idOrSlug), [items])

  /* ---------------------------- التنبيهات ---------------------------- */

  const toast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  /* ---------------------------- عمليات السلة ---------------------------- */

  const addToCart = useCallback(
    (id, qty = 1, { silent = false, open = false } = {}) => {
      const item = items.find((p) => p.id === id)
      dispatch({ type: 'add', id, qty })
      if (!silent) toast(`تمت إضافة «${item?.name || 'المنتج'}» إلى السلة`)
      if (open) setCartOpen(true)
    },
    [items, toast]
  )

  const setQty = useCallback((id, qty) => dispatch({ type: 'setQty', id, qty }), [])
  const removeFromCart = useCallback((id) => dispatch({ type: 'remove', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = getItem(line.id)
          return product ? { ...line, product, lineTotal: product.price * line.qty } : null
        })
        .filter(Boolean),
    [cart, getItem]
  )

  const cartCount = useMemo(() => cartLines.reduce((n, l) => n + l.qty, 0), [cartLines])

  /* ---------------------------- الحسابات (تقدير للعرض فقط) ---------------------------- */
  /* الحساب المعتمد يبقى دائماً داخل الخادم عند POST /orders — هذا فقط لعرض فوري للزائر */

  const totals = useMemo(() => {
    const subtotal = cartLines.reduce((n, l) => n + l.lineTotal, 0)
    let discount = 0
    let freeShipping = false

    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') discount = Math.round(subtotal * (appliedCoupon.value / 100))
      else if (appliedCoupon.type === 'fixed') discount = Math.min(subtotal, appliedCoupon.value)
      else if (appliedCoupon.type === 'shipping') freeShipping = true
    }

    const afterDiscount = Math.max(0, subtotal - discount)
    const qualifiesFree = settings.freeDeliveryOver > 0 && afterDiscount >= settings.freeDeliveryOver
    const delivery = subtotal === 0 || freeShipping || qualifiesFree ? 0 : settings.deliveryFee
    return { subtotal, discount, delivery, freeShipping: freeShipping || qualifiesFree, total: afterDiscount + delivery }
  }, [cartLines, appliedCoupon, settings])

  const applyCoupon = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setAppliedCoupon(null)
      return { ok: false, message: '' }
    }
    try {
      const res = await api.post('/coupons/validate', { code: code.trim() })
      setAppliedCoupon(res.ok ? { code: res.code, type: res.type, value: res.value } : null)
      return res
    } catch (err) {
      setAppliedCoupon(null)
      return { ok: false, message: err instanceof ApiError ? err.message : 'تعذّر التحقق من الكود.' }
    }
  }, [])

  const clearCoupon = useCallback(() => setAppliedCoupon(null), [])

  /* ---------------------------- الطلبات ---------------------------- */
  /* الطلب يُنشأ ويُسجَّل على الخادم مباشرة — السعر والمخزون والخصم تُحسب هناك حصراً */

  const createOrder = useCallback(
    async (customer, lines) => {
      const order = await api.post('/orders', {
        items: lines.map((l) => ({ productId: l.id, qty: l.qty })),
        couponCode: appliedCoupon?.code,
        customer,
      })
      return order
    },
    [appliedCoupon]
  )

  const value = {
    items,
    products,
    bundles,
    getItem,
    cart,
    cartLines,
    cartCount,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    cartOpen,
    setCartOpen,
    totals,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
    createOrder,
    settings,
    toast,
    toasts,
    status,
    reload: load,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore يجب أن يُستخدم داخل StoreProvider')
  return ctx
}

/** يحجب المحتوى فقط للصفحات التي تحتاج فعلاً بيانات حيّة من الخادم (المتجر، السلة...).
    الصفحات الثابتة (الأسئلة الشائعة، من نحن...) لا تُغلَّف بهذا، فتظهر حتى لو تعطّل الخادم. */
export function StoreGate({ children }) {
  const { status, reload } = useStore()

  if (status === 'ready') return children

  return (
    <div className="container section" style={{ textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {status === 'loading' ? (
        <p className="muted">جارٍ تحميل المتجر…</p>
      ) : (
        <EmptyState icon="alert" title="تعذّر الاتصال بالخادم" text="تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.">
          <button type="button" className="btn" onClick={reload}>
            <Icon name="refresh" size={16} />
            إعادة المحاولة
          </button>
        </EmptyState>
      )}
    </div>
  )
}
