import type { ReactNode, ElementType } from 'react'
import { Sidebar, type NavItem } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  children: ReactNode
  navItems: NavItem[]
  pageTitle: string
  topbarActions?: ReactNode
}

export type { NavItem, ElementType }

/**
 * Shell principal do app: sidebar escura à esquerda + área de conteúdo branca à direita.
 * Padrão de layout para todos os sistemas internos VerticalParts.
 *
 * Uso:
 *   <AppShell navItems={...} pageTitle="Dashboard">
 *     <p>conteúdo</p>
 *   </AppShell>
 */
export function AppShell({ children, navItems, pageTitle, topbarActions }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar navItems={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={pageTitle} actions={topbarActions} />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
