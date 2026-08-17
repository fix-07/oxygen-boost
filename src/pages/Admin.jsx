import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { buildWhatsAppMessage } from '../components/OrderForm'
import { useStore } from '../store/StoreContext'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useSeo } from '../hooks/useSeo'
import { ORDER_STATUSES } from '../data/content'
import { ALL_ITEMS } from '../data/products'
import { api, ApiError } from '../services/api'
import { money, waLink } from '../config'

/* -------------------------------------------------------------------------- */
/*  بوابة الدخول — تسجيل دخول حقيقي عبر الخادم (JWT)، لا كلمة مرور محلية      */
/* -------------------------------------------------------------------------- */

function Gate({ login }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(values.email.trim(), values.password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذّر تسجيل الدخول. حاول مرة أخرى.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 460 }}>
      <Reveal className="panel panel--glow">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div className="feature__icon" style={{ margin: '0 auto 16px' }}>
            <Icon name="lock" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>لوحة التحكم</h1>
          <p className="small">سجّل الدخول بحساب المشرف لإدارة المنتجات والطلبات.</p>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            <span>البريد الإلكتروني</span>
            <input
              className="input"
              type="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              dir="ltr"
              style={{ textAlign: 'right' }}
              autoFocus
              required
            />
          </label>
          <label className="field">
            <span>كلمة المرور</span>
            <input
              className={`input ${error ? 'input--err' : ''}`}
              type="password"
              value={values.password}
              onChange={(e) => {
                setValues((v) => ({ ...v, password: e.target.value }))
                setError('')
              }}
              required
            />
            {error && <em className="field-error">{error}</em>}
          </label>
          <button type="submit" className="btn btn--block btn--lg" disabled={busy}>
            {busy ? 'جارٍ الدخول…' : 'دخول'}
          </button>
        </form>

        <p className="small muted" style={{ marginTop: 18, textAlign: 'center' }}>
          حساب المشرف يُنشأ من الخادم عبر <code style={{ color: 'var(--cyan-200)' }}>npm run seed:admin</code>.
        </p>
      </Reveal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  التبويبات                                                                  */
/* -------------------------------------------------------------------------- */

function Overview({ orders, products }) {
  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled')
    return {
      count: orders.length,
      newCount: orders.filter((o) => o.status === 'new').length,
      revenue: active.reduce((n, o) => n + o.total, 0),
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    }
  }, [orders, products])

  const recent = orders.slice(0, 6)

  return (
    <>
      <div className="grid stat-grid">
        <div className="stat">
          <b>{stats.count}</b>
          <span>إجمالي الطلبات</span>
        </div>
        <div className="stat">
          <b>{stats.newCount}</b>
          <span>طلبات جديدة بانتظار التأكيد</span>
        </div>
        <div className="stat">
          <b>{money(stats.revenue)}</b>
          <span>قيمة الطلبات غير الملغاة</span>
        </div>
        <div className="stat">
          <b>{stats.lowStock}</b>
          <span>منتجات مخزونها منخفض</span>
        </div>
      </div>

      <h3>أحدث الطلبات</h3>
      {recent.length === 0 ? (
        <p className="muted">لا توجد طلبات بعد. ستظهر هنا فور وصول أول طلب.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>المدينة</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.number}>
                  <td dir="ltr" style={{ textAlign: 'right' }}>
                    {o.number}
                  </td>
                  <td>{o.customer.name}</td>
                  <td>{o.customer.city}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span className={`status-pill status-${o.status}`}>{ORDER_STATUSES[o.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function ProductsTab({ products, onUpdate }) {
  const { toast } = useStore()
  const staticById = useMemo(() => new Map(ALL_ITEMS.map((p) => [p.id, p])), [])
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    setDrafts(Object.fromEntries(products.map((p) => [p.id, { price: p.price, stock: p.stock }])))
  }, [products])

  const setDraft = (id, patch) => setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const commitNumber = async (product, field, apiField, raw) => {
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0 || value === product[field]) {
      setDraft(product.id, { [field]: product[field] })
      return
    }
    try {
      await onUpdate(product.id, { [apiField]: value })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر حفظ التعديل.')
      setDraft(product.id, { [field]: product[field] })
    }
  }

  const toggleActive = async (product) => {
    try {
      await onUpdate(product.id, { active: !product.active })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر حفظ التعديل.')
    }
  }

  return (
    <>
      <p className="small muted" style={{ marginBottom: 16 }}>
        عدّل السعر أو الكمية ثم انقر خارج الحقل لحفظ التغيير — يظهر فوراً في المتجر.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>النوع</th>
              <th>السعر</th>
              <th>الكمية</th>
              <th>نشط</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const meta = staticById.get(p.id)
              const draft = drafts[p.id] || { price: p.price, stock: p.stock }
              return (
                <tr key={p.id}>
                  <td>
                    <Link to={`/product/${meta?.slug || p.id}`} style={{ color: '#fff', fontWeight: 600 }}>
                      {p.name}
                    </Link>
                  </td>
                  <td className="small">{meta?.type === 'bundle' ? 'باقة' : meta?.type === 'pads' ? 'لصقات' : 'جهاز'}</td>
                  <td>
                    <input
                      className="cell-input"
                      type="number"
                      min="0"
                      value={draft.price}
                      onChange={(e) => setDraft(p.id, { price: e.target.value })}
                      onBlur={(e) => commitNumber(p, 'price', 'price', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="number"
                      min="0"
                      value={draft.stock}
                      onChange={(e) => setDraft(p.id, { stock: e.target.value })}
                      onBlur={(e) => commitNumber(p, 'stock', 'stock', e.target.value)}
                      style={{ borderColor: p.stock <= 10 ? 'rgba(255,107,107,.6)' : undefined }}
                    />
                  </td>
                  <td>
                    <input type="checkbox" checked={p.active} onChange={() => toggleActive(p)} title="ظاهر في المتجر" />
                  </td>
                  <td>
                    <span className={`status-pill ${p.stock > 0 ? 'status-delivered' : 'status-cancelled'}`}>
                      {p.stock > 0 ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function OrdersTab({ orders, onUpdate }) {
  const { toast } = useStore()
  const [filter, setFilter] = useState('all')

  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const changeStatus = async (number, status) => {
    try {
      await onUpdate(number, { status, read: true })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر تحديث حالة الطلب.')
    }
  }

  const markRead = async (number) => {
    try {
      await onUpdate(number, { read: true })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر التحديث.')
    }
  }

  if (!orders.length) {
    return <p className="muted">لا توجد طلبات بعد.</p>
  }

  return (
    <>
      <div className="admin-tabs" style={{ marginBottom: 18 }}>
        <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
          الكل ({orders.length})
        </button>
        {Object.entries(ORDER_STATUSES).map(([key, label]) => {
          const n = orders.filter((o) => o.status === key).length
          return (
            <button key={key} type="button" className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>
              {label} ({n})
            </button>
          )
        })}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>التاريخ</th>
              <th>العميل</th>
              <th>المنتجات</th>
              <th>الإجمالي</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.number} style={{ background: o.read ? undefined : 'rgba(34,190,255,.05)' }}>
                <td dir="ltr" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {!o.read && <span className="badge badge--soft" style={{ marginInlineEnd: 6 }}>جديد</span>}
                  {o.number}
                </td>
                <td className="small" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(o.createdAt).toLocaleDateString('ar-LY')}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{o.customer.name}</div>
                  <div className="small" dir="ltr" style={{ textAlign: 'right' }}>
                    {o.customer.phone}
                  </div>
                  <div className="small">
                    {o.customer.city} — {o.customer.address}
                  </div>
                </td>
                <td className="small">
                  {o.items.map((i) => (
                    <div key={i.id}>
                      {i.name} × {i.qty}
                    </div>
                  ))}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{money(o.total)}</td>
                <td>
                  <select
                    className="cell-input"
                    style={{ width: 120 }}
                    value={o.status}
                    onChange={(e) => changeStatus(o.number, e.target.value)}
                  >
                    {Object.entries(ORDER_STATUSES).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a
                      href={waLink(buildWhatsAppMessage(o))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      title="فتح الطلب في واتساب"
                    >
                      <Icon name="whatsapp" size={16} />
                    </a>
                    {!o.read && (
                      <button type="button" className="icon-btn" title="تعليم كمقروء" onClick={() => markRead(o.number)}>
                        <Icon name="check" size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function CouponsTab({ coupons, onSave, onDelete }) {
  const { toast } = useStore()
  const [draft, setDraft] = useState({ code: '', type: 'percent', value: 10, note: '', active: true })
  const [busy, setBusy] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    if (!draft.code.trim()) return
    setBusy(true)
    try {
      await onSave({ ...draft, code: draft.code.trim().toUpperCase(), value: Number(draft.value) })
      toast(`تم حفظ الكود ${draft.code.toUpperCase()}`)
      setDraft({ code: '', type: 'percent', value: 10, note: '', active: true })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر حفظ الكود.')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (c) => {
    try {
      await onSave({ ...c, active: !c.active })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر التحديث.')
    }
  }

  const remove = async (code) => {
    try {
      await onDelete(code)
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر حذف الكود.')
    }
  }

  return (
    <>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr>
              <th>الكود</th>
              <th>النوع</th>
              <th>القيمة</th>
              <th>الوصف</th>
              <th>مفعّل</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  لا توجد أكواد خصم.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.code}>
                <td dir="ltr" style={{ textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                  {c.code}
                </td>
                <td className="small">
                  {c.type === 'percent' ? 'نسبة مئوية' : c.type === 'fixed' ? 'مبلغ ثابت' : 'توصيل مجاني'}
                </td>
                <td>{c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? money(c.value) : '—'}</td>
                <td className="small">{c.note}</td>
                <td>
                  <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} />
                </td>
                <td>
                  <button type="button" className="icon-btn" onClick={() => remove(c.code)} title="حذف">
                    <Icon name="trash" size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="panel" onSubmit={add} style={{ maxWidth: 640 }}>
        <h3 style={{ marginBottom: 16 }}>إضافة كود خصم</h3>
        <div className="form-row">
          <label className="field">
            <span>الكود</span>
            <input
              className="input"
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              placeholder="OXY10"
              dir="ltr"
              style={{ textAlign: 'right' }}
            />
          </label>
          <label className="field">
            <span>النوع</span>
            <select className="select" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
              <option value="percent">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="shipping">توصيل مجاني</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>القيمة</span>
            <input
              className="input"
              type="number"
              min="0"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              disabled={draft.type === 'shipping'}
            />
          </label>
          <label className="field">
            <span>الوصف</span>
            <input
              className="input"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="خصم ترحيبي"
            />
          </label>
        </div>
        <button type="submit" className="btn" disabled={busy}>
          <Icon name="plus" size={17} />
          {busy ? 'جارٍ الحفظ…' : 'حفظ الكود'}
        </button>
      </form>
    </>
  )
}

function SettingsTab({ settings, onSaveSettings, onLogout }) {
  const { toast } = useStore()
  const [draft, setDraft] = useState(settings)
  const [busy, setBusy] = useState(false)
  const [notif, setNotif] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')

  useEffect(() => setDraft(settings), [settings])

  const askNotif = async () => {
    if (typeof Notification === 'undefined') return
    const res = await Notification.requestPermission()
    setNotif(res)
    if (res === 'granted') toast('تم تفعيل إشعارات المتصفح')
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSaveSettings({ deliveryFee: Number(draft.deliveryFee), freeDeliveryOver: Number(draft.freeDeliveryOver) })
      toast('تم حفظ إعدادات الشحن')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'تعذّر حفظ الإعدادات.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
      <form className="panel" onSubmit={save}>
        <h3 style={{ marginBottom: 16 }}>الشحن</h3>
        <label className="field">
          <span>تكلفة التوصيل</span>
          <input
            className="input"
            type="number"
            min="0"
            value={draft.deliveryFee}
            onChange={(e) => setDraft({ ...draft, deliveryFee: e.target.value })}
          />
        </label>
        <label className="field">
          <span>توصيل مجاني للطلبات فوق (0 = معطّل)</span>
          <input
            className="input"
            type="number"
            min="0"
            value={draft.freeDeliveryOver}
            onChange={(e) => setDraft({ ...draft, freeDeliveryOver: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn--sm" disabled={busy}>
          {busy ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        <p className="small muted" style={{ marginTop: 10 }}>يُطبَّق فوراً على كل الطلبات الجديدة.</p>
      </form>

      <div className="panel">
        <h3 style={{ marginBottom: 16 }}>الإشعارات</h3>
        <p className="small">فعّل إشعارات المتصفح لتصلك تنبيه فوري عند وصول طلب جديد أثناء فتح الموقع.</p>
        <p className="small">
          الحالة الحالية:{' '}
          <strong style={{ color: notif === 'granted' ? 'var(--ok)' : 'var(--warn)' }}>
            {notif === 'granted' ? 'مفعّلة' : notif === 'denied' ? 'مرفوضة من المتصفح' : 'غير مفعّلة'}
          </strong>
        </p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={askNotif} disabled={notif === 'granted'}>
          تفعيل الإشعارات
        </button>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 16 }}>حساب المشرف</h3>
        <p className="small">
          لتغيير كلمة مرور المشرف، حدّث <code style={{ color: 'var(--cyan-200)' }}>ADMIN_PASSWORD</code> في ملف{' '}
          <code style={{ color: 'var(--cyan-200)' }}>server/.env</code> ثم شغّل{' '}
          <code style={{ color: 'var(--cyan-200)' }}>npm run seed:admin</code> من الخادم.
        </p>
        <hr className="divider" style={{ margin: '20px 0' }} />
        <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={onLogout}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: 'chart' },
  { id: 'products', label: 'المنتجات والأسعار', icon: 'box' },
  { id: 'orders', label: 'الطلبات', icon: 'package' },
  { id: 'coupons', label: 'أكواد الخصم', icon: 'ticket' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings' },
]

export default function Admin() {
  const auth = useAdminAuth()
  const [tab, setTab] = useState('overview')

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [coupons, setCoupons] = useState([])
  const [settings, setSettings] = useState(null)
  const [loadState, setLoadState] = useState('idle') // 'idle' | 'loading' | 'ready' | 'error'
  const [loadError, setLoadError] = useState('')

  useSeo({ title: 'لوحة التحكم', description: 'إدارة المنتجات والطلبات وأكواد الخصم.', path: '/admin' })

  /* منع فهرسة اللوحة */
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const loadAll = useCallback(async () => {
    setLoadState('loading')
    setLoadError('')
    try {
      const [{ products }, { orders }, { coupons }, liveSettings] = await Promise.all([
        auth.get('/admin/products'),
        auth.get('/admin/orders?limit=200'),
        auth.get('/admin/coupons'),
        api.get('/settings'),
      ])
      setProducts(products)
      setOrders(orders)
      setCoupons(coupons)
      setSettings(liveSettings)
      setLoadState('ready')
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'تعذّر تحميل بيانات اللوحة.')
      setLoadState('error')
    }
  }, [auth])

  useEffect(() => {
    if (auth.isAuthed) loadAll()
  }, [auth.isAuthed, loadAll])

  const updateProduct = useCallback(
    async (id, patch) => {
      const { product } = await auth.patch(`/admin/products/${encodeURIComponent(id)}`, patch)
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)))
      return product
    },
    [auth]
  )

  const updateOrder = useCallback(
    async (number, patch) => {
      const { order } = await auth.patch(`/admin/orders/${encodeURIComponent(number)}`, patch)
      setOrders((prev) => prev.map((o) => (o.number === number ? order : o)))
      return order
    },
    [auth]
  )

  const saveCoupon = useCallback(
    async (coupon) => {
      const { coupon: saved } = await auth.post('/admin/coupons', coupon)
      setCoupons((prev) => {
        const i = prev.findIndex((c) => c.code === saved.code)
        if (i === -1) return [...prev, saved]
        const next = [...prev]
        next[i] = saved
        return next
      })
      return saved
    },
    [auth]
  )

  const deleteCoupon = useCallback(
    async (code) => {
      await auth.delete(`/admin/coupons/${encodeURIComponent(code)}`)
      setCoupons((prev) => prev.filter((c) => c.code !== code))
    },
    [auth]
  )

  const saveSettings = useCallback(
    async (patch) => {
      const updated = await auth.patch('/admin/settings', patch)
      setSettings(updated)
      return updated
    },
    [auth]
  )

  if (!auth.isAuthed) return <Gate login={auth.login} />

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <p className="muted">جارٍ تحميل بيانات اللوحة…</p>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div className="notice" style={{ display: 'inline-flex' }}>
          <Icon name="alert" size={19} />
          <p>{loadError}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={loadAll}>
            <Icon name="refresh" size={16} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  const unread = orders.filter((o) => !o.read).length

  return (
    <div className="container admin-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', marginBottom: 2 }}>لوحة التحكم</h1>
          <p className="small muted" style={{ margin: 0 }}>
            {unread > 0 ? `لديك ${unread} طلب جديد بانتظار المراجعة` : 'كل الطلبات مُراجَعة'}
          </p>
        </div>
        <Link to="/" className="btn btn--ghost btn--sm">
          <Icon name="arrow-back" size={16} />
          العودة للمتجر
        </Link>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'orders' && unread > 0 && ` (${unread})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview orders={orders} products={products} />}
      {tab === 'products' && <ProductsTab products={products} onUpdate={updateProduct} />}
      {tab === 'orders' && <OrdersTab orders={orders} onUpdate={updateOrder} />}
      {tab === 'coupons' && <CouponsTab coupons={coupons} onSave={saveCoupon} onDelete={deleteCoupon} />}
      {tab === 'settings' && <SettingsTab settings={settings} onSaveSettings={saveSettings} onLogout={auth.logout} />}
    </div>
  )
}
