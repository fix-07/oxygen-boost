import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import { trackPageView } from './analytics'
import { StoreGate } from './store/StoreContext'

/* الصفحات الثانوية تُحمّل عند الحاجة فقط — يبقى الدخول الأول سريعاً */
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const HowToUse = lazy(() => import('./pages/HowToUse'))
const About = lazy(() => import('./pages/About'))
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
            <Route
              index
              element={
                <StoreGate>
                  <Home />
                </StoreGate>
              }
            />
            <Route
              path="shop"
              element={
                <StoreGate>
                  <Shop />
                </StoreGate>
              }
            />
            <Route
              path="product/:slug"
              element={
                <StoreGate>
                  <Product />
                </StoreGate>
              }
            />
            <Route path="how-to-use" element={<HowToUse />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="track" element={<Track />} />
            <Route
              path="cart"
              element={
                <StoreGate>
                  <Cart />
                </StoreGate>
              }
            />
            <Route
              path="checkout"
              element={
                <StoreGate>
                  <Checkout />
                </StoreGate>
              }
            />
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
