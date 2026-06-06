import type { ReactNode } from 'react'

interface TopbarProps {
  title: string
  actions?: ReactNode
}

/**
 * Barra superior da área de conteúdo (fundo branco).
 * Exibe título da página e área de ações à direita.
 */
export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-black">{title}</h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}
