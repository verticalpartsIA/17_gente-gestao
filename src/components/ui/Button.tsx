import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-black font-bold hover:bg-primary-light hover:shadow-brand active:bg-primary-dark disabled:opacity-60',
  secondary:
    'bg-surface text-white font-semibold hover:bg-surface-card border border-surface-border disabled:opacity-50',
  outline:
    'border-2 border-primary text-black font-semibold hover:bg-primary/10 active:bg-primary/20 disabled:opacity-50',
  ghost:
    'text-neutral-700 font-medium hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50',
  danger:
    'bg-danger text-white font-bold hover:bg-red-600 active:bg-red-700 disabled:opacity-60',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8  px-3.5  text-xs  gap-1.5 rounded',
  md: 'h-11 px-5    text-sm  gap-2   rounded',
  lg: 'h-13 px-6    text-sm  gap-2.5 rounded',
}

/**
 * Botão padrão VerticalParts.
 * Variantes: primary (dourado) | secondary | outline | ghost | danger
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, children, className, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150',
        '-translate-y-0 hover:-translate-y-0.5 active:translate-y-0',
        variantClasses[variant],
        sizeClasses[size],
        'disabled:cursor-not-allowed disabled:!translate-y-0 disabled:!shadow-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
})
