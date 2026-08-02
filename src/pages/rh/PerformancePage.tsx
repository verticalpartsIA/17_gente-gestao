import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Target,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

const AVD_DATA = [
  { initials: 'AP', name: 'Ana Paula Rocha',  dept: 'Comercial',          autoav: 4.8, gestor: 4.5, pares: 4.7, media: 4.67, status: 'Concluído'    },
  { initials: 'MC', name: 'Mariana Costa',    dept: 'Consultoria Técnica', autoav: 4.9, gestor: 4.8, pares: 5.0, media: 4.90, status: 'Concluído'    },
  { initials: 'CM', name: 'Carlos Mendes',    dept: 'Produção',            autoav: 4.2, gestor: 4.0, pares: 4.3, media: 4.17, status: 'Concluído'    },
  { initials: 'RF', name: 'Roberto Faria',    dept: 'Adm./Financeiro',     autoav: 4.1, gestor: 4.2, pares: 4.0, media: 4.10, status: 'Concluído'    },
  { initials: 'FS', name: 'Felipe Santos',    dept: 'Logística',           autoav: 3.8, gestor: 3.5, pares: 4.0, media: 3.77, status: 'Concluído'    },
  { initials: 'JM', name: 'Juliana Melo',     dept: 'Marketing',           autoav: 4.3, gestor: 4.4, pares: 4.2, media: 4.30, status: 'Concluído'    },
  { initials: 'BA', name: 'Bruno Almeida',    dept: 'Comercial',           autoav: 3.5, gestor: 3.8, pares: 3.7, media: 3.67, status: 'Em andamento' },
  { initials: 'DS', name: 'Daniela Souza',    dept: 'Qualidade',           autoav: 4.0, gestor: 4.2, pares: 4.1, media: 4.10, status: 'Concluído'    },
  { initials: 'EP', name: 'Eduardo Pires',    dept: 'Consultoria Técnica', autoav: null, gestor: null, pares: null, media: null, status: 'Não iniciado' },
  { initials: 'LC', name: 'Lucas Carvalho',   dept: 'Marketing',           autoav: null, gestor: null, pares: null, media: null, status: 'Não iniciado' },
]

// 9-Box: [performance][potencial] → 0=low, 1=mid, 2=high
// Grid positions: row 2=alto potencial, row 1=médio, row 0=baixo
// Col 0=baixa perf, col 1=media, col 2=alta
const NINEBOX_CELLS = [
  { label: 'Alto Potencial',     desc: 'Alta potencial, baixa performance', perf: 0, pot: 2, color: 'bg-blue-50 border-blue-200',    people: ['AP', 'MC'] },
  { label: 'Estrela',            desc: 'Alta potencial, alta performance',  perf: 2, pot: 2, color: 'bg-green-50 border-green-200',   people: [] },
  { label: 'Forte Performer',    desc: 'Média potencial, alta performance', perf: 2, pot: 1, color: 'bg-green-50 border-green-200',   people: ['CM', 'JM'] },
  { label: 'Bruto Diamante',     desc: 'Alta potencial, baixa performance', perf: 0, pot: 1, color: 'bg-yellow-50 border-yellow-200', people: ['RF'] },
  { label: 'Core',               desc: 'Média potencial, media performance', perf: 1, pot: 1, color: 'bg-neutral-50 border-neutral-200', people: ['FS', 'DS'] },
  { label: 'Consistente',        desc: 'Baixa potencial, alta performance', perf: 2, pot: 0, color: 'bg-neutral-50 border-neutral-200', people: ['EP'] },
  { label: 'Risco',              desc: 'Alta potencial, baixa performance', perf: 0, pot: 0, color: 'bg-red-50 border-red-200',       people: ['LC'] },
  { label: 'Inconsistente',      desc: 'Média potencial, baixa performance',perf: 1, pot: 0, color: 'bg-orange-50 border-orange-200', people: ['BA'] },
  { label: 'Enigma',             desc: 'Baixa potencial, media performance',perf: 1, pot: 2, color: 'bg-purple-50 border-purple-200', people: [] },
]

const METAS_OKR = [
  { area: 'Comercial',  responsavel: 'Ana Paula Rocha', progresso: 78, meta: 'Aumentar receita em 20% no Q3 2026' },
  { area: 'RH',         responsavel: 'Gelson Simões',   progresso: 60, meta: 'Contratar 5 novos colaboradores até set/26' },
  { area: 'Produção',   responsavel: 'Carlos Mendes',   progresso: 100,meta: 'Reduzir retrabalho em 15% no trimestre' },
  { area: 'Marketing',  responsavel: 'Juliana Melo',    progresso: 45, meta: 'Gerar 300 leads qualificados no Q3' },
  { area: 'Logística',  responsavel: 'Felipe Santos',   progresso: 33, meta: 'Implantar rastreamento em 100% da frota' },
  { area: 'Qualidade',  responsavel: 'Roberto Lima',    progresso: 88, meta: 'Zero não-conformidades críticas no Q3' },
]

const PDI_AP = [
  { titulo: 'Gestão Estratégica (EAD)', descricao: 'Curso online — 40h/mês via plataforma EAD', prazo: '31/08/2026', progresso: 65, status: 'Em andamento' },
  { titulo: 'Mentoria com CEO',         descricao: 'Sessões quinzenais de 1h com Gelson Simões',  prazo: '—',         progresso: 100, status: 'Concluído'   },
  { titulo: 'Certificação CRM (HubSpot)',descricao: 'Certificação oficial HubSpot CRM',           prazo: '30/09/2026', progresso: 10, status: 'Não iniciado'},
  { titulo: 'Workshop de Negociação',   descricao: 'Imersão presencial — São Paulo',              prazo: '15/08/2026', progresso: 40, status: 'Em andamento'},
]

const TREINAMENTOS = [
  { nome: 'NR-35 — Trabalho em Altura',      tipo: 'Obrigatório', concluidos: 8,  total: 8,  progresso: 100 },
  { nome: 'Excel + Power BI para Gestores',  tipo: 'Opcional',    concluidos: 4,  total: 7,  progresso: 57  },
  { nome: 'Gestão de Conflitos',             tipo: 'Opcional',    concluidos: 6,  total: 11, progresso: 55  },
  { nome: 'LGPD — Lei Geral de Proteção',   tipo: 'Obrigatório', concluidos: 19, total: 22, progresso: 86  },
  { nome: 'Primeiros Socorros',              tipo: 'Obrigatório', concluidos: 8,  total: 8,  progresso: 100 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function avdStatusBadge(status: string) {
  if (status === 'Concluído')    return <Badge variant="success">{status}</Badge>
  if (status === 'Em andamento') return <Badge variant="warning">{status}</Badge>
  if (status === 'Não iniciado') return <Badge variant="default">{status}</Badge>
  return <Badge>{status}</Badge>
}

function pdiStatusBadge(status: string) {
  if (status === 'Concluído')    return <Badge variant="success">{status}</Badge>
  if (status === 'Em andamento') return <Badge variant="warning">{status}</Badge>
  if (status === 'Não iniciado') return <Badge variant="default">{status}</Badge>
  return <Badge>{status}</Badge>
}

function mediaColor(media: number | null) {
  if (media === null) return 'text-neutral-400'
  if (media >= 4.5)  return 'text-green-600'
  if (media >= 4.0)  return 'text-blue-600'
  if (media >= 3.5)  return 'text-yellow-600'
  return 'text-red-600'
}

function progressColor(p: number) {
  if (p >= 80) return 'bg-green-500'
  if (p >= 50) return 'bg-yellow-400'
  return 'bg-red-400'
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TAB_BY_QUERY: Record<string, number> = { avaliacao: 0, '9box': 1, metas: 2, pdi: 3, treinamentos: 4 }
// competencias, experiencia e performance ainda não têm tela própria — o
// menu promete 8 sub-telas, só 5 existem de verdade.
const NO_CONTENT_LABEL: Record<string, string> = {
  competencias: 'Competências',
  experiencia: 'Avaliação de Experiência',
  performance: 'Análise de Performance',
}

export default function PerformancePage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)

  const urlTab = searchParams.get('tab')

  useEffect(() => {
    if (urlTab && urlTab in TAB_BY_QUERY) setActiveTab(TAB_BY_QUERY[urlTab])
  }, [urlTab])

  const TABS = ['Avaliação de Desempenho', 'Matriz 9-Box', 'Metas / OKRs', 'PDI', 'Treinamentos']

  // Build 9-box grid: 3x3 matrix, rows = potencial (2→0 top-to-bottom), cols = performance (0→2)
  // pot=2: top row | pot=1: mid row | pot=0: bottom row
  // perf=0: left col | perf=1: mid col | perf=2: right col
  const getCell = (pot: number, perf: number) =>
    NINEBOX_CELLS.find(c => c.pot === pot && c.perf === perf)

  if (urlTab && urlTab in NO_CONTENT_LABEL) {
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="DESEMPENHO E PERFORMANCE">
        <div className="space-y-6">
          <DemoDataBanner />
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-fg2">
                {NO_CONTENT_LABEL[urlTab]} ainda não tem tela própria implementada — hoje esse item do menu
                é só um link, sem conteúdo específico por trás.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="DESEMPENHO E PERFORMANCE">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={ClipboardCheck} color="green"  label="AVALIAÇÕES CONCLUÍDAS" value="18/22" sub="Ciclo Q3 2026" />
          <KpiCard icon={Target}         color="brand"  label="METAS ATIVAS"          value="6"     sub="OKRs do trimestre" />
          <KpiCard icon={TrendingUp}     color="blue"   label="PDIs ATIVOS"           value="9"     sub="Planos de desenvolvimento" />
          <KpiCard icon={BookOpen}       color="purple" label="TREINAMENTOS"           value="5"     sub="Programas em andamento" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0 — Avaliação de Desempenho */}
        {activeTab === 0 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <div>
                <CardTitle>Avaliação de Desempenho (AVD) — Ciclo Q3 2026</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Critérios: Autoavaliação, Avaliação do Gestor, Avaliação de Pares</p>
              </div>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Avaliação ainda não está conectado ao banco de dados.')}>Nova Avaliação</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Autoav.</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Gestor</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Pares</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Média</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {AVD_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                            {row.initials}
                          </div>
                          <span className="font-medium text-neutral-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{row.dept}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{row.autoav ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{row.gestor ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{row.pares ?? '—'}</td>
                      <td className={`px-4 py-3 text-center text-lg font-bold ${mediaColor(row.media)}`}>
                        {row.media !== null ? row.media.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3">{avdStatusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Matriz 9-Box */}
        {activeTab === 1 && (
          <Card theme="light">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle>Matriz 9-Box — Performance × Potencial</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 3x3 grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  {/* col headers */}
                  <div className="flex mb-1 ml-14">
                    {['Baixa Performance', 'Média Performance', 'Alta Performance'].map((l, i) => (
                      <div key={i} className="flex-1 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">{l}</div>
                    ))}
                  </div>
                  {/* rows */}
                  {[2, 1, 0].map(pot => (
                    <div key={pot} className="flex">
                      {/* row label */}
                      <div className="w-14 flex items-center justify-center">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider text-neutral-400"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {pot === 2 ? 'Alto Pot.' : pot === 1 ? 'Médio Pot.' : 'Baixo Pot.'}
                        </span>
                      </div>
                      {/* cells */}
                      {[0, 1, 2].map(perf => {
                        const cell = getCell(pot, perf)
                        return (
                          <div
                            key={perf}
                            className={`flex-1 m-1 rounded-lg border p-3 min-h-[100px] ${cell?.color ?? 'bg-neutral-50 border-neutral-200'}`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2">{cell?.label}</p>
                            <div className="flex flex-wrap gap-1">
                              {cell?.people.map(p => (
                                <span
                                  key={p}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2 — Metas / OKRs */}
        {activeTab === 2 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Gestão de Metas / OKRs — Q3 2026</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Meta ainda não está conectado ao banco de dados.')}>Nova Meta</Button>
            </CardHeader>
            <CardContent className="divide-y divide-neutral-100 px-5">
              {METAS_OKR.map((m, i) => (
                <div key={i} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">{m.meta}</p>
                      <p className="text-xs text-neutral-500">{m.area} · Responsável: {m.responsavel}</p>
                    </div>
                    <span className={`text-xl font-black ${
                      m.progresso === 100 ? 'text-green-600' :
                      m.progresso >= 70 ? 'text-blue-600' :
                      m.progresso >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {m.progresso}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${progressColor(m.progresso)}`}
                      style={{ width: `${m.progresso}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tab 3 — PDI */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900">PDI — Ana Paula Rocha</h3>
                <p className="text-xs text-neutral-500">Gerente Comercial · Ciclo 2026</p>
              </div>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Ação ainda não está conectado ao banco de dados.')}>Nova Ação</Button>
            </div>

            {PDI_AP.map((item, i) => (
              <Card key={i} theme="light">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-neutral-900">{item.titulo}</p>
                        {pdiStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-neutral-500">{item.descricao}</p>
                      {item.prazo !== '—' && (
                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Prazo: {item.prazo}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded bg-neutral-100 overflow-hidden">
                          <div
                            className={`h-full rounded ${progressColor(item.progresso)}`}
                            style={{ width: `${item.progresso}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-neutral-600 w-8 text-right">{item.progresso}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 4 — Treinamentos */}
        {activeTab === 4 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Treinamentos — Ciclo 2026</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Novo Treinamento ainda não está conectado ao banco de dados.')}>Novo Treinamento</Button>
            </CardHeader>
            <CardContent className="divide-y divide-neutral-100 px-5">
              {TREINAMENTOS.map((t, i) => (
                <div key={i} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-900">{t.nome}</span>
                      <Badge variant={t.tipo === 'Obrigatório' ? 'danger' : 'info'}>{t.tipo}</Badge>
                    </div>
                    <span className="text-sm text-neutral-500">{t.concluidos}/{t.total} concluídos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded ${progressColor(t.progresso)}`}
                        style={{ width: `${t.progresso}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-10 text-right ${
                      t.progresso === 100 ? 'text-green-600' :
                      t.progresso >= 70 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>{t.progresso}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  )
}
