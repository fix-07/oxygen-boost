import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import { trackPageView } from './analytics'

/* الصفحات الثانوية تُحمّل عند الحاجة فقط — يبقى الدخول الأول سريعاً */
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const HowToUse = lazy(() => import('./pages/HowToUse'))
const About = lazy(() => import('./pages/About'))
const Faq = lazy(() => import('./pages/Faq'))
const Contact = lazy(() => import('./pages/Contact'))
const Track = lazy(() => import('./pages/Track'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Policy = lazy(() => import('./pages/Policy'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Loading() {
  return (
    <div className="container section" style={{ textAlign: 'center', minHeight: '48vh' }}>
      <p className="muted">جارٍ التحميل…</p>
    </div>
  )
}

function PageViews() {
  const { pathname } = useLocation()
  useEffect(() => trackPageView(pathname), [pathname])
  return null
}

export default function App() {
  return (
    <>
      <PageViews />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<Product />} />
            <Route path="how-to-use" element={<HowToUse />} />
            <Route path="about" element={<About />} />
            <Route path="faq" element={<Faq />} />
            <Route path="contact" element={<Contact />} />
            <Route path="track" element={<Track />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:number" element={<OrderSuccess />} />
            <Route path="shipping" element={<Policy kind="shipping" />} />
            <Route path="returns" element={<Policy kind="returns" />} />
            <Route path="privacy" element={<Policy kind="privacy" />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
