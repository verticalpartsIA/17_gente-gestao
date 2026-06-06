/**
 * Design Tokens — VerticalParts
 * Fonte única de verdade para cores, tipografia e espaçamentos.
 * Use estes valores em qualquer contexto que não aceite Tailwind
 * (ex.: inline styles, canvas, PDF, e-mail).
 */

export const colors = {
  // Marca
  primary:      '#F5C400',
  primaryDark:  '#C99E00',
  primaryLight: '#FFD400',

  // Superfícies escuras
  surface:         '#0f0f0f',
  surfaceCard:     '#1a1a1f',
  surfaceElevated: '#222228',
  surfaceBorder:   'rgba(255,255,255,0.08)',

  // Texto sobre escuro
  textOnDark:       '#f1f5f9',
  textMutedOnDark:  '#94a3b8',
  textFaintOnDark:  '#475569',

  // Conteúdo claro (área principal)
  contentBg:       '#ffffff',
  contentBorder:   '#e5e7eb',
  textOnLight:     '#111111',
  textMutedOnLight:'#6b7280',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',
  info:    '#3b82f6',
} as const

export const typography = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  sizes: {
    xs:  '0.75rem',   // 12px — labels, badges
    sm:  '0.8125rem', // 13px — body small
    base:'0.875rem',  // 14px — body
    md:  '1rem',      // 16px — body large
    lg:  '1.125rem',  // 18px — subtitle
    xl:  '1.25rem',   // 20px — title
    '2xl':'1.5rem',   // 24px — h3
    '3xl':'1.875rem', // 30px — h2
    '4xl':'2.25rem',  // 36px — h1
  },
} as const

export const radius = {
  sm:  '0.25rem',  // 4px  — botões, badges
  md:  '0.5rem',   // 8px  — inputs, cards pequenos
  lg:  '0.75rem',  // 12px — cards
  xl:  '1rem',     // 16px — modais, shells
  '2xl':'1.25rem', // 20px — cards grandes
  full:'9999px',   // pill
} as const

export const shadows = {
  brand:   '0 12px 28px rgba(245,196,0,0.25)',
  brandSm: '0 4px 14px rgba(245,196,0,0.18)',
  dark:    '0 30px 80px rgba(0,0,0,0.5)',
  card:    '0 2px 8px rgba(0,0,0,0.08)',
} as const
