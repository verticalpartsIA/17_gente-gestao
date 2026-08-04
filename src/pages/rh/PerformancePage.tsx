import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { AvaliacaoExperienciaTab } from '@/components/rh/AvaliacaoExperienciaTab'
import { useAuth } from '@/lib/auth'
import { getProfilerResumo, type ProfilerResumo } from '@/lib/profilerContract'
import { listarDepartamentos } from '@/lib/cargosRepo'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import { NovoObjetivoModal } from '@/components/rh/NovoObjetivoModal'
import { NovoTreinamentoModal } from '@/components/rh/NovoTreinamentoModal'
import {
  listarTreinamentos,
  listarAudiencia,
  marcarConclusao,
  type TreinamentoComProgresso,
  type MembroAudiencia,
} from '@/lib/treinamentosRepo'
import {
  listarObjetivos,
  listarCiclos,
  listarCheckins,
  registrarCheckin,
  calcularKpis,
  calcularAnalisePerformance,
  progressoObjetivo,
  progressoResultadoChave,
  type Objetivo,
  type ObjetivoStatus,
  type Ciclo,
  type Checkin,
  type KpisMetas,
  type AnalisePerformance,
} from '@/lib/metasRepo'
import {
  Target,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
  X,
  Send,
  Check,
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

// AVD, 9-Box e PDI ainda não têm tabela real no Supabase — inclusive alguns
// registros fabricados citavam o CEO real (Gelson Simões) em metas/mentorias
// que ele nunca registrou. Arrays vazios até existir integração de verdade.
// Metas/OKR e Treinamentos já são reais — ver rh_metas_*/src/lib/metasRepo.ts
// e rh_treinamentos*/src/lib/treinamentosRepo.ts.
const AVD_DATA: { initials: string; name: string; dept: string; autoav: number | null; gestor: number | null; pares: number | null; media: number | null; status: string }[] = []
const NINEBOX_CELLS: { label: string; desc: string; perf: number; pot: number; color: string; people: string[] }[] = []
const PDI_AP: { titulo: string; descricao: string; prazo: string; progresso: number; status: string }[] = []

const NIVEL_LABEL: Record<Objetivo['nivel'], string> = { corporativa: 'Corporativa', area: 'Área', individual: 'Individual' }

function nivelObjetivoBadge(nivel: Objetivo['nivel']) {
  const map: Record<Objetivo['nivel'], 'admin' | 'leader' | 'info'> = { corporativa: 'admin', area: 'leader', individual: 'info' }
  return <Badge variant={map[nivel]}>{NIVEL_LABEL[nivel]}</Badge>
}

function statusObjetivoBadge(status: Objetivo['status']) {
  if (status === 'concluido')    return <Badge variant="success">Concluído</Badge>
  if (status === 'atrasado')     return <Badge variant="danger">Atrasado</Badge>
  if (status === 'em_andamento') return <Badge variant="warning">Em andamento</Badge>
  return <Badge variant="default">Não iniciado</Badge>
}

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

const TABS = [
  'Avaliação de Desempenho',
  'Avaliação de Experiência',
  'Matriz 9-Box',
  'Metas / OKRs',
  'Análise de Performance',
  'PDI',
  'Treinamentos',
]

// O menu lateral aponta 8 valores de ?tab= para esta página. Sete têm aba real
// — 'experiencia' passou a ter com a Avaliação de Experiência (45/90 dias),
// 'performance' passou a ter como painel analítico sobre Metas/OKR real.
const TAB_BY_QUERY: Record<string, number> = {
  avaliacao:    0,
  experiencia:  1,
  '9box':       2,
  metas:        3,
  performance:  4,
  pdi:          5,
  treinamentos: 6,
}

// 'competencias' segue sem tela própria. Mostra aviso honesto em vez de cair
// silenciosamente na aba de Avaliação de Desempenho — mandar para a "aba
// mais próxima" faz o menu parecer entregar algo que não existe.
const NO_CONTENT_LABEL: Record<string, string> = {
  competencias: 'Competências',
}

const STATUS_LABEL: Record<ObjetivoStatus, string> = {
  concluido: 'Concluído', em_andamento: 'Em andamento', atrasado: 'Atrasado', nao_iniciado: 'Não iniciado',
}
const STATUS_COLOR: Record<ObjetivoStatus, string> = {
  concluido: 'bg-green-500', em_andamento: 'bg-blue-500', atrasado: 'bg-red-500', nao_iniciado: 'bg-neutral-300',
}

export default function PerformancePage() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [profiler, setProfiler] = useState<ProfilerResumo | null>(null)

  // Metas / OKR — dado real (rh_metas_*, src/lib/metasRepo.ts)
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [kpisMetas, setKpisMetas] = useState<KpisMetas>({ ativas: 0, noPrazo: 0, atrasadas: 0, concluidasPct: 0 })
  const [departamentosMetas, setDepartamentosMetas] = useState<string[]>([])
  const [carregandoMetas, setCarregandoMetas] = useState(false)
  const [erroMetas, setErroMetas] = useState<string | null>(null)
  const [filtroCiclo, setFiltroCiclo] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [filtroRegime, setFiltroRegime] = useState<'' | 'CLT' | 'PJ'>('')
  const [modalObjetivoAberto, setModalObjetivoAberto] = useState(false)
  const [objetivoSelecionado, setObjetivoSelecionado] = useState<Objetivo | null>(null)
  const [krCheckin, setKrCheckin] = useState('')
  const [valorCheckin, setValorCheckin] = useState('')
  const [comentarioCheckin, setComentarioCheckin] = useState('')
  const [historicoCheckin, setHistoricoCheckin] = useState<Checkin[]>([])
  const [salvandoCheckin, setSalvandoCheckin] = useState(false)

  // Análise de Performance — agregação sobre os mesmos rh_metas_*, sem tabela nova.
  const [analise, setAnalise] = useState<AnalisePerformance | null>(null)
  const [carregandoAnalise, setCarregandoAnalise] = useState(false)

  // Treinamentos — dado real (rh_treinamentos*, src/lib/treinamentosRepo.ts)
  const [treinamentos, setTreinamentos] = useState<TreinamentoComProgresso[]>([])
  const [carregandoTreinamentos, setCarregandoTreinamentos] = useState(false)
  const [erroTreinamentos, setErroTreinamentos] = useState<string | null>(null)
  const [modalTreinamentoAberto, setModalTreinamentoAberto] = useState(false)
  const [treinamentoSelecionado, setTreinamentoSelecionado] = useState<TreinamentoComProgresso | null>(null)
  const [audiencia, setAudiencia] = useState<MembroAudiencia[]>([])
  const [marcandoConclusao, setMarcandoConclusao] = useState<string | null>(null)

  const urlTab = searchParams.get('tab')

  useEffect(() => {
    if (urlTab && urlTab in TAB_BY_QUERY) setActiveTab(TAB_BY_QUERY[urlTab])
  }, [urlTab])

  // PDI deveria usar perfil comportamental do Profiler — issue #56. Ainda
  // 'nao_implementado' (ver src/lib/profilerContract.ts).
  useEffect(() => {
    if (profile) getProfilerResumo(profile.id).then(setProfiler)
  }, [profile])

  const carregarMetas = () => {
    if (!persistenciaDisponivel()) return
    setCarregandoMetas(true)
    setErroMetas(null)
    Promise.all([
      listarObjetivos({
        cicloId: filtroCiclo || undefined,
        departamento: filtroDepartamento || undefined,
        regime: filtroRegime || undefined,
      }),
      calcularKpis(filtroCiclo || undefined),
    ])
      .then(([o, k]) => { setObjetivos(o); setKpisMetas(k) })
      .catch(e => setErroMetas(e instanceof Error ? e.message : 'Erro ao carregar metas.'))
      .finally(() => setCarregandoMetas(false))
  }

  useEffect(() => {
    if (!persistenciaDisponivel()) return
    listarCiclos().then(setCiclos).catch(() => setCiclos([]))
    listarDepartamentos().then(setDepartamentosMetas).catch(() => setDepartamentosMetas([]))
  }, [])

  useEffect(carregarMetas, [filtroCiclo, filtroDepartamento, filtroRegime])

  const carregarTreinamentos = () => {
    if (!persistenciaDisponivel()) return
    setCarregandoTreinamentos(true)
    setErroTreinamentos(null)
    listarTreinamentos()
      .then(setTreinamentos)
      .catch(e => setErroTreinamentos(e instanceof Error ? e.message : 'Erro ao carregar treinamentos.'))
      .finally(() => setCarregandoTreinamentos(false))
  }

  useEffect(carregarTreinamentos, [])

  useEffect(() => {
    if (!treinamentoSelecionado) return
    const atualizado = treinamentos.find(t => t.id === treinamentoSelecionado.id)
    if (atualizado) setTreinamentoSelecionado(atualizado)
  }, [treinamentos])

  function abrirTreinamento(t: TreinamentoComProgresso) {
    setTreinamentoSelecionado(t)
    listarAudiencia(t.id).then(setAudiencia).catch(() => setAudiencia([]))
  }

  async function handleMarcarConclusao(colaboradorId: string) {
    if (!profile || !treinamentoSelecionado) return
    setMarcandoConclusao(colaboradorId)
    setErroTreinamentos(null)
    try {
      await marcarConclusao(treinamentoSelecionado.id, colaboradorId, profile.id)
      setAudiencia(await listarAudiencia(treinamentoSelecionado.id))
      carregarTreinamentos()
    } catch (e) {
      setErroTreinamentos(e instanceof Error ? e.message : 'Erro ao registrar conclusão.')
    } finally {
      setMarcandoConclusao(null)
    }
  }

  useEffect(() => {
    if (activeTab !== 4 || !persistenciaDisponivel()) return
    setCarregandoAnalise(true)
    calcularAnalisePerformance().then(setAnalise).finally(() => setCarregandoAnalise(false))
  }, [activeTab])

  useEffect(() => {
    if (!krCheckin) { setHistoricoCheckin([]); return }
    listarCheckins(krCheckin).then(setHistoricoCheckin).catch(() => setHistoricoCheckin([]))
  }, [krCheckin])

  // Reconcilia o painel aberto com a lista recém-recarregada (ex.: depois de um check-in).
  useEffect(() => {
    if (!objetivoSelecionado) return
    const atualizado = objetivos.find(o => o.id === objetivoSelecionado.id)
    if (atualizado) setObjetivoSelecionado(atualizado)
  }, [objetivos])

  function abrirObjetivo(o: Objetivo) {
    setObjetivoSelecionado(o)
    setKrCheckin(o.resultadosChave[0]?.id ?? '')
    setValorCheckin('')
    setComentarioCheckin('')
  }

  async function handleRegistrarCheckin() {
    if (!krCheckin || !profile || valorCheckin === '') return
    setSalvandoCheckin(true)
    setErroMetas(null)
    try {
      await registrarCheckin(krCheckin, Number(valorCheckin), comentarioCheckin || null, profile.id)
      setValorCheckin('')
      setComentarioCheckin('')
      carregarMetas()
      listarCheckins(krCheckin).then(setHistoricoCheckin)
    } catch (e) {
      setErroMetas(e instanceof Error ? e.message : 'Erro ao registrar check-in.')
    } finally {
      setSalvandoCheckin(false)
    }
  }

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
          <KpiCard icon={ClipboardCheck} color="green"  label="AVALIAÇÕES CONCLUÍDAS" value="0" sub="Módulo ainda não integrado" />
          <KpiCard icon={Target}         color="brand"  label="METAS ATIVAS"          value={String(kpisMetas.ativas)} sub="Dado real (rh_metas)" />
          <KpiCard icon={TrendingUp}     color="blue"   label="PDIs ATIVOS"           value="0"     sub="Módulo ainda não integrado" />
          <KpiCard icon={BookOpen}       color="purple" label="TREINAMENTOS"           value={String(treinamentos.length)} sub="Dado real (rh_treinamentos)" />
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
              {/* AVD é o ciclo trimestral (autoavaliação/gestor/pares) — instrumento
                  diferente da Avaliação de Experiência, que tem aba própria. */}
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('O ciclo de AVD ainda não está conectado ao banco de dados.\n\nPara avaliar o período de experiência (45/90 dias), use a aba "Avaliação de Experiência".')}>Nova Avaliação</Button>
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
                  {AVD_DATA.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhuma avaliação registrada ainda.</td></tr>
                  )}
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

        {/* Tab 1 — Avaliação de Experiência (45 / 90 dias) */}
        {activeTab === 1 && <AvaliacaoExperienciaTab />}

        {/* Tab 2 — Matriz 9-Box */}
        {activeTab === 2 && (
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

        {/* Tab 3 — Metas / OKRs (dado real, rh_metas_*) */}
        {activeTab === 3 && (
          <div className="space-y-4">
            {/* Dashboard geral */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard icon={Target}       color="brand"  label="OBJETIVOS ATIVOS" value={String(kpisMetas.ativas)} sub="Dado real" />
              <KpiCard icon={ClipboardCheck} color="green" label="NO PRAZO"        value={String(kpisMetas.noPrazo)} sub="Dado real" />
              <KpiCard icon={AlertTriangle} color="red"    label="ATRASADOS"       value={String(kpisMetas.atrasadas)} sub="Dado real" />
              <KpiCard icon={TrendingUp}    color="blue"   label="% CONCLUÍDOS"    value={`${kpisMetas.concluidasPct}%`} sub="Dado real" />
            </div>

            <Card theme="light" noPadding>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 pt-5 pb-4">
                <div className="flex flex-wrap gap-2">
                  <select value={filtroCiclo} onChange={e => setFiltroCiclo(e.target.value)} className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs">
                    <option value="">Todos os ciclos</option>
                    {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <select value={filtroDepartamento} onChange={e => setFiltroDepartamento(e.target.value)} className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs">
                    <option value="">Todos os departamentos</option>
                    {departamentosMetas.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={filtroRegime} onChange={e => setFiltroRegime(e.target.value as '' | 'CLT' | 'PJ')} className="rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs">
                    <option value="">CLT e PJ</option>
                    <option value="CLT">Só CLT</option>
                    <option value="PJ">Só PJ</option>
                  </select>
                </div>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalObjetivoAberto(true)}>Novo Objetivo</Button>
              </CardHeader>
              <CardContent className="divide-y divide-neutral-100 px-5">
                {erroMetas && (
                  <p className="py-3 text-xs text-red-600 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {erroMetas}</p>
                )}
                {carregandoMetas && <Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto my-6" />}
                {!carregandoMetas && objetivos.length === 0 && (
                  <p className="py-8 text-center text-sm text-neutral-400">Nenhum objetivo cadastrado ainda.</p>
                )}
                {objetivos.map(o => {
                  const progresso = progressoObjetivo(o)
                  return (
                    <button key={o.id} onClick={() => abrirObjetivo(o)} className="block w-full text-left py-4 space-y-2 hover:bg-neutral-50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-neutral-900 truncate">{o.titulo}</p>
                            {nivelObjetivoBadge(o.nivel)}
                            {statusObjetivoBadge(o.status)}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {o.colaborador?.name ?? o.departamento ?? 'Corporativa'} · Peso {o.peso}% · {o.resultadosChave.length} resultado(s)-chave
                          </p>
                        </div>
                        <span className={`text-xl font-black shrink-0 ${
                          progresso === 100 ? 'text-green-600' : progresso >= 70 ? 'text-blue-600' : progresso >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {progresso}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded bg-neutral-100 overflow-hidden">
                        <div className={`h-full rounded transition-all ${progressColor(progresso)}`} style={{ width: `${progresso}%` }} />
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 4 — Análise de Performance (agregação sobre rh_metas_*, sem tabela nova) */}
        {activeTab === 4 && (
          <div className="space-y-4">
            {carregandoAnalise && <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />}
            {!carregandoAnalise && analise && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <KpiCard icon={TrendingUp}      color="brand" label="ATINGIMENTO MÉDIO" value={`${analise.mediaGeral}%`} sub="Todos os objetivos" />
                  <KpiCard icon={Target}          color="blue"  label="OBJETIVOS ANALISADOS" value={String(analise.totalObjetivos)} sub="Dado real" />
                  <KpiCard icon={ClipboardCheck}  color="green" label="% CONCLUÍDOS"      value={`${analise.concluidosPct}%`} sub="Dado real" />
                  <KpiCard icon={AlertTriangle}   color="red"   label="ATRASADOS"         value={String(analise.atrasados.length)} sub="Precisam de atenção" />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Card theme="light">
                    <CardHeader className="border-b border-neutral-200 pb-4"><CardTitle>Atingimento por Departamento</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {analise.porDepartamento.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Sem dado suficiente ainda.</p>}
                      {analise.porDepartamento.map(d => (
                        <div key={d.departamento} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-700">{d.departamento} <span className="text-neutral-400">({d.total})</span></span>
                            <span className="font-bold text-neutral-700">{d.media}%</span>
                          </div>
                          <div className="h-2 rounded bg-neutral-100 overflow-hidden">
                            <div className={`h-full rounded ${progressColor(d.media)}`} style={{ width: `${d.media}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card theme="light">
                    <CardHeader className="border-b border-neutral-200 pb-4"><CardTitle>Evolução por Ciclo</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {analise.porCiclo.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Sem dado suficiente ainda.</p>}
                      {analise.porCiclo.map(c => (
                        <div key={c.cicloId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-700">{c.cicloNome} <span className="text-neutral-400">({c.total})</span></span>
                            <span className="font-bold text-neutral-700">{c.media}%</span>
                          </div>
                          <div className="h-2 rounded bg-neutral-100 overflow-hidden">
                            <div className={`h-full rounded ${progressColor(c.media)}`} style={{ width: `${c.media}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card theme="light">
                    <CardHeader className="border-b border-neutral-200 pb-4"><CardTitle>CLT × PJ</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {analise.porRegime.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Sem colaborador com cargo cadastrado o suficiente pra identificar o regime.</p>}
                      {analise.porRegime.map(r => (
                        <div key={r.regime} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-700">{r.regime} <span className="text-neutral-400">({r.total})</span></span>
                            <span className="font-bold text-neutral-700">{r.media}%</span>
                          </div>
                          <div className="h-2 rounded bg-neutral-100 overflow-hidden">
                            <div className={`h-full rounded ${progressColor(r.media)}`} style={{ width: `${r.media}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card theme="light">
                    <CardHeader className="border-b border-neutral-200 pb-4"><CardTitle>Distribuição de Status</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {analise.distribuicaoStatus.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Sem dado suficiente ainda.</p>}
                      <div className="flex h-4 w-full rounded overflow-hidden">
                        {analise.distribuicaoStatus.map(d => (
                          <div key={d.status} className={STATUS_COLOR[d.status]} style={{ width: `${d.pct}%` }} title={`${STATUS_LABEL[d.status]}: ${d.pct}%`} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500">
                        {analise.distribuicaoStatus.map(d => (
                          <span key={d.status} className="flex items-center gap-1.5">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLOR[d.status]}`} /> {STATUS_LABEL[d.status]} ({d.pct}%)
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card theme="light" noPadding>
                  <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4"><CardTitle>Objetivos Atrasados</CardTitle></CardHeader>
                  <CardContent className="divide-y divide-neutral-100 px-5">
                    {analise.atrasados.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Nenhum objetivo atrasado. 🎉</p>}
                    {analise.atrasados.map(o => (
                      <button key={o.id} onClick={() => { setActiveTab(3); abrirObjetivo(o) }} className="block w-full text-left py-3 hover:bg-neutral-50">
                        <p className="text-sm font-medium text-neutral-900">{o.titulo}</p>
                        <p className="text-xs text-neutral-500">{o.colaborador?.name ?? o.departamento ?? 'Corporativa'} · {progressoObjetivo(o)}% concluído</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Tab 5 — PDI */}
        {activeTab === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900">Planos de Desenvolvimento Individual</h3>
                <p className="text-xs text-neutral-500">Ciclo 2026</p>
              </div>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Ação ainda não está conectado ao banco de dados.')}>Nova Ação</Button>
            </div>

            {profiler && (
              <p className="text-xs italic text-neutral-500">
                Perfil comportamental (Profiler) para orientar o PDI: {profiler.statusProfiler === 'nao_implementado'
                  ? 'ainda não disponível — motor de cálculo do Profiler não implementado.'
                  : profiler.perfilPredominante}
              </p>
            )}
            {PDI_AP.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-400">Nenhum PDI cadastrado ainda.</p>
            )}
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

        {/* Tab 6 — Treinamentos (dado real, rh_treinamentos*) */}
        {activeTab === 6 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Treinamentos</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalTreinamentoAberto(true)}>Novo Treinamento</Button>
            </CardHeader>
            <CardContent className="divide-y divide-neutral-100 px-5">
              {erroTreinamentos && (
                <p className="py-3 text-xs text-red-600 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {erroTreinamentos}</p>
              )}
              {carregandoTreinamentos && <Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto my-6" />}
              {!carregandoTreinamentos && treinamentos.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-400">Nenhum treinamento cadastrado ainda.</p>
              )}
              {treinamentos.map(t => (
                <button key={t.id} onClick={() => abrirTreinamento(t)} className="block w-full text-left py-4 space-y-2 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-900">{t.nome}</span>
                      <Badge variant={t.tipo === 'obrigatorio' ? 'danger' : 'info'}>{t.tipo === 'obrigatorio' ? 'Obrigatório' : 'Opcional'}</Badge>
                      <span className="text-[11px] text-neutral-400">
                        {t.nivel_publico === 'empresa' ? 'Empresa toda' : t.nivel_publico === 'departamento' ? t.departamento : 'Individual'}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-500">{t.concluidos}/{t.audienciaTotal} concluídos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded bg-neutral-100 overflow-hidden">
                      <div className={`h-full rounded ${progressColor(t.progresso)}`} style={{ width: `${t.progresso}%` }} />
                    </div>
                    <span className={`text-sm font-bold w-10 text-right ${
                      t.progresso === 100 ? 'text-green-600' : t.progresso >= 70 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>{t.progresso}%</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Side Panel — Objetivo detalhe + check-ins */}
      {objetivoSelecionado && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setObjetivoSelecionado(null)} />
          <div className="relative z-50 w-96 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Detalhe do Objetivo</h3>
              <button onClick={() => setObjetivoSelecionado(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Objetivo</p>
                <p className="mt-1 text-base font-bold text-neutral-900">{objetivoSelecionado.titulo}</p>
                {objetivoSelecionado.descricao && <p className="mt-1 text-xs text-neutral-500">{objetivoSelecionado.descricao}</p>}
                <div className="mt-2 flex items-center gap-2">
                  {nivelObjetivoBadge(objetivoSelecionado.nivel)}
                  {statusObjetivoBadge(objetivoSelecionado.status)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Resultados-Chave</p>
                {objetivoSelecionado.resultadosChave.map(kr => {
                  const p = progressoResultadoChave(kr)
                  return (
                    <div key={kr.id} className="rounded border border-neutral-200 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-800">{kr.titulo}</p>
                        <span className="text-sm font-bold text-neutral-700">{p}%</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Base {kr.linha_base} → Alvo {kr.meta_alvo} · Atual {kr.valor_atual} ({kr.unidade_medida})
                      </p>
                      <div className="h-1.5 w-full rounded bg-neutral-100 overflow-hidden">
                        <div className={`h-full rounded ${progressColor(p)}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Check-in */}
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Registrar Check-in</p>
                <select value={krCheckin} onChange={e => setKrCheckin(e.target.value)} className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm">
                  {objetivoSelecionado.resultadosChave.map(kr => <option key={kr.id} value={kr.id}>{kr.titulo}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Novo valor atual"
                  value={valorCheckin}
                  onChange={e => setValorCheckin(e.target.value)}
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <textarea
                  placeholder="Comentário / justificativa de desvio (opcional)"
                  value={comentarioCheckin}
                  onChange={e => setComentarioCheckin(e.target.value)}
                  rows={2}
                  className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <Button size="sm" className="w-full" leftIcon={<Send className="h-3.5 w-3.5" />} loading={salvandoCheckin} disabled={valorCheckin === ''} onClick={handleRegistrarCheckin}>
                  Registrar
                </Button>
              </div>

              {historicoCheckin.length > 0 && (
                <div className="border-t border-neutral-100 pt-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Histórico</p>
                  {historicoCheckin.map(c => (
                    <div key={c.id} className="text-xs text-neutral-600 border-l-2 border-neutral-200 pl-2">
                      <p>{c.valor_anterior} → <strong>{c.valor_novo}</strong> <span className="text-neutral-400">{new Date(c.criado_em).toLocaleString('pt-BR')}</span></p>
                      {c.comentario && <p className="text-neutral-500 italic">{c.comentario}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NovoObjetivoModal open={modalObjetivoAberto} onClose={() => setModalObjetivoAberto(false)} onSalvo={carregarMetas} />

      {/* Side Panel — Treinamento: audiência + marcar conclusão */}
      {treinamentoSelecionado && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTreinamentoSelecionado(null)} />
          <div className="relative z-50 w-96 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Detalhe do Treinamento</h3>
              <button onClick={() => setTreinamentoSelecionado(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Treinamento</p>
                <p className="mt-1 text-base font-bold text-neutral-900">{treinamentoSelecionado.nome}</p>
                {treinamentoSelecionado.descricao && <p className="mt-1 text-xs text-neutral-500">{treinamentoSelecionado.descricao}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={treinamentoSelecionado.tipo === 'obrigatorio' ? 'danger' : 'info'}>
                    {treinamentoSelecionado.tipo === 'obrigatorio' ? 'Obrigatório' : 'Opcional'}
                  </Badge>
                  {treinamentoSelecionado.carga_horaria != null && <span className="text-xs text-neutral-500">{treinamentoSelecionado.carga_horaria}h</span>}
                  {treinamentoSelecionado.data_limite && (
                    <span className="text-xs text-neutral-500 flex items-center gap-1"><Clock className="h-3 w-3" /> até {new Date(treinamentoSelecionado.data_limite).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Audiência ({treinamentoSelecionado.concluidos}/{treinamentoSelecionado.audienciaTotal} concluídos)
                </p>
                {audiencia.map(m => (
                  <div key={m.colaboradorId} className="flex items-center justify-between gap-2 rounded border border-neutral-200 p-2.5">
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-800 truncate">{m.nome}</p>
                      <p className="text-[11px] text-neutral-400">
                        {m.status === 'concluido' && m.concluidoEm ? `Concluído em ${new Date(m.concluidoEm).toLocaleDateString('pt-BR')}` : m.department}
                      </p>
                    </div>
                    {m.status === 'concluido' ? (
                      <Badge variant="success"><Check className="h-3 w-3" /></Badge>
                    ) : m.status === 'atrasado' ? (
                      <Badge variant="danger">Atrasado</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={marcandoConclusao === m.colaboradorId}
                        onClick={() => handleMarcarConclusao(m.colaboradorId)}
                      >
                        Marcar concluído
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <NovoTreinamentoModal open={modalTreinamentoAberto} onClose={() => setModalTreinamentoAberto(false)} onSalvo={carregarTreinamentos} />
    </AppShell>
  )
}
