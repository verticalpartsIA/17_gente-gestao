import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'admin'      // Administrador
  | 'leader'     // Lider
  | 'collaborator' // Colaborador
  | 'active'
  | 'inactive'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default:      'bg-neutral-100 text-neutral-700 border-neutral-200',
  success:      'bg-green-50    text-green-700   border-green-200',
  warning:      'bg-amber-50    text-amber-700   border-amber-200',
  danger:       'bg-red-50      text-red-700     border-red-200',
  info:         'bg-blue-50     text-blue-700    border-blue-200',
  admin:        'bg-primary/15  text-yellow-800  border-primary/30',
  leader:       'bg-blue-50     text-blue-700    border-blue-200',
  collaborator: 'bg-slate-100   text-slate-600   border-slate-200',
  active:       'bg-green-50    text-green-700   border-green-200',
  inactive:     'bg-red-50      text-red-600     border-red-200',
}

/**
 * Badge / etiqueta de status.
 * Usado para níveis de usuário, status de registros, etc.
 */
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
