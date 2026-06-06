import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

type KpiColor = 'brand' | 'green' | 'blue' | 'red' | 'purple' | 'orange'

interface KpiCardProps {
  icon: ElementType
  label: string
  value: string | number
  sub?: string
  color?: KpiColor
  theme?: 'light' | 'dark'
}

const colorMap: Record<KpiColor, { icon: string; subText: string }> = {
  brand:  { icon: 'text-primary    bg-primary/10',    subText: 'text-primary-dark' },
  green:  { icon: 'text-green-500  bg-green-500/10',  subText: 'text-green-500'   },
  blue:   { icon: 'text-blue-400   bg-blue-400/10',   subText: 'text-blue-400'    },
  red:    { icon: 'text-red-400    bg-red-400/10',    subText: 'text-red-400'     },
  purple: { icon: 'text-purple-400 bg-purple-400/10', subText: 'text-purple-400'  },
  orange: { icon: 'text-orange-400 bg-orange-400/10', subText: 'text-orange-400'  },
}

/**
 * Card de KPI para dashboards.
 * Exibe ícone, valor principal, label e subtítulo opcional.
 */
export function KpiCard({ icon: Icon, label, value, sub, color = 'brand', theme = 'dark' }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        theme === 'dark'
          ? 'bg-surface-card border-surface-border'
          : 'bg-white border-neutral-200 shadow-card',
      )}
    >
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', c.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={cn('text-2xl font-bold leading-none', theme === 'dark' ? 'text-white' : 'text-black')}>
        {value}
      </p>
      {sub && (
        <p className={cn('mt-0.5 text-xs font-medium', c.subText)}>{sub}</p>
      )}
      <p className={cn('mt-1 text-xs', theme === 'dark' ? 'text-slate-500' : 'text-neutral-500')}>
        {label}
      </p>
    </div>
  )
}
