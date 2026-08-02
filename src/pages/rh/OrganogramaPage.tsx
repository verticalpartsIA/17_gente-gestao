import { useEffect, useState, useMemo } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Building2,
  Network,
  UserCheck,
  X,
  Loader2,
} from 'lucide-react'

// ── Dados reais — tabela profiles (Supabase, projeto compartilhado com o vpsistema) ─

interface ProfileRow {
  id: string
  name: string
  department: string
  is_department_lead: boolean
  avatar_url: string | null
  manager_id: string | null
}

interface OrgNode extends ProfileRow {
  reports: OrgNode[]
}

const DEPT_COLORS: Record<string, string> = {
  'CEO':                                   '#F5C400',
  'Comercial':                             '#DC2626',
  'Marketing':                             '#EA580C',
  'Engenharia':                            '#2563EB',
  'Jurídico/Importação/Suprimentos':       '#7C3AED',
  'Adm/Financeiro':                        '#0891B2',
  'Logística/Almoxarifado/Produção':       '#0D9488',
  'Gente & Gestão':                        '#DB2777',
}
const FALLBACK_COLOR = '#595E6B'

function deptColor(dept: string) {
  return DEPT_COLORS[dept] ?? FALLBACK_COLOR
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function buildTree(rows: ProfileRow[]): OrgNode | null {
  const byId = new Map<string, OrgNode>(rows.map(r => [r.id, { ...r, reports: [] }]))
  let root: OrgNode | null = null
  for (const row of rows) {
    const node = byId.get(row.id)!
    if (row.manager_id && byId.has(row.manager_id)) {
      byId.get(row.manager_id)!.reports.push(node)
    } else {
      root = node
    }
  }
  return root
}

function treeDepth(node: OrgNode): number {
  if (node.reports.length === 0) return 1
  return 1 + Math.max(...node.reports.map(treeDepth))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ node, size }: { node: OrgNode; size: number }) {
  if (node.avatar_url) {
    return (
      <img
        src={node.avatar_url}
        alt={node.name}
        className="rounded-full object-cover shadow-md"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shadow-md"
      style={{ width: size, height: size, backgroundColor: deptColor(node.department), fontSize: size * 0.32 }}
    >
      {initials(node.name)}
    </div>
  )
}

function PersonCard({ node, onClick }: { node: OrgNode; onClick: (p: OrgNode) => void }) {
  return (
    <button
      onClick={() => onClick(node)}
      className="group flex flex-col items-center gap-1 focus:outline-none"
    >
      <div className="transition-transform group-hover:scale-110">
        <Avatar node={node} size={40} />
      </div>
      <div className="text-center">
        <p className="text-[11px] font-bold text-neutral-900 leading-tight">{node.name}</p>
        <p className="text-[10px] text-neutral-500 leading-tight">{node.department}</p>
      </div>
    </button>
  )
}

// Renderiza um nó e seus descendentes recursivamente (a árvore pode ter
// qualquer profundidade, não só os 3 níveis do organograma operacional antigo).
function OrgSubtree({ node, onClick }: { node: OrgNode; onClick: (p: OrgNode) => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-px h-6 bg-neutral-300" />
      <PersonCard node={node} onClick={onClick} />
      {node.reports.length > 0 && (
        <>
          <div className="w-px h-4 bg-neutral-300" />
          <div className="flex gap-6 items-start">
            {node.reports.map(child => (
              <OrgSubtree key={child.id} node={child} onClick={onClick} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrganogramaPage() {
  const [rows, setRows] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState<OrgNode | null>(null)
  const [deptFilter, setDeptFilter] = useState<string>('Todos')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, name, department, is_department_lead, avatar_url, manager_id')
        .eq('is_active', true)
        .not('department', 'is', null)
        .order('name')
      if (!error && data) setRows(data as ProfileRow[])
      setLoading(false)
    }
    load()
  }, [])

  const root = useMemo(() => buildTree(rows), [rows])
  const depts = useMemo(
    () => ['Todos', ...Array.from(new Set(rows.map(r => r.department))).sort()],
    [rows]
  )
  const gestores = useMemo(
    () => new Set(rows.map(r => r.manager_id).filter(Boolean)).size,
    [rows]
  )
  const niveis = useMemo(() => (root ? treeDepth(root) : 0), [root])

  const visibleReports = (root?.reports ?? []).filter(
    p => deptFilter === 'Todos' || p.department === deptFilter
  )

  if (loading) {
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="ORGANOGRAMA">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ORGANOGRAMA">
      <div className="space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Users}     color="blue"  label="COLABORADORES"  value={String(rows.length)} sub="Total na empresa" />
          <KpiCard icon={Building2} color="green" label="DEPARTAMENTOS"  value={String(depts.length - 1)} sub="Áreas funcionais" />
          <KpiCard icon={UserCheck} color="brand" label="GESTORES"       value={String(gestores)} sub="Com liderados diretos" />
          <KpiCard icon={Network}   color="blue"  label="NÍVEIS HIERÁRQUICOS" value={String(niveis)} sub="Da diretoria à ponta" />
        </div>

        {/* Filtro por dept */}
        <div className="flex flex-wrap gap-2">
          {depts.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                deptFilter === d
                  ? 'border-primary bg-primary text-black'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Org Chart */}
        {root && (
          <div className="overflow-x-auto">
            <div className="min-w-[900px] px-4 pb-8">
              <div className="flex justify-center mb-6">
                <PersonCard node={root} onClick={setSelectedPerson} />
              </div>

              <div className="flex justify-center mb-2">
                <div className="w-px h-6 bg-neutral-300" />
              </div>
              <div className="relative flex justify-center mb-2">
                <div className="absolute top-0 h-px bg-neutral-300" style={{ width: `${Math.max(visibleReports.length - 1, 1) * 100}px`, left: '50%', transform: 'translateX(-50%)' }} />
              </div>

              <div className="flex gap-6 justify-center items-start">
                {visibleReports.map(mgr => (
                  <OrgSubtree key={mgr.id} node={mgr} onClick={setSelectedPerson} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(DEPT_COLORS)
            .filter(([d]) => depts.includes(d))
            .map(([dept, color]) => (
              <span key={dept} className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                {dept}
              </span>
            ))}
        </div>

      </div>

      {/* Side Panel */}
      {selectedPerson && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedPerson(null)} />
          <div className="relative z-50 w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Detalhes</h3>
              <button onClick={() => setSelectedPerson(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center gap-2 py-4">
                <Avatar node={selectedPerson} size={64} />
                <p className="text-lg font-bold text-neutral-900">{selectedPerson.name}</p>
                <p className="text-sm text-neutral-500">{selectedPerson.department}</p>
              </div>

              <div className="space-y-3">
                <div className="rounded bg-neutral-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                  <p className="mt-1 text-sm font-medium text-neutral-800">{selectedPerson.department}</p>
                </div>
                {selectedPerson.is_department_lead && (
                  <div className="rounded bg-neutral-50 p-3">
                    <Badge variant="leader">Líder de departamento</Badge>
                  </div>
                )}
                {(() => {
                  const manager = rows.find(r => r.id === selectedPerson.manager_id)
                  return manager && (
                    <div className="rounded bg-neutral-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Gestor Direto</p>
                      <p className="mt-1 text-sm font-medium text-neutral-800">{manager.name}</p>
                    </div>
                  )
                })()}
                {selectedPerson.reports.length > 0 && (
                  <div className="rounded bg-neutral-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subordinados Diretos ({selectedPerson.reports.length})</p>
                    <ul className="mt-2 space-y-1">
                      {selectedPerson.reports.map(r => (
                        <li key={r.id} className="flex items-center gap-2 text-sm text-neutral-700">
                          <Avatar node={r} size={24} />
                          {r.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
