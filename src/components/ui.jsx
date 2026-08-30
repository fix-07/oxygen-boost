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

/** نافذة منبثقة عامة — أساس مشترك لأي حوار (تأكيد، نموذج...) */
export function Modal({ open, onClose, title, maxWidth = 420, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="panel panel--glow modal-box" style={{ maxWidth }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <Icon name="x" size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** حوار تأكيد — لأي عملية لها تبعات (تسجيل الخروج، الحذف...) */
export function ConfirmDialog({ open, title, text, confirmLabel = 'تأكيد', danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth={380}>
      <p className="small muted" style={{ marginBottom: 20 }}>
        {text}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={onCancel}>
          إلغاء
        </button>
        <button
          type="button"
          className={`btn btn--sm ${danger ? 'btn--danger' : ''}`}
          style={{ flex: 1 }}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? '...جارٍ' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
