import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Button } from '@/components/ui/Button'
import {
  Users,
  Building2,
  Network,
  UserCheck,
  X
} from 'lucide-react'

// ── Data real — Organograma Operacional VerticalParts (julho 2026) ────────────

const DEPT_COLORS: Record<string, string> = {
  'Diretoria':          '#F5C400',
  'Logística':          '#0D9488',
  'Almoxarifado/PCP':   '#7C3AED',
  'Produção':           '#DC2626',
  'Consultoria Técnica':'#C99E00',
  'Inst. e Montagem':   '#2563EB',
  'Projetos/TI':        '#4F46E5',
  'Operações':          '#16A34A',
}

interface Person {
  initials: string
  name: string
  role: string
  dept: string
  nivel: 'Diretoria' | 'Gerência / Coord.' | 'Operacional'
  manager?: string
  reports?: Person[]
}

const CEO: Person = {
  initials: 'DM',
  name: 'Diego Maeno',
  role: 'CEO',
  dept: 'Diretoria',
  nivel: 'Diretoria',
  reports: [
    {
      initials: 'DO', name: 'Danilo Oliveira', role: 'Sup. de Logística',
      dept: 'Logística', nivel: 'Gerência / Coord.', manager: 'Diego Maeno',
      reports: [
        { initials: 'AC', name: 'Aurélio Carvalho', role: 'Técnico de Campo Sênior',  dept: 'Logística',        nivel: 'Operacional', manager: 'Danilo Oliveira' },
        { initials: 'JC', name: 'Juciê Santos',     role: 'Aux. de Produção',         dept: 'Produção',         nivel: 'Operacional', manager: 'Danilo Oliveira' },
        { initials: 'GS', name: 'Gustavo da Silva', role: 'Aux. de Produção',         dept: 'Produção',         nivel: 'Operacional', manager: 'Danilo Oliveira' },
        { initials: 'MN', name: 'Marco Antonio',    role: 'Ajudante Geral',           dept: 'Logística',        nivel: 'Operacional', manager: 'Danilo Oliveira' },
        {
          initials: 'FC', name: 'Franklin Costa', role: 'Analista Almoxarifado',
          dept: 'Almoxarifado/PCP', nivel: 'Operacional', manager: 'Danilo Oliveira',
          reports: [
            { initials: 'TA', name: 'Tiago Acacio', role: 'Assist. Almoxarifado', dept: 'Almoxarifado/PCP', nivel: 'Operacional', manager: 'Franklin Costa' },
          ]
        },
        { initials: 'MR', name: 'Matheus Rocha', role: 'Assist. Expedição', dept: 'Logística', nivel: 'Operacional', manager: 'Danilo Oliveira' },
        {
          initials: 'MT', name: 'Magda Torres', role: 'Assist. PCP',
          dept: 'Almoxarifado/PCP', nivel: 'Operacional', manager: 'Danilo Oliveira',
          reports: [
            { initials: 'NC', name: 'Nailson Cruz',   role: 'Serralheiro', dept: 'Produção',  nivel: 'Operacional', manager: 'Magda Torres' },
            { initials: 'EJ', name: 'Edmilson Jesus', role: 'Motorista',   dept: 'Logística', nivel: 'Operacional', manager: 'Magda Torres' },
          ]
        },
      ]
    },
    {
      initials: 'GE', name: 'Gelson Simões', role: 'Consultor Técnico Estratégico',
      dept: 'Consultoria Técnica', nivel: 'Gerência / Coord.', manager: 'Diego Maeno',
      reports: [
        { initials: 'GB', name: 'Gesse Batista', role: 'Motorista', dept: 'Logística', nivel: 'Operacional', manager: 'Gelson Simões' },
        {
          initials: 'MA', name: 'Mauricio Araujo', role: 'Supervisor de Inst. e Montagem',
          dept: 'Inst. e Montagem', nivel: 'Gerência / Coord.', manager: 'Gelson Simões',
          reports: [
            { initials: 'SE', name: 'Silvio Elias', role: 'Tec. de Instalação e Manut. Sênior', dept: 'Inst. e Montagem', nivel: 'Operacional', manager: 'Mauricio Araujo' },
          ]
        },
        {
          initials: 'VL', name: 'Vinicius Leite', role: 'Analista de Projetos - BST Monarch',
          dept: 'Projetos/TI', nivel: 'Operacional', manager: 'Gelson Simões',
          reports: [
            { initials: 'FB', name: 'Felipe Barros', role: 'Jovem Aprendiz', dept: 'Projetos/TI', nivel: 'Operacional', manager: 'Vinicius Leite' },
          ]
        },
      ]
    },
    {
      initials: 'AA', name: 'Arilene Avila', role: 'Gestora de Operações',
      dept: 'Operações', nivel: 'Gerência / Coord.', manager: 'Diego Maeno',
      reports: [
        { initials: 'AS', name: 'Alexandre Schmidt', role: 'Engenheiro',        dept: 'Operações', nivel: 'Operacional', manager: 'Arilene Avila' },
        { initials: 'BS', name: 'Brayan Souza',      role: 'Tec. Mecatrônico', dept: 'Operações', nivel: 'Operacional', manager: 'Arilene Avila' },
      ]
    },
  ]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PersonCard({ person, onClick }: { person: Person; onClick: (p: Person) => void }) {
  const color = DEPT_COLORS[person.dept] ?? '#595E6B'
  return (
    <button
      onClick={() => onClick(person)}
      className="group flex flex-col items-center gap-1 focus:outline-none"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-md transition-transform group-hover:scale-110"
        style={{ backgroundColor: color }}
      >
        {person.initials}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-bold text-neutral-900 leading-tight">{person.name}</p>
        <p className="text-[10px] text-neutral-500 leading-tight">{person.role}</p>
      </div>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrganogramaPage() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [deptFilter, setDeptFilter] = useState<string>('Todos')

  const depts = ['Todos', ...Object.keys(DEPT_COLORS).filter(d => d !== 'Diretoria')]

  const visibleReports = CEO.reports?.filter(p =>
    deptFilter === 'Todos' || p.dept === deptFilter
  ) ?? []

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ORGANOGRAMA">
      <div className="space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Users}     color="blue"  label="COLABORADORES"  value="21" sub="Total na empresa" />
          <KpiCard icon={Building2} color="green" label="DEPARTAMENTOS"  value="8"  sub="Áreas funcionais" />
          <KpiCard icon={UserCheck} color="brand" label="GESTORES"       value="5"  sub="Líderes de área" />
          <KpiCard icon={Network}   color="blue"  label="NÍVEIS HIERÁRQUICOS" value="3" sub="Diretoria / Gerência / Operacional" />
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
        <div className="overflow-x-auto">
          <div className="min-w-[900px] px-4 pb-8">
            {/* CEO */}
            <div className="flex justify-center mb-6">
              <PersonCard person={CEO} onClick={setSelectedPerson} />
            </div>

            {/* Connector line CEO → L1 */}
            <div className="flex justify-center mb-2">
              <div className="w-px h-6 bg-neutral-300" />
            </div>
            <div className="relative flex justify-center mb-2">
              <div className="absolute top-0 h-px bg-neutral-300" style={{ width: `${Math.max(visibleReports.length - 1, 1) * 100}px`, left: '50%', transform: 'translateX(-50%)' }} />
            </div>

            {/* Level 1 — Managers */}
            <div className="flex gap-6 justify-center items-start">
              {visibleReports.map((mgr) => (
                <div key={mgr.initials} className="flex flex-col items-center gap-4">
                  {/* Connector from horizontal bar */}
                  <div className="w-px h-6 bg-neutral-300" />
                  <PersonCard person={mgr} onClick={setSelectedPerson} />

                  {/* Level 2 — Reports */}
                  {mgr.reports && mgr.reports.length > 0 && (
                    <>
                      <div className="w-px h-4 bg-neutral-300" />
                      <div className="flex gap-4 items-start">
                        {mgr.reports.map(rep => (
                          <div key={rep.initials} className="flex flex-col items-center gap-1">
                            <div className="w-px h-4 bg-neutral-300" />
                            <PersonCard person={rep} onClick={setSelectedPerson} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(DEPT_COLORS).filter(([d]) => d !== 'Diretoria').map(([dept, color]) => (
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
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                  style={{ backgroundColor: DEPT_COLORS[selectedPerson.dept] ?? '#595E6B' }}
                >
                  {selectedPerson.initials}
                </div>
                <p className="text-lg font-bold text-neutral-900">{selectedPerson.name}</p>
                <p className="text-sm text-neutral-500">{selectedPerson.role}</p>
              </div>

              <div className="space-y-3">
                <div className="rounded bg-neutral-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                  <p className="mt-1 text-sm font-medium text-neutral-800">{selectedPerson.dept}</p>
                </div>
                <div className="rounded bg-neutral-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Nível Hierárquico</p>
                  <div className="mt-1">
                    <Badge variant={
                      selectedPerson.nivel === 'Diretoria' ? 'admin' :
                      selectedPerson.nivel === 'Gerência / Coord.' ? 'leader' :
                      'default'
                    }>
                      {selectedPerson.nivel}
                    </Badge>
                  </div>
                </div>
                {selectedPerson.manager && (
                  <div className="rounded bg-neutral-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Gestor Direto</p>
                    <p className="mt-1 text-sm font-medium text-neutral-800">{selectedPerson.manager}</p>
                  </div>
                )}
                {selectedPerson.reports && selectedPerson.reports.length > 0 && (
                  <div className="rounded bg-neutral-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subordinados Diretos ({selectedPerson.reports.length})</p>
                    <ul className="mt-2 space-y-1">
                      {selectedPerson.reports.map(r => (
                        <li key={r.initials} className="flex items-center gap-2 text-sm text-neutral-700">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: DEPT_COLORS[r.dept] ?? '#595E6B' }}
                          >
                            {r.initials}
                          </span>
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
