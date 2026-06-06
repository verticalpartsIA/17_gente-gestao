import { cn } from '@/lib/utils'
import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** 'light' = fundo branco (área de conteúdo) | 'dark' = fundo surface (painéis escuros) */
  theme?: 'light' | 'dark'
  noPadding?: boolean
}

/**
 * Card base VerticalParts.
 * Suporta temas claro (conteúdo) e escuro (dashboard/sidebar).
 */
export function Card({ children, theme = 'light', noPadding = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        theme === 'light'
          ? 'bg-white border-neutral-200 shadow-card'
          : 'bg-surface-card border-surface-border',
        !noPadding && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Subcomponente para cabeçalho do card */
export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

/** Subcomponente para título do card */
export function CardTitle({ children, className, dark = false }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <h3 className={cn('text-sm font-semibold', dark ? 'text-white' : 'text-black', className)}>
      {children}
    </h3>
  )
}

/** Subcomponente para conteúdo do card */
export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

