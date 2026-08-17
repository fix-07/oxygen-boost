import { Link } from 'react-router-dom'
import { useState } from 'react'
import Art from './Art'
import Icon from './Icon'
import { Qty, Reveal } from './ui'
import { useStore } from '../store/StoreContext'
import { money } from '../config'

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart } = useStore()
  const [qty, setQty] = useState(1)
  const soldOut = product.stock <= 0

  return (
    <Reveal as="article" className="product-card" delay={delay}>
      <Link to={`/product/${product.slug}`} className="product-card__media" aria-label={product.name}>
        <div className="product-card__badges">
          {soldOut && <span className="badge badge--out">غير متوفر حالياً</span>}
          {!soldOut && product.badges?.map((b) => <span key={b} className="badge">{b}</span>)}
          {!soldOut && product.compareAt > product.price && (
            <span className="badge badge--soft">وفّر {money(product.compareAt - product.price)}</span>
          )}
        </div>
        <Art name={product.art?.[0]} photo={`${product.id}.jpg`} alt={product.name} />
      </Link>

      <div className="product-card__body">
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card__desc">{product.short}</p>

        <div className="product-card__row">
          <div>
            <span className="price product-card__price">{money(product.price)}</span>
            {product.compareAt > product.price && <span className="price-old">{money(product.compareAt)}</span>}
          </div>
          {!soldOut && <Qty value={qty} onChange={setQty} />}
        </div>

        <div className="product-card__actions">
          <button
            type="button"
            className="btn btn--block"
            disabled={soldOut}
            onClick={() => addToCart(product.id, qty, { open: true })}
          >
            <Icon name="cart" size={17} />
            {soldOut ? 'غير متوفر' : 'أضف إلى السلة'}
          </button>
          <Link to={`/product/${product.slug}`} className="btn btn--ghost btn--sm btn--block">
            التفاصيل
          </Link>
        </div>
      </div>
    </Reveal>
  )
}
