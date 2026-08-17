import { useState } from 'react'
import Icon from './Icon'
import { useReveal } from '../hooks/useReveal'

/** غلاف حركة الظهور عند التمرير */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} data-delay={delay} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionHead({ eyebrow, title, text, children }) {
  return (
    <Reveal className="section-head">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h2>{title}</h2>}
      {text && <p>{text}</p>}
      {children}
    </Reveal>
  )
}

export function Stars({ value = 5, size = 15 }) {
  return (
    <span className="review__stars" aria-label={`${value} من 5 نجوم`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} style={{ opacity: i < value ? 1 : 0.25 }} />
      ))}
    </span>
  )
}

export function Qty({ value, onChange, min = 1, max = 99, large = false }) {
  return (
    <div className={`qty ${large ? 'qty--lg' : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="إنقاص الكمية">
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="زيادة الكمية">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

export function Accordion({ items, singleOpen = true }) {
  const [open, setOpen] = useState(() => new Set())

  const toggle = (i) =>
    setOpen((prev) => {
      const next = singleOpen ? new Set() : new Set(prev)
      if (!prev.has(i)) next.add(i)
      return next
    })

  return (
    <div className="faq">
      {items.map((item, i) => {
        const isOpen = open.has(i)
        return (
          <Reveal key={item.q} className={`acc ${isOpen ? 'is-open' : ''}`} delay={i * 40}>
            <button type="button" className="acc__q" onClick={() => toggle(i)} aria-expanded={isOpen}>
              <span>{item.q}</span>
              <span className="acc__icon">
                <Icon name="chevron" size={15} />
              </span>
            </button>
            <div className="acc__a">
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export function Notice({ children }) {
  return (
    <div className="notice">
      <Icon name="alert" size={19} />
      <p>{children}</p>
    </div>
  )
}

export function EmptyState({ icon = 'cart', title, text, children }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={46} stroke={1.3} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}
