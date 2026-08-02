import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Briefcase,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  X,
  Plus,
  Edit
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

const CARGOS = [
  { cargo: 'Executivo de Vendas',     depto: 'Comercial',          nivel: 'Pleno',       cbo: '3541-05', hcAprov: 3, hcAtual: 3, vagas: 0, faixaMin: 3500,  faixaMax: 6000  },
  { cargo: 'Gerente Comercial',       depto: 'Comercial',          nivel: 'Gerência',    cbo: '1421-05', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 9000,  faixaMax: 16000 },
  { cargo: 'Analista de Qualidade',   depto: 'Qualidade',          nivel: 'Pleno',       cbo: '2141-05', hcAprov: 2, hcAtual: 1, vagas: 1, faixaMin: 3200,  faixaMax: 5500  },
  { cargo: 'Coord. de Qualidade',     depto: 'Qualidade',          nivel: 'Coordenador', cbo: '1422-05', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 6000,  faixaMax: 10000 },
  { cargo: 'Gerente Adm./Fin.',       depto: 'Adm./Financeiro',    nivel: 'Gerência',    cbo: '1412-05', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 10000, faixaMax: 18000 },
  { cargo: 'Assistente Financeiro',   depto: 'Adm./Financeiro',    nivel: 'Júnior',      cbo: '3511-05', hcAprov: 2, hcAtual: 2, vagas: 0, faixaMin: 1800,  faixaMax: 3200  },
  { cargo: 'Coord. de Marketing',     depto: 'Marketing',          nivel: 'Coordenador', cbo: '1422-15', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 5500,  faixaMax: 9500  },
  { cargo: 'Designer Gráfico',        depto: 'Marketing',          nivel: 'Pleno',       cbo: '3731-10', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 3000,  faixaMax: 5500  },
  { cargo: 'Consultor Técnico',       depto: 'Consultoria Técnica',nivel: 'Sênior',      cbo: '2149-05', hcAprov: 3, hcAtual: 2, vagas: 1, faixaMin: 7000,  faixaMax: 14000 },
  { cargo: 'Aux. de Almoxarifado',    depto: 'Almoxarifado',       nivel: 'Júnior',      cbo: '4141-05', hcAprov: 2, hcAtual: 1, vagas: 1, faixaMin: 1500,  faixaMax: 2500  },
  { cargo: 'Técnico de Manutenção',   depto: 'Produção',           nivel: 'Pleno',       cbo: '9141-05', hcAprov: 3, hcAtual: 2, vagas: 1, faixaMin: 2800,  faixaMax: 5000  },
  { cargo: 'Aux. de Logística',       depto: 'Logística',          nivel: 'Júnior',      cbo: '4141-10', hcAprov: 3, hcAtual: 3, vagas: 0, faixaMin: 1600,  faixaMax: 2800  },
  { cargo: 'Engenheiro de Projetos',  depto: 'Engenharia',         nivel: 'Pleno',       cbo: '2144-05', hcAprov: 2, hcAtual: 1, vagas: 1, faixaMin: 6000,  faixaMax: 11000 },
  { cargo: 'Coord. Jurídico/Suprim.', depto: 'Jurídico/Suprimentos',nivel:'Coordenador', cbo: '2410-05', hcAprov: 1, hcAtual: 1, vagas: 0, faixaMin: 6500,  faixaMax: 11000 },
]

const FAIXAS_SALARIAIS = [
  { nivel: 'Júnior',      min: 1500,  max: 3200,  med: 2200  },
  { nivel: 'Pleno',       min: 3000,  max: 6000,  med: 4500  },
  { nivel: 'Sênior',      min: 5500,  max: 10000, med: 7500  },
  { nivel: 'Especialista',min: 7000,  max: 14000, med: 10000 },
  { nivel: 'Coordenador', min: 5500,  max: 11000, med: 8000  },
  { nivel: 'Supervisão',  min: 6000,  max: 12000, med: 8500  },
  { nivel: 'Gerência',    min: 9000,  max: 18000, med: 13000 },
  { nivel: 'Diretor',     min: 15000, max: 35000, med: 22000 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function nivelBadge(nivel: string) {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default' | 'admin' | 'leader'> = {
    'Júnior': 'info',
    'Pleno': 'success',
    'Sênior': 'warning',
    'Especialista': 'danger',
    'Coordenador': 'leader',
    'Supervisão': 'leader',
    'Gerência': 'admin',
    'Diretor': 'admin',
  }
  return <Badge variant={map[nivel] ?? 'default'}>{nivel}</Badge>
}

function fmtBrl(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GestaoTalentosPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCargo, setSelectedCargo] = useState<typeof CARGOS[0] | null>(null)

  const TABS = ['Plano de Cargos', 'Estrutura Salarial']

  const maxSalario = Math.max(...FAIXAS_SALARIAIS.map(f => f.max))

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE TALENTOS — CARGOS E SALÁRIOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"   label="CARGOS CADASTRADOS" value="14" sub="No plano de cargos vigente" />
          <KpiCard icon={Users}     color="green"  label="HC APROVADO"        value="26" sub="Headcount orçado no ano" />
          <KpiCard icon={UserCheck} color="brand"  label="HC ATUAL"           value="21" sub="Colaboradores ativos" />
          <KpiCard icon={UserX}     color="red"    label="VAGAS EM ABERTO"    value="5"  sub="HC aprovado não preenchido" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0 — Plano de Cargos */}
        {activeTab === 0 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Plano de Cargos e Salários</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Novo Cargo</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nível</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">CBO</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">HC Apr.</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">HC Atual</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vagas</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Faixa Salarial</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {CARGOS.map((c, i) => (
                    <tr
                      key={i}
                      className="hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedCargo(c)}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">{c.cargo}</td>
                      <td className="px-4 py-3 text-neutral-600">{c.depto}</td>
                      <td className="px-4 py-3">{nivelBadge(c.nivel)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{c.cbo}</td>
                      <td className="px-4 py-3 text-center font-semibold text-neutral-700">{c.hcAprov}</td>
                      <td className="px-4 py-3 text-center font-semibold text-neutral-700">{c.hcAtual}</td>
                      <td className="px-4 py-3 text-center">
                        {c.vagas > 0
                          ? <span className="font-bold text-red-600">+{c.vagas}</span>
                          : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">
                        {fmtBrl(c.faixaMin)} – {fmtBrl(c.faixaMax)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit className="h-3 w-3" />}
                          onClick={e => { e.stopPropagation(); setSelectedCargo(c) }}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Estrutura Salarial */}
        {activeTab === 1 && (
          <Card theme="light">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle>Estrutura Salarial por Nível</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {FAIXAS_SALARIAIS.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {nivelBadge(f.nivel)}
                    </div>
                    <div className="flex items-center gap-6 text-xs text-neutral-500">
                      <span>Mín: <strong className="text-neutral-700">{fmtBrl(f.min)}</strong></span>
                      <span>Médio: <strong className="text-primary">{fmtBrl(f.med)}</strong></span>
                      <span>Máx: <strong className="text-neutral-700">{fmtBrl(f.max)}</strong></span>
                    </div>
                  </div>
                  {/* bar */}
                  <div className="relative h-6 rounded bg-neutral-100 overflow-hidden">
                    {/* range bar */}
                    <div
                      className="absolute top-0 bottom-0 bg-blue-100 rounded"
                      style={{
                        left: `${(f.min / maxSalario) * 100}%`,
                        width: `${((f.max - f.min) / maxSalario) * 100}%`,
                      }}
                    />
                    {/* median marker */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-primary rounded"
                      style={{ left: `${(f.med / maxSalario) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 flex items-center gap-6 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-8 rounded bg-blue-100" /> Faixa (mín–máx)
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-1 rounded bg-primary" /> Mediana de mercado
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Side Panel — Cargo Detalhe */}
        {selectedCargo && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedCargo(null)} />
            <div className="relative z-50 w-96 bg-white shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-200 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Detalhes do Cargo</h3>
                <button
                  onClick={() => setSelectedCargo(null)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cargo</p>
                  <p className="mt-1 text-lg font-bold text-neutral-900">{selectedCargo.cargo}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                    <p className="mt-1 text-sm text-neutral-700">{selectedCargo.depto}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Nível</p>
                    <div className="mt-1">{nivelBadge(selectedCargo.nivel)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">CBO</p>
                    <p className="mt-1 font-mono text-sm text-neutral-700">{selectedCargo.cbo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Vagas em Aberto</p>
                    <p className={`mt-1 text-sm font-bold ${selectedCargo.vagas > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedCargo.vagas > 0 ? `+${selectedCargo.vagas} vaga(s)` : 'Sem vagas'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">HC Aprovado</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">{selectedCargo.hcAprov}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">HC Atual</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">{selectedCargo.hcAtual}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    <DollarSign className="inline h-3 w-3 mr-1" />Faixa Salarial
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="text-center">
                      <p className="text-[10px] text-neutral-400 uppercase">Mínimo</p>
                      <p className="text-lg font-bold text-neutral-700">{fmtBrl(selectedCargo.faixaMin)}</p>
                    </div>
                    <div className="h-px flex-1 mx-3 bg-neutral-200 self-center" />
                    <div className="text-center">
                      <p className="text-[10px] text-neutral-400 uppercase">Máximo</p>
                      <p className="text-lg font-bold text-neutral-700">{fmtBrl(selectedCargo.faixaMax)}</p>
                    </div>
                  </div>
                </div>

                <Button variant="primary" className="w-full" leftIcon={<Edit className="h-4 w-4" />}>
                  Editar Cargo
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
