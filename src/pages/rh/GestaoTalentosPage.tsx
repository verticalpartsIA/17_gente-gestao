import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { useAuth } from '@/lib/auth'
import { getProfilerResumo, type ProfilerResumo } from '@/lib/profilerContract'
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

// Não existe tabela rh_cargos ainda — nenhum cargo/faixa salarial real foi
// cadastrado. Os arrays ficam vazios em vez de fabricar plano de cargos e
// headcount que não existem.
const CARGOS: { cargo: string; depto: string; nivel: string; cbo: string; hcAprov: number; hcAtual: number; vagas: number; faixaMin: number; faixaMax: number }[] = []
const FAIXAS_SALARIAIS: { nivel: string; min: number; max: number; med: number }[] = []

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
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCargo, setSelectedCargo] = useState<typeof CARGOS[0] | null>(null)
  const [profiler, setProfiler] = useState<ProfilerResumo | null>(null)

  // Aderência de perfil ao cargo deveria vir do Profiler — issue #56. Ainda
  // 'nao_implementado' (ver src/lib/profilerContract.ts).
  useEffect(() => {
    if (profile) getProfilerResumo(profile.id).then(setProfiler)
  }, [profile])

  // O menu do Dashboard tem um link próprio para "Admissão Digital"
  // (?tab=admissao) que essa página ainda não implementa como aba real —
  // antes disso caía direto em Cargos e Salários sem avisar.
  useEffect(() => {
    if (urlTab === 'salarios' || urlTab === 'estrutura-salarial') setActiveTab(1)
    else if (urlTab === 'cargos') setActiveTab(0)
  }, [urlTab])

  const TABS = ['Plano de Cargos', 'Estrutura Salarial']

  const maxSalario = FAIXAS_SALARIAIS.length > 0 ? Math.max(...FAIXAS_SALARIAIS.map(f => f.max)) : 1

  if (urlTab === 'admissao') {
    // A Admissão Digital de verdade (wizard do candidato + checklist do RH,
    // Fase 1) vive em /atracao, aba "Admissão Digital" — não nesta rota.
    // Antes essa entrada do menu dizia "ainda não foi implementado", o que
    // não é mais verdade; só apontava pro lugar errado.
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE TALENTOS — ADMISSÃO DIGITAL">
        <div className="space-y-6">
          <Card theme="light">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-sm text-neutral-600">
                A Admissão Digital já existe — ela mora na tela de Atração de Talentos, não aqui.
              </p>
              <Link to="/atracao">
                <Button size="sm">Ir para Atração de Talentos →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE TALENTOS — CARGOS E SALÁRIOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"   label="CARGOS CADASTRADOS" value="0" sub="Módulo ainda não integrado" />
          <KpiCard icon={Users}     color="green"  label="HC APROVADO"        value="—" sub="Módulo ainda não integrado" />
          <KpiCard icon={UserCheck} color="brand"  label="HC ATUAL"           value="—" sub="Módulo ainda não integrado" />
          <KpiCard icon={UserX}     color="red"    label="VAGAS EM ABERTO"    value="—" sub="Módulo ainda não integrado" />
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

        {profiler && activeTab === 0 && (
          <p className="text-xs italic text-neutral-500">
            Aderência de perfil comportamental ao cargo (Profiler): {profiler.statusProfiler === 'nao_implementado'
              ? 'ainda não disponível — motor de cálculo do Profiler não implementado.'
              : profiler.perfilPredominante}
          </p>
        )}

        {/* Tab 0 — Plano de Cargos */}
        {activeTab === 0 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Plano de Cargos e Salários</CardTitle>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => alert('Cadastro de novo cargo ainda não está conectado ao banco de dados.')}
              >
                Novo Cargo
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[900px] text-sm">
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
                  {CARGOS.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhum cargo cadastrado ainda.</td></tr>
                  )}
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
              {FAIXAS_SALARIAIS.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-400">Nenhuma faixa salarial cadastrada ainda.</p>
              )}
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
