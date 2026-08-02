import { useState, type ElementType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, ChevronDown, Search } from 'lucide-react'
import { useAuth, type Profile } from '@/lib/auth'
import { cn } from '@/lib/utils'

export interface SubItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href?: string
  icon: ElementType
  subItems?: SubItem[]
}

interface SidebarProps {
  navItems: NavItem[]
  collapsed?: boolean
  onToggle?: () => void
}

function UserBadge({ profile, collapsed }: { profile: Profile; collapsed: boolean }) {
  const initials = (profile.name || profile.email).slice(0, 2).toUpperCase()
  return (
    <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
        <span className="text-xs font-bold text-primary">{initials}</span>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white leading-none uppercase">{profile.name}</p>
          <p className="mt-0.5 truncate text-[10px] text-slate-500 font-mono">{profile.level}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Sidebar escura com suporte a submenus expansivos (acordeão),
 * alinhada visualmente ao design premium do Figma (pílulas flutuantes, busca e perfil minimalistas)
 * mantendo o ecossistema e funcionalidade do site da VerticalParts.
 */
export function Sidebar({ navItems, collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const collapsed = controlledCollapsed ?? internalCollapsed
  const handleToggle = onToggle ?? (() => setInternalCollapsed((c) => !c))

  const toggleSubMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  // Verifica se o submenu ou o item principal está ativo
  const isItemActive = (item: NavItem) => {
    if (item.href && location.pathname === item.href) return true
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname + location.search === sub.href || location.pathname === sub.href)
    }
    return false
  }

  // Filtra itens do menu com base na pesquisa
  const filteredNavItems = navItems.filter(item => {
    if (!searchQuery) return true
    const matchesLabel = item.label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubItems = item.subItems?.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesLabel || matchesSubItems
  })

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-[#0D0E12] border-r border-surface-border transition-all duration-200 shrink-0 select-none font-sans',
        collapsed ? 'w-[70px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center justify-between px-4 py-5 mb-2', collapsed && 'justify-center px-0')}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-[11px] font-black text-black">VP</span>
          </div>
        ) : (
          <img src="/logo-white.png" alt="VerticalParts" className="h-6 object-contain" />
        )}
      </div>

      {/* Campo de Busca Integrado (Estilo Figma) */}
      <div className="px-3 mb-4">
        {collapsed ? (
          <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-white/5 border border-surface-border text-slate-500">
            <Search className="h-3.5 w-3.5" />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar módulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-surface-border/40 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all font-sans"
            />
          </div>
        )}
      </div>

      {/* Navegação principal com pílulas flutuantes — só esta área rola;
          rodapé (usuário/Sair/Recolher) fica sempre visível */}
      <nav className="dark-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3">
        {filteredNavItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0
          const active = isItemActive(item)
          const isExpanded = expandedMenus[item.label] !== undefined ? expandedMenus[item.label] : active

          return (
            <div key={item.label} className="space-y-1">
              {hasSubItems ? (
                <div>
                  {/* Botão de Categoria Expansível */}
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 border-none outline-none',
                      collapsed && 'justify-center px-0 py-3',
                      active
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4 shrink-0", active ? 'text-primary' : 'text-slate-500')} />
                      {!collapsed && <span className="truncate uppercase tracking-wider text-[10px]">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    )}
                  </button>

                  {/* Submenu Itens */}
                  {isExpanded && !collapsed && (
                    <div className="mt-1 ml-4 border-l border-surface-border pl-3.5 space-y-1">
                      {item.subItems!.map((sub) => {
                        const isSubActive = location.pathname + location.search === sub.href || location.pathname === sub.href
                        return (
                          <NavLink
                            key={sub.href}
                            to={sub.href}
                            className={cn(
                              'flex items-center rounded-lg px-3 py-2 text-[11px] font-semibold transition-all duration-150',
                              isSubActive
                                ? 'text-primary bg-primary/5 font-bold border-l-2 border-primary -ml-[15px] pl-3.5'
                                : 'text-slate-500 hover:text-white hover:bg-white/5',
                            )}
                          >
                            <span className="truncate">{sub.label.toUpperCase()}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Link simples
                <NavLink
                  to={item.href || '#'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 border-none outline-none',
                      collapsed && 'justify-center px-0 py-3',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isItemActive(item) ? 'text-primary' : 'text-slate-500')} />
                  {!collapsed && <span className="truncate uppercase tracking-wider text-[10px]">{item.label}</span>}
                </NavLink>
              )}
            </div>
          )
        })}
      </nav>

      {/* Rodapé Minimalista (Figma Layout) */}
      <div className="border-t border-surface-border/80 p-3 space-y-2 mt-auto">
        <div className={cn("flex items-center justify-between gap-2", collapsed && "flex-col justify-center gap-3")}>
          {profile && <UserBadge profile={profile} collapsed={collapsed} />}
          
          {!collapsed ? (
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors border-none outline-none cursor-pointer"
              title="Sair"
            >
              <LogOut className="h-4 w-4 shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors border-none outline-none cursor-pointer"
              title="Sair"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>

        <button
          onClick={handleToggle}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[10px] font-bold text-slate-600 hover:bg-white/5 hover:text-white transition-colors border-none outline-none cursor-pointer',
            collapsed && 'px-0',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="tracking-wider">RECOLHER MENU</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
