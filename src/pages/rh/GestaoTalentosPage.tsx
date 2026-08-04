import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { useAuth } from '@/lib/auth'
import { getProfilerResumo, type ProfilerResumo } from '@/lib/profilerContract'
import { listarCargos, listarEstruturaSalarial, type CargoComContagem, type FaixaPorNivel } from '@/lib/cargosRepo'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import { NovoCargoModal } from '@/components/rh/NovoCargoModal'
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
  Loader2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function nivelBadge(nivel: string | null) {
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
  if (!nivel) return <span className="text-neutral-400 text-xs">—</span>
  return <Badge variant={map[nivel] ?? 'default'}>{nivel}</Badge>
}

function regimeBadge(regime: 'CLT' | 'PJ') {
  return <Badge variant={regime === 'CLT' ? 'info' : 'leader'}>{regime}</Badge>
}

function fmtBrl(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

const MODELO_PJ_LABEL: Record<string, string> = {
  entrega: 'por entrega',
  hora_tecnica: 'por hora técnica',
  marco_projeto: 'por marco de projeto',
}

function remuneracaoLabel(c: CargoComContagem, souAdministrador: boolean): string {
  if (c.regime === 'CLT') {
    if (!c.faixaClt) return souAdministrador ? '—' : 'Restrito'
    return `${fmtBrl(c.faixaClt.faixa_min)} – ${fmtBrl(c.faixaClt.faixa_max)}`
  }
  if (!c.pjCompliance) return souAdministrador ? '—' : 'Restrito'
  return `${fmtBrl(c.pjCompliance.valor_referencia)} ${MODELO_PJ_LABEL[c.pjCompliance.modelo_remuneracao]}`
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GestaoTalentosPage() {
  const { profile } = useAuth()
  const souAdministrador = profile?.level === 'Administrador'
  const [searchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCargo, setSelectedCargo] = useState<CargoComContagem | null>(null)
  const [profiler, setProfiler] = useState<ProfilerResumo | null>(null)

  const [cargos, setCargos] = useState<CargoComContagem[]>([])
  const [estruturaSalarial, setEstruturaSalarial] = useState<FaixaPorNivel[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  const carregar = useCallback(() => {
    if (!persistenciaDisponivel()) return
    setCarregando(true)
    setErro(null)
    Promise.all([listarCargos(), listarEstruturaSalarial()])
      .then(([c, e]) => { setCargos(c); setEstruturaSalarial(e) })
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(carregar, [carregar])

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

  const maxSalario = estruturaSalarial.length > 0 ? Math.max(...estruturaSalarial.map(f => f.max)) : 1

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

  const totalHcAprovado = cargos.reduce((s, c) => s + c.hc_aprovado, 0)
  const totalHcAtual = cargos.reduce((s, c) => s + c.hcAtual, 0)
  const totalVagas = cargos.reduce((s, c) => s + c.vagasAbertas, 0)

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE TALENTOS — CARGOS E SALÁRIOS">
      <div className="space-y-6">
        {erro && (
          <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erro}</span>
          </div>
        )}
        {!persistenciaDisponivel() && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Modo simulado — sem chaves do Supabase, nada é gravado.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"   label="CARGOS CADASTRADOS" value={carregando ? '...' : String(cargos.length)} sub="Dado real" />
          <KpiCard icon={Users}     color="green"  label="HC APROVADO"        value={carregando ? '...' : String(totalHcAprovado)} sub="Dado real" />
          <KpiCard icon={UserCheck} color="brand"  label="HC ATUAL"           value={carregando ? '...' : String(totalHcAtual)} sub="Calculado de profiles" />
          <KpiCard icon={UserX}     color="red"    label="VAGAS EM ABERTO"    value={carregando ? '...' : String(totalVagas)} sub="Calculado de contratacao_vagas" />
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
              {souAdministrador && (
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalAberto(true)}>
                  Novo Cargo
                </Button>
              )}
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Regime</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nível</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">HC Apr.</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">HC Atual</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vagas</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Remuneração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {carregando && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center"><Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto" /></td></tr>
                  )}
                  {!carregando && cargos.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhum cargo cadastrado ainda.</td></tr>
                  )}
                  {cargos.map(c => (
                    <tr key={c.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => setSelectedCargo(c)}>
                      <td className="px-4 py-3 font-medium text-neutral-900">{c.nome}</td>
                      <td className="px-4 py-3 text-neutral-600">{c.departamento}</td>
                      <td className="px-4 py-3">{regimeBadge(c.regime)}</td>
                      <td className="px-4 py-3">{nivelBadge(c.nivel)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-neutral-700">{c.hc_aprovado}</td>
                      <td className="px-4 py-3 text-center font-semibold text-neutral-700">{c.hcAtual}</td>
                      <td className="px-4 py-3 text-center">
                        {c.vagasAbertas > 0
                          ? <span className="font-bold text-red-600">+{c.vagasAbertas}</span>
                          : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">{remuneracaoLabel(c, souAdministrador)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Estrutura Salarial (só CLT — PJ não tem faixa salarial mensal) */}
        {activeTab === 1 && (
          <Card theme="light">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle>Estrutura Salarial por Nível (CLT)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!souAdministrador && (
                <p className="text-xs text-neutral-500 italic">Faixas salariais são visíveis só para Administradores.</p>
              )}
              {souAdministrador && estruturaSalarial.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-400">Nenhuma faixa salarial CLT cadastrada ainda.</p>
              )}
              {estruturaSalarial.map((f, i) => (
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
                  <div className="relative h-6 rounded bg-neutral-100 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-blue-100 rounded"
                      style={{ left: `${(f.min / maxSalario) * 100}%`, width: `${((f.max - f.min) / maxSalario) * 100}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-1 bg-primary rounded" style={{ left: `${(f.med / maxSalario) * 100}%` }} />
                  </div>
                </div>
              ))}

              {estruturaSalarial.length > 0 && (
                <div className="mt-4 flex items-center gap-6 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-8 rounded bg-blue-100" /> Faixa (mín–máx)</span>
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-1 rounded bg-primary" /> Mediana entre cargos do nível</span>
                </div>
              )}
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
                <button onClick={() => setSelectedCargo(null)} className="text-neutral-400 hover:text-neutral-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cargo</p>
                  <p className="mt-1 text-lg font-bold text-neutral-900">{selectedCargo.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                    <p className="mt-1 text-sm text-neutral-700">{selectedCargo.departamento}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Regime</p>
                    <div className="mt-1">{regimeBadge(selectedCargo.regime)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Nível</p>
                    <div className="mt-1">{nivelBadge(selectedCargo.nivel)}</div>
                  </div>
                  {selectedCargo.cbo && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">CBO</p>
                      <p className="mt-1 font-mono text-sm text-neutral-700">{selectedCargo.cbo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Vagas em Aberto</p>
                    <p className={`mt-1 text-sm font-bold ${selectedCargo.vagasAbertas > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedCargo.vagasAbertas > 0 ? `+${selectedCargo.vagasAbertas} vaga(s)` : 'Sem vagas'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">HC Aprovado</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">{selectedCargo.hc_aprovado}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">HC Atual</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">{selectedCargo.hcAtual}</p>
                  </div>
                </div>

                {/* CLT: faixa salarial */}
                {selectedCargo.regime === 'CLT' && selectedCargo.faixaClt && (
                  <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                      <DollarSign className="inline h-3 w-3 mr-1" />Faixa Salarial
                    </p>
                    <div className="flex items-end justify-between">
                      <div className="text-center">
                        <p className="text-[10px] text-neutral-400 uppercase">Mínimo</p>
                        <p className="text-lg font-bold text-neutral-700">{fmtBrl(selectedCargo.faixaClt.faixa_min)}</p>
                      </div>
                      <div className="h-px flex-1 mx-3 bg-neutral-200 self-center" />
                      <div className="text-center">
                        <p className="text-[10px] text-neutral-400 uppercase">Máximo</p>
                        <p className="text-lg font-bold text-neutral-700">{fmtBrl(selectedCargo.faixaClt.faixa_max)}</p>
                      </div>
                    </div>
                    {(selectedCargo.faixaClt.inclui_insalubridade || selectedCargo.faixaClt.inclui_periculosidade || selectedCargo.faixaClt.elegivel_plr) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedCargo.faixaClt.inclui_insalubridade && <Badge variant="warning">Insalubridade</Badge>}
                        {selectedCargo.faixaClt.inclui_periculosidade && <Badge variant="danger">Periculosidade</Badge>}
                        {selectedCargo.faixaClt.elegivel_plr && <Badge variant="success">PLR/Bônus</Badge>}
                      </div>
                    )}
                  </div>
                )}

                {/* PJ: trilha de compliance — documentação, não validação jurídica */}
                {selectedCargo.regime === 'PJ' && selectedCargo.pjCompliance && (
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" /> Compliance PJ — documentação, não certificação jurídica
                    </p>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase">Valor de referência</p>
                      <p className="text-lg font-bold text-neutral-800">
                        {fmtBrl(selectedCargo.pjCompliance.valor_referencia)} <span className="text-xs font-normal text-neutral-500">{MODELO_PJ_LABEL[selectedCargo.pjCompliance.modelo_remuneracao]}</span>
                      </p>
                      {selectedCargo.pjCompliance.observacao_valor && (
                        <p className="mt-1 text-xs text-neutral-500">{selectedCargo.pjCompliance.observacao_valor}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={selectedCargo.pjCompliance.exclusividade ? 'warning' : 'default'}>
                        {selectedCargo.pjCompliance.exclusividade ? 'Exclusividade' : 'Sem exclusividade'}
                      </Badge>
                      <Badge variant="default">{selectedCargo.pjCompliance.controle_ponto ? 'Com controle de ponto' : 'Sem controle de ponto'}</Badge>
                      <Badge variant="default">{selectedCargo.pjCompliance.ferramentas_proprias ? 'Ferramentas próprias' : 'Ferramentas da empresa'}</Badge>
                    </div>
                    {selectedCargo.pjCompliance.exclusividade && selectedCargo.pjCompliance.justificativa_exclusividade && (
                      <div>
                        <p className="text-[10px] text-neutral-500 uppercase">Justificativa da exclusividade</p>
                        <p className="text-xs text-neutral-700">{selectedCargo.pjCompliance.justificativa_exclusividade}</p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedCargo.faixaClt && !selectedCargo.pjCompliance && !souAdministrador && (
                  <p className="text-xs italic text-neutral-500">Dados de remuneração visíveis só para Administradores.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <NovoCargoModal open={modalAberto} onClose={() => setModalAberto(false)} onSalvo={carregar} />
    </AppShell>
  )
}
