import { useId, useState } from 'react'
import { photoSrc } from '../data/photos'

/**
 * رسومات المنتج والمشاهد — SVG خفيفة تتبع هوية العلامة (أسود + أزرق).
 * لاستبدالها بصور حقيقية: ضع الملف في public/photos/ ثم سجّل اسمه
 * في src/data/photos.js — وسيعرضه الموقع تلقائياً بدل الرسم.
 */

const Defs = ({ uid }) => (
  <defs>
    <linearGradient id={`${uid}-blue`} x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stopColor="#0e63e6" />
      <stop offset="1" stopColor="#22e6ff" />
    </linearGradient>
    <linearGradient id={`${uid}-dark`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2b3444" />
      <stop offset="0.45" stopColor="#0f141d" />
      <stop offset="1" stopColor="#05080e" />
    </linearGradient>
    <linearGradient id={`${uid}-pad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f2d4b4" />
      <stop offset="1" stopColor="#dcb289" />
    </linearGradient>
    <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#1e8bf5" stopOpacity="0.55" />
      <stop offset="1" stopColor="#1e8bf5" stopOpacity="0" />
    </radialGradient>
  </defs>
)

/* ----------------------------- رسومات المنتج ----------------------------- */

function DeviceArt({ uid, angled = false }) {
  return (
    <g transform={angled ? 'rotate(-14 200 200)' : undefined}>
      <ellipse cx="200" cy="212" rx="150" ry="110" fill={`url(#${uid}-glow)`} />
      {/* الظل */}
      <ellipse cx="200" cy="288" rx="118" ry="16" fill="#000" opacity="0.5" />
      {/* الجسم الأساسي */}
      <path
        d="M92 236 Q200 132 308 236"
        fill="none"
        stroke={`url(#${uid}-dark)`}
        strokeWidth="52"
        strokeLinecap="round"
      />
      <path d="M92 236 Q200 132 308 236" fill="none" stroke="#000" strokeWidth="52" strokeLinecap="round" opacity="0.35" />
      {/* اللمعة العلوية */}
      <path
        d="M112 224 Q200 148 288 224"
        fill="none"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.16"
      />
      {/* انعكاس أزرق */}
      <path
        d="M126 246 Q200 176 274 246"
        fill="none"
        stroke={`url(#${uid}-blue)`}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* نقاط التثبيت المغناطيسي */}
      <circle cx="96" cy="234" r="12" fill={`url(#${uid}-blue)`} opacity="0.85" />
      <circle cx="304" cy="234" r="12" fill={`url(#${uid}-blue)`} opacity="0.85" />
      <circle cx="96" cy="234" r="20" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="1.5" opacity="0.4" />
      <circle cx="304" cy="234" r="20" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="1.5" opacity="0.4" />
    </g>
  )
}

function PadsArt({ uid, sheets = 1 }) {
  const Sheet = ({ x, y, r = 0, o = 1 }) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`} opacity={o}>
      <rect x="0" y="0" width="118" height="228" rx="10" fill="#f7f9fc" />
      <rect x="0" y="0" width="118" height="228" rx="10" fill="none" stroke="#c9d4e2" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1].map((col) => (
          <g key={`${row}-${col}`} transform={`translate(${18 + col * 47} ${20 + row * 43})`}>
            <circle cx="21" cy="21" r="20" fill={`url(#${uid}-pad)`} />
            <circle cx="21" cy="21" r="20" fill="none" stroke="#c9a06a" strokeWidth="0.8" opacity="0.6" />
            <circle cx="21" cy="21" r="8" fill="#c8a94f" />
            <circle cx="18" cy="18" r="3" fill="#fff" opacity="0.45" />
          </g>
        ))
      )}
    </g>
  )

  return (
    <g>
      <ellipse cx="200" cy="200" rx="160" ry="130" fill={`url(#${uid}-glow)`} />
      {sheets > 1 && <Sheet x={78} y={98} r={-9} o={0.55} />}
      {sheets > 1 && <Sheet x={200} y={92} r={9} o={0.55} />}
      <Sheet x={141} y={86} />
    </g>
  )
}

function KitArt({ uid }) {
  return (
    <g>
      <ellipse cx="200" cy="210" rx="170" ry="130" fill={`url(#${uid}-glow)`} />
      {/* العلبة */}
      <rect x="72" y="96" width="152" height="212" rx="12" fill="#f4f7fb" />
      <rect x="72" y="96" width="152" height="212" rx="12" fill="none" stroke="#c3cedd" strokeWidth="1.5" />
      <rect x="72" y="96" width="152" height="116" rx="12" fill={`url(#${uid}-dark)`} opacity="0.9" />
      <path d="M72 190h152v22H72z" fill={`url(#${uid}-blue)`} opacity="0.9" />
      <circle cx="196" cy="182" r="34" fill="#0e9f6e" />
      <text x="196" y="178" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700" fontFamily="Cairo, sans-serif">
        15
      </text>
      <text x="196" y="196" textAnchor="middle" fill="#d9ffe9" fontSize="9" fontFamily="Cairo, sans-serif">
        يوم
      </text>
      <text x="88" y="238" fill="#0d1522" fontSize="17" fontWeight="800" fontFamily="Cairo, sans-serif">
        Starter Kit
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x="88" y={252 + i * 15} width={110 - i * 14} height="5" rx="2.5" fill="#b9c6d6" />
      ))}
      {/* شرائح اللصقات */}
      {[0, 1].map((s) => (
        <g key={s} transform={`translate(${240 + s * 40} ${104 + s * 10})`}>
          <rect x="0" y="0" width="52" height="150" rx="7" fill="#f7f9fc" stroke="#c9d4e2" strokeWidth="1.2" />
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={row} transform={`translate(11 ${11 + row * 28})`}>
              <circle cx="15" cy="13" r="12" fill={`url(#${uid}-pad)`} />
              <circle cx="15" cy="13" r="5" fill="#c8a94f" />
            </g>
          ))}
        </g>
      ))}
      {/* الجهاز أمام العلبة */}
      <g transform="translate(0 78) scale(0.62) translate(60 0)">
        <path d="M92 236 Q200 132 308 236" fill="none" stroke="#0b0f17" strokeWidth="52" strokeLinecap="round" />
        <path
          d="M112 224 Q200 148 288 224"
          fill="none"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.16"
        />
      </g>
    </g>
  )
}

/* ----------------------------- مشاهد الاستخدام ----------------------------- */

const SCENES = {
  sport: (uid) => (
    <g>
      <path d="M96 150h30v-26h22v26h104v-26h22v26h30v22h-30v26h-22v-26H252v26h-22v-26H126v26h-22v-26H74v-22z" fill={`url(#${uid}-blue)`} opacity="0.9" transform="translate(0 -10)" />
      <path d="M40 226q80-34 160 0t160-26" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="3" opacity="0.35" />
      <path d="M40 250q80-34 160 0t160-26" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="2" opacity="0.2" />
    </g>
  ),
  sleep: (uid) => (
    <g>
      <path
        d="M232 66a76 76 0 1 0 62 120A62 62 0 0 1 232 66z"
        fill={`url(#${uid}-blue)`}
        opacity="0.92"
        transform="translate(-30 -6)"
      />
      <g fill="#8ff2ff" opacity="0.8">
        <path d="M108 76l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" />
        <path d="M300 128l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" opacity="0.7" />
      </g>
      <path d="M40 236q80-30 160 0t160-22" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="3" opacity="0.3" />
      <rect x="60" y="252" width="280" height="10" rx="5" fill={`url(#${uid}-blue)`} opacity="0.25" />
    </g>
  ),
  run: (uid) => (
    <g>
      <g fill={`url(#${uid}-blue)`} opacity="0.92" transform="translate(112 44) scale(1.25)">
        <circle cx="70" cy="24" r="17" />
        <path d="M64 46c14-5 27 3 30 16l5 25 21 15c7 5 8 14 3 20s-14 7-20 2l-25-18a17 17 0 0 1-7-10l-2-9-10 22 14 26c4 8 1 17-7 21s-17-1-21-8l-17-33c-2-5-2-10 0-15l15-35c3-9 10-15 21-19z" />
        <path d="M52 116l-24 20c-7 6-16 5-21-2s-4-16 3-21l22-18z" />
      </g>
      <g stroke={`url(#${uid}-blue)`} strokeWidth="4" strokeLinecap="round" opacity="0.45">
        <path d="M40 108h58M28 140h44M46 172h38" />
      </g>
      <path d="M30 258h340" stroke={`url(#${uid}-blue)`} strokeWidth="3" opacity="0.3" strokeDasharray="18 14" />
    </g>
  ),
  travel: (uid) => (
    <g>
      <path
        d="M60 168l286-72a16 16 0 0 1 8 30l-52 22-40 84-26 8 12-74-58 24-18 34-20 6 8-42-34-18z"
        fill={`url(#${uid}-blue)`}
        opacity="0.92"
      />
      <path
        d="M40 232q60-26 110-6t110 4 100-24"
        fill="none"
        stroke={`url(#${uid}-blue)`}
        strokeWidth="3"
        opacity="0.35"
        strokeDasharray="12 10"
      />
      <g fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="2.5" opacity="0.28">
        <circle cx="322" cy="212" r="34" />
        <path d="M288 212h68M322 178c14 14 14 54 0 68M322 178c-14 14-14 54 0 68" />
      </g>
    </g>
  ),
}

/* ----------------------------- قبل / بعد ----------------------------- */

export function NoseFlowArt({ open = false }) {
  const uid = useId().replace(/:/g, '')
  const rx = open ? 20 : 11
  const ry = open ? 13 : 8
  const flow = open ? '#22e6ff' : '#5a6b82'
  const width = open ? 7 : 3.5

  return (
    <svg viewBox="0 0 300 250" width="100%" style={{ maxWidth: 260 }} role="img" aria-label={open ? 'تدفق هواء أوسع' : 'تدفق هواء أضيق'}>
      <defs>
        <linearGradient id={`${uid}-f`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={flow} stopOpacity="0.15" />
          <stop offset="1" stopColor={flow} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* شكل الأنف */}
      <path
        d="M150 34c-22 32-36 76-42 106-7 32 8 54 42 54s49-22 42-54c-6-30-20-74-42-106z"
        fill="rgba(255,255,255,0.045)"
        stroke="rgba(140,190,255,0.35)"
        strokeWidth="2"
      />

      {/* موسّع الأنف مثبّت */}
      {open && (
        <>
          <path d="M96 170q54-34 108 0" fill="none" stroke="#0b0f17" strokeWidth="15" strokeLinecap="round" />
          <path d="M104 168q46-27 92 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
          <circle cx="97" cy="169" r="5" fill="#22e6ff" />
          <circle cx="203" cy="169" r="5" fill="#22e6ff" />
        </>
      )}

      {/* فتحتا الأنف */}
      <ellipse cx="126" cy="188" rx={rx} ry={ry} fill="#03060c" stroke={flow} strokeWidth="1.6" />
      <ellipse cx="174" cy="188" rx={rx} ry={ry} fill="#03060c" stroke={flow} strokeWidth="1.6" />

      {/* أسهم تدفق الهواء */}
      {[126, 174].map((x) => (
        <g key={x}>
          <path
            d={`M${x} 240 L${x} 202`}
            stroke={`url(#${uid}-f)`}
            strokeWidth={width}
            strokeLinecap="round"
            fill="none"
          />
          <path d={`M${x - 6} 210 L${x} 200 L${x + 6} 210`} stroke={flow} strokeWidth={width * 0.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  )
}

/* ----------------------------- موجات الهيرو ----------------------------- */

export function HeroWaves() {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className="hero__waves" viewBox="0 0 1440 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0e4fd0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#22e6ff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#0e4fd0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M-100 ${210 + i * 62} C 260 ${120 + i * 62}, 560 ${330 + i * 58}, 900 ${230 + i * 60} S 1400 ${
            120 + i * 64
          }, 1560 ${250 + i * 58}`}
          fill="none"
          stroke={`url(#${uid}-w)`}
          strokeWidth={1.6 - i * 0.15}
          opacity={0.55 - i * 0.07}
        >
          <animate
            attributeName="stroke-dasharray"
            values="0 2400; 900 2400; 0 2400"
            dur={`${14 + i * 3}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
    </svg>
  )
}

/* ----------------------------- المكوّن الرئيسي ----------------------------- */

const PRODUCT_ART = {
  device: (uid) => <DeviceArt uid={uid} />,
  'device-angle': (uid) => <DeviceArt uid={uid} angled />,
  kit: (uid) => <KitArt uid={uid} />,
  pads: (uid) => <PadsArt uid={uid} />,
  'pads-sheet': (uid) => <PadsArt uid={uid} sheets={3} />,
}

export default function Art({ name = 'device', className, photo, alt = '' }) {
  const uid = useId().replace(/:/g, '')
  const src = photoSrc(photo)
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )
  }

  const scene = SCENES[name]
  const product = PRODUCT_ART[name]

  return (
    <svg
      viewBox={scene ? '0 0 400 300' : '0 0 400 400'}
      className={className}
      preserveAspectRatio={scene ? 'xMidYMid slice' : 'xMidYMid meet'}
      aria-hidden="true"
    >
      <Defs uid={uid} />
      {scene ? scene(uid) : product ? product(uid) : PRODUCT_ART.device(uid)}
    </svg>
  )
}
