import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Reveal } from '../components/ui'
import { useSeo } from '../hooks/useSeo'

export default function NotFound() {
  useSeo({ title: 'الصفحة غير موجودة', description: 'الرابط الذي فتحته غير متاح.', path: '/404' })

  return (
    <div className="container success">
      <Reveal>
        <h1 style={{ fontSize: 'clamp(3rem, 12vw, 6rem)' }} className="gradient-text">
          404
        </h1>
        <h2>الصفحة غير موجودة</h2>
        <p>الرابط الذي فتحته غير متاح أو تم تغييره.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn">
            <Icon name="arrow-back" size={18} />
            العودة للرئيسية
          </Link>
          <Link to="/shop" className="btn btn--ghost">
            تصفّح المنتجات
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
