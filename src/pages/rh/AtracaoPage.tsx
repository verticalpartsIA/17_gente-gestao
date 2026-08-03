import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { useAuth } from '@/lib/auth'
import { getProfilerResumo, type ProfilerResumo } from '@/lib/profilerContract'
import { NovaRequisicaoVagaModal } from '@/components/rh/NovaRequisicaoVagaModal'
import { NovoCandidatoModal } from '@/components/rh/NovoCandidatoModal'
import { NovaEntrevistaModal } from '@/components/rh/NovaEntrevistaModal'
import { ComunicacoesWhatsapp } from '@/components/rh/ComunicacoesWhatsapp'
import {
  listarVagas,
  listarAprovacoes,
  aprovarVaga,
  recusarVaga,
  reenviarVaga,
  avancarStatus,
  ehAprovadorExecutivo,
  persistenciaDisponivel,
  listarCandidatos,
  listarEntrevistas,
  atualizarEtapaCandidato,
  atualizarEntrevista,
  vagaAceitaCandidatos,
  ETAPAS_PIPELINE,
  ETAPA_LABEL,
  ENTREVISTA_TIPO_LABEL,
  listarAdmissoes,
  listarDocumentosPorAdmissoes,
  marcarDocumento,
  marcarContratoAssinado,
  type Vaga,
  type Aprovacao,
  type VagaStatus,
  type Candidato,
  type CandidatoEtapa,
  type Entrevista,
  type EntrevistaStatus,
  type Admissao,
  type AdmissaoDocumento,
} from '@/lib/contratacaoRepo'
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  X,
  Plus,
  ChevronRight,
  ArrowRightCircle,
  Ban,
  Send,
  Loader2,
  AlertTriangle,
  UserPlus,
} from 'lucide-react'

// ── Requisições — Kanban (Etapas 1-3, dados reais) ───────────────────────────

const KANBAN_STATUSES: VagaStatus[] = ['aguardando_aprovacao', 'aprovada', 'em_triagem', 'em_pipeline', 'concluida']

const STATUS_LABEL: Record<VagaStatus, string> = {
  aguardando_aprovacao: 'Aguardando Aprovação CEO',
  aprovada: 'Aprovada — RH Assume',
  em_triagem: 'Em Triagem',
  em_pipeline: 'Em Pipeline',
  concluida: 'Concluída',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
}

// Etapas que o RH avança manualmente depois da aprovação executiva.
const PROXIMA_ETAPA: Partial<Record<VagaStatus, VagaStatus>> = {
  aprovada: 'em_triagem',
  em_triagem: 'em_pipeline',
  em_pipeline: 'concluida',
}


// ── Helpers ──────────────────────────────────────────────────────────────────

function prioridadeBadge(p: Vaga['prioridade']) {
  if (p === 'critica') return <Badge variant="danger">Crítica</Badge>
  if (p === 'alta')    return <Badge variant="warning">Alta</Badge>
  return <Badge variant="default">Normal</Badge>
}

function tipoVagaLabel(t: Vaga['tipo_vaga']) {
  if (t === 'substituicao') return 'Substituição'
  if (t === 'projeto_temporario') return 'Projeto temporário'
  return 'Aumento de quadro'
}

function faixaLabel(vaga: Vaga) {
  if (vaga.faixa_min === null && vaga.faixa_max === null) return '—'
  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
  if (vaga.faixa_min !== null && vaga.faixa_max !== null) return `R$ ${fmt(vaga.faixa_min)} – ${fmt(vaga.faixa_max)}`
  return `R$ ${fmt((vaga.faixa_min ?? vaga.faixa_max)!)}`
}

function dataLabel(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function etapaCandidatoBadge(etapa: CandidatoEtapa) {
  if (etapa === 'contratado' || etapa === 'proposta_enviada') return <Badge variant="success">{ETAPA_LABEL[etapa]}</Badge>
  if (etapa === 'reprovado') return <Badge variant="danger">{ETAPA_LABEL[etapa]}</Badge>
  if (etapa === 'triagem') return <Badge variant="default">{ETAPA_LABEL[etapa]}</Badge>
  return <Badge variant="info">{ETAPA_LABEL[etapa]}</Badge>
}

function entrevistaStatusBadge(status: EntrevistaStatus) {
  if (status === 'realizada') return <Badge variant="success">Realizada</Badge>
  if (status === 'cancelada') return <Badge variant="danger">Cancelada</Badge>
  return <Badge variant="info">Agendada</Badge>
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function dataHoraLabel(iso: string) {
  const d = new Date(iso)
  return {
    dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

const HOJE = new Date().toISOString().slice(0, 10)

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AtracaoPage() {
  const { profile } = useAuth()
  const [profiler, setProfiler] = useState<ProfilerResumo | null>(null)

  // Comparação entre perfil esperado da vaga e perfil comportamental do
  // candidato deveria vir do Profiler — issue #56. Ainda 'nao_implementado'
  // (ver src/lib/profilerContract.ts).
  useEffect(() => {
    if (profile) getProfilerResumo(profile.id).then(setProfiler)
  }, [profile])
  const [activeTab, setActiveTab] = useState(0)
  const [modalAberto, setModalAberto] = useState(false)

  const [vagas, setVagas] = useState<Vaga[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)

  const [selectedReq, setSelectedReq] = useState<Vaga | null>(null)
  const [colunaDestacada, setColunaDestacada] = useState<VagaStatus | null>(null)
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([])
  const [mostrarFormRecusa, setMostrarFormRecusa] = useState(false)
  const [justificativaRecusa, setJustificativaRecusa] = useState('')
  const [podeReabrirEm, setPodeReabrirEm] = useState('')
  const [textoReenvio, setTextoReenvio] = useState('')
  const [acaoCarregando, setAcaoCarregando] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)

  // Pipeline de candidatos
  const [vagaSelecionadaId, setVagaSelecionadaId] = useState<string | null>(null)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [carregandoPipeline, setCarregandoPipeline] = useState(false)
  const [erroPipeline, setErroPipeline] = useState<string | null>(null)
  const [pipelineAcaoErro, setPipelineAcaoErro] = useState<string | null>(null)
  const [modalCandidatoAberto, setModalCandidatoAberto] = useState(false)
  const [entrevistaAlvo, setEntrevistaAlvo] = useState<Candidato | null>(null)

  // Admissão Digital
  const [admissoes, setAdmissoes] = useState<Admissao[]>([])
  const [documentosPorAdmissao, setDocumentosPorAdmissao] = useState<Record<string, AdmissaoDocumento[]>>({})
  const [carregandoAdmissoes, setCarregandoAdmissoes] = useState(false)
  const [erroAdmissoes, setErroAdmissoes] = useState<string | null>(null)
  const [selectedAdm, setSelectedAdm] = useState<Admissao | null>(null)
  const [admissaoAcaoErro, setAdmissaoAcaoErro] = useState<string | null>(null)

  const TABS = ['Requisições (Kanban)', 'Pipeline de Candidatos', 'Comunicações', 'Admissão Digital']

  const carregar = useCallback(() => {
    if (!persistenciaDisponivel()) return
    setCarregando(true)
    setErroLista(null)
    listarVagas()
      .then(setVagas)
      .catch(e => setErroLista(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(carregar, [carregar])

  // Reabre o painel já com o registro atualizado depois de qualquer ação.
  function recarregarESelecionar(vagaId: string) {
    if (!persistenciaDisponivel()) return
    listarVagas().then(lista => {
      setVagas(lista)
      setSelectedReq(lista.find(v => v.id === vagaId) ?? null)
    })
  }

  useEffect(() => {
    setMostrarFormRecusa(false)
    setJustificativaRecusa('')
    setPodeReabrirEm('')
    setAcaoErro(null)
    if (!selectedReq || !persistenciaDisponivel()) {
      setAprovacoes([])
      return
    }
    listarAprovacoes(selectedReq.id).then(setAprovacoes).catch(() => setAprovacoes([]))
    setTextoReenvio(selectedReq.justificativa)
  }, [selectedReq])

  const ultimaRecusa = useMemo(
    () => [...aprovacoes].reverse().find(a => a.decisao === 'recusada'),
    [aprovacoes],
  )

  const kanbanCols = useMemo(
    () => KANBAN_STATUSES.map(status => vagas.filter(v => v.status === status)),
    [vagas],
  )
  const foraDoFluxo = useMemo(
    () => vagas.filter(v => v.status === 'recusada' || v.status === 'cancelada'),
    [vagas],
  )

  const souAprovadorExecutivo = ehAprovadorExecutivo(profile?.department)
  const souAdministrador = profile?.level === 'Administrador'

  async function handleAprovar(vaga: Vaga) {
    if (!profile) return
    setAcaoCarregando(true)
    setAcaoErro(null)
    try {
      await aprovarVaga(vaga.id, vaga.edicao, profile.id, profile.name)
      recarregarESelecionar(vaga.id)
    } catch (e) {
      setAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setAcaoCarregando(false)
    }
  }

  async function handleRecusar(vaga: Vaga) {
    if (!profile) return
    setAcaoCarregando(true)
    setAcaoErro(null)
    try {
      await recusarVaga(vaga.id, vaga.edicao, profile.id, profile.name, justificativaRecusa, podeReabrirEm || null)
      recarregarESelecionar(vaga.id)
    } catch (e) {
      setAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setAcaoCarregando(false)
    }
  }

  async function handleReenviar(vaga: Vaga) {
    setAcaoCarregando(true)
    setAcaoErro(null)
    try {
      await reenviarVaga(vaga, { justificativa: textoReenvio })
      recarregarESelecionar(vaga.id)
    } catch (e) {
      setAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setAcaoCarregando(false)
    }
  }

  async function handleAvancar(vaga: Vaga) {
    const proxima = PROXIMA_ETAPA[vaga.status]
    if (!proxima) return
    setAcaoCarregando(true)
    setAcaoErro(null)
    try {
      await avancarStatus(vaga.id, proxima)
      recarregarESelecionar(vaga.id)
    } catch (e) {
      setAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setAcaoCarregando(false)
    }
  }

  async function handleCancelar(vaga: Vaga) {
    if (!window.confirm(`Cancelar a requisição ${vaga.ticket_number}?`)) return
    setAcaoCarregando(true)
    setAcaoErro(null)
    try {
      await avancarStatus(vaga.id, 'cancelada')
      recarregarESelecionar(vaga.id)
    } catch (e) {
      setAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setAcaoCarregando(false)
    }
  }

  // ── Pipeline de candidatos ─────────────────────────────────────────────────

  const vagasElegiveisPipeline = useMemo(
    () => vagas.filter(v => vagaAceitaCandidatos(v.status)),
    [vagas],
  )
  const vagaSelecionada = vagasElegiveisPipeline.find(v => v.id === vagaSelecionadaId) ?? null

  useEffect(() => {
    if (vagaSelecionadaId && vagasElegiveisPipeline.some(v => v.id === vagaSelecionadaId)) return
    setVagaSelecionadaId(vagasElegiveisPipeline[0]?.id ?? null)
  }, [vagasElegiveisPipeline, vagaSelecionadaId])

  const carregarPipeline = useCallback(() => {
    if (!vagaSelecionadaId || !persistenciaDisponivel()) {
      setCandidatos([])
      setEntrevistas([])
      return
    }
    setCarregandoPipeline(true)
    setErroPipeline(null)
    Promise.all([listarCandidatos(vagaSelecionadaId), listarEntrevistas(vagaSelecionadaId)])
      .then(([cands, ents]) => { setCandidatos(cands); setEntrevistas(ents) })
      .catch(e => setErroPipeline(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => setCarregandoPipeline(false))
  }, [vagaSelecionadaId])

  useEffect(carregarPipeline, [carregarPipeline])

  async function handleAvancarCandidato(candidato: Candidato) {
    const idx = ETAPAS_PIPELINE.indexOf(candidato.etapa)
    if (idx === -1 || idx === ETAPAS_PIPELINE.length - 1) return
    setPipelineAcaoErro(null)
    try {
      await atualizarEtapaCandidato(candidato.id, ETAPAS_PIPELINE[idx + 1])
      carregarPipeline()
    } catch (e) {
      setPipelineAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  async function handleReprovarCandidato(candidato: Candidato) {
    if (!window.confirm(`Marcar ${candidato.nome} como reprovado?`)) return
    setPipelineAcaoErro(null)
    try {
      await atualizarEtapaCandidato(candidato.id, 'reprovado')
      carregarPipeline()
    } catch (e) {
      setPipelineAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  async function handleMarcarEntrevista(entrevista: Entrevista, status: EntrevistaStatus) {
    setPipelineAcaoErro(null)
    try {
      await atualizarEntrevista(entrevista.id, { status })
      carregarPipeline()
    } catch (e) {
      setPipelineAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  // ── Admissão Digital ───────────────────────────────────────────────────────

  const carregarAdmissoes = useCallback(() => {
    if (!persistenciaDisponivel()) return
    setCarregandoAdmissoes(true)
    setErroAdmissoes(null)
    listarAdmissoes()
      .then(async lista => {
        setAdmissoes(lista)
        setSelectedAdm(sel => (sel ? lista.find(a => a.id === sel.id) ?? null : null))
        const docs = await listarDocumentosPorAdmissoes(lista.map(a => a.id))
        const agrupado: Record<string, AdmissaoDocumento[]> = {}
        for (const d of docs) (agrupado[d.admissao_id] ??= []).push(d)
        setDocumentosPorAdmissao(agrupado)
      })
      .catch(e => setErroAdmissoes(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => setCarregandoAdmissoes(false))
  }, [])

  useEffect(carregarAdmissoes, [carregarAdmissoes])

  async function handleToggleDocumento(doc: AdmissaoDocumento) {
    setAdmissaoAcaoErro(null)
    try {
      await marcarDocumento(doc.id, !doc.entregue)
      carregarAdmissoes()
    } catch (e) {
      setAdmissaoAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  async function handleToggleContrato(adm: Admissao) {
    setAdmissaoAcaoErro(null)
    try {
      await marcarContratoAssinado(adm.id, !adm.contrato_assinado)
      carregarAdmissoes()
    } catch (e) {
      setAdmissaoAcaoErro(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  const kpiAberto = vagas.filter(v => v.status !== 'concluida' && v.status !== 'cancelada').length
  const kpiTriagem = vagas.filter(v => v.status === 'em_triagem').length
  const kpiAprovacao = vagas.filter(v => v.status === 'aguardando_aprovacao').length
  const kpiPipeline = vagas.filter(v => v.status === 'em_pipeline').length

  function irParaColunaKanban(status: VagaStatus | null) {
    setActiveTab(0)
    setColunaDestacada(status)
    if (status) {
      setTimeout(() => {
        colRefs.current[status]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }, 0)
      setTimeout(() => setColunaDestacada(null), 2000)
    }
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ATRAÇÃO DE TALENTOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"  label="VAGAS EM ABERTO"  value={String(kpiAberto)}  sub="Requisições ativas" onClick={() => irParaColunaKanban(null)} />
          <KpiCard icon={Clock}     color="brand" label="EM TRIAGEM RH"    value={String(kpiTriagem)}  sub="Aguardando análise" onClick={() => irParaColunaKanban('em_triagem')} />
          <KpiCard icon={CheckCircle} color="orange" label="AGUARD. APROVAÇÃO" value={String(kpiAprovacao)} sub="CEO / Diretoria" onClick={() => irParaColunaKanban('aguardando_aprovacao')} />
          <KpiCard icon={Users}     color="green" label="EM PIPELINE"      value={String(kpiPipeline)}  sub="Candidatos ativos" onClick={() => setActiveTab(1)} />
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

        {/* Tab 0 — Kanban */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              {!persistenciaDisponivel() && (
                <span className="flex items-center gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> Modo simulado — sem chaves do Supabase, nada é gravado.
                </span>
              )}
              {erroLista && (
                <span className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> {erroLista}
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {carregando && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalAberto(true)}>
                  Nova Requisição
                </Button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {KANBAN_STATUSES.map((status, colIdx) => (
                <div
                  key={status}
                  ref={el => { colRefs.current[status] = el }}
                  className={`w-64 shrink-0 space-y-3 rounded-lg transition-shadow ${
                    colunaDestacada === status ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">{STATUS_LABEL[status]}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-600">
                      {kanbanCols[colIdx].length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {kanbanCols[colIdx].map(req => (
                      <button
                        key={req.id}
                        onClick={() => setSelectedReq(req)}
                        className="w-full text-left rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-primary hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] text-neutral-400">{req.ticket_number}</span>
                          {prioridadeBadge(req.prioridade)}
                        </div>
                        <p className="font-semibold text-sm text-neutral-900 mb-1">{req.titulo_cargo}</p>
                        <p className="text-xs text-neutral-500 mb-2">{req.departamento}</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{req.gestor_nome}</span>
                          <span className="font-mono">{faixaLabel(req)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={req.regime === 'CLT' ? 'success' : 'info'}>{req.regime}</Badge>
                          <span className="text-[10px] text-neutral-400">{dataLabel(req.created_at)}</span>
                        </div>
                      </button>
                    ))}
                    {kanbanCols[colIdx].length === 0 && (
                      <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-400">
                        Nenhuma requisição
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fora do fluxo principal — recusadas e canceladas */}
            {foraDoFluxo.length > 0 && (
              <div className="pt-2">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Fora do Fluxo</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {foraDoFluxo.map(req => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className="w-full text-left rounded-lg border border-neutral-200 bg-neutral-50 p-4 hover:border-primary transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] text-neutral-400">{req.ticket_number}</span>
                        <Badge variant={req.status === 'recusada' ? 'danger' : 'default'}>{STATUS_LABEL[req.status]}</Badge>
                      </div>
                      <p className="font-semibold text-sm text-neutral-900">{req.titulo_cargo}</p>
                      <p className="text-xs text-neutral-500">{req.departamento} · {req.gestor_nome}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 1 — Pipeline de Candidatos */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex-1 min-w-[240px]">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Vaga
                </span>
                <select
                  value={vagaSelecionadaId ?? ''}
                  onChange={e => setVagaSelecionadaId(e.target.value || null)}
                  disabled={vagasElegiveisPipeline.length === 0}
                  className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:bg-neutral-50 disabled:text-neutral-400"
                >
                  {vagasElegiveisPipeline.length === 0 && <option value="">Nenhuma vaga aprovada ainda</option>}
                  {vagasElegiveisPipeline.map(v => (
                    <option key={v.id} value={v.id}>{v.ticket_number} — {v.titulo_cargo} ({STATUS_LABEL[v.status]})</option>
                  ))}
                </select>
              </label>
              {carregandoPipeline && <Loader2 className="mt-5 h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {profiler && (
              <p className="text-xs italic text-neutral-500">
                Comparação de perfil esperado da vaga x perfil comportamental do candidato (Profiler): {profiler.statusProfiler === 'nao_implementado'
                  ? 'ainda não disponível — motor de cálculo do Profiler não implementado.'
                  : profiler.perfilPredominante}
              </p>
            )}

            {erroPipeline && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroPipeline}</span>
              </div>
            )}
            {pipelineAcaoErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{pipelineAcaoErro}</span>
              </div>
            )}

            {vagaSelecionada && (
              <>
                {/* Pipeline stages */}
                <div className="flex items-center gap-0 overflow-x-auto">
                  {ETAPAS_PIPELINE.map((etapa, i) => (
                    <div key={etapa} className="flex items-center">
                      <div className={`shrink-0 rounded px-3 py-2 text-xs font-bold ${
                        i === 0 ? 'bg-neutral-200 text-neutral-700' :
                        i === 1 ? 'bg-blue-100 text-blue-700' :
                        i === 2 ? 'bg-yellow-100 text-yellow-700' :
                        i === 3 ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ETAPA_LABEL[etapa]}
                        <span className="ml-1 opacity-60">
                          ({candidatos.filter(c => c.etapa === etapa).length})
                        </span>
                      </div>
                      {i < ETAPAS_PIPELINE.length - 1 && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                      )}
                    </div>
                  ))}
                  {candidatos.some(c => c.etapa === 'reprovado') && (
                    <span className="ml-3 shrink-0 rounded bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
                      Reprovados ({candidatos.filter(c => c.etapa === 'reprovado').length})
                    </span>
                  )}
                </div>

                {/* Tabela candidatos */}
                <Card theme="light" noPadding>
                  <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
                    <CardTitle>Candidatos — {vagaSelecionada.ticket_number} ({vagaSelecionada.titulo_cargo})</CardTitle>
                    <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setModalCandidatoAberto(true)}>
                      Adicionar Candidato
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50">
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Candidato</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Fonte</th>
                          <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Score</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Etapa</th>
                          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {candidatos.map(c => (
                          <tr key={c.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                                  {iniciais(c.nome)}
                                </div>
                                <span className="font-medium text-neutral-900">{c.nome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-600">{c.fonte ?? '—'}</td>
                            <td className="px-4 py-3 text-center">
                              {c.score !== null
                                ? <span className={`text-lg font-black ${scoreColor(c.score)}`}>{c.score}%</span>
                                : <span className="text-neutral-400">—</span>}
                            </td>
                            <td className="px-4 py-3">{etapaCandidatoBadge(c.etapa)}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {souAdministrador && c.etapa !== 'contratado' && c.etapa !== 'reprovado' && (
                                  <>
                                    <Button variant="outline" size="sm" onClick={() => handleAvancarCandidato(c)}>Avançar Etapa</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEntrevistaAlvo(c)}>Agendar Entrevista</Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleReprovarCandidato(c)}>Reprovar</Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {candidatos.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-xs text-neutral-400">
                              Nenhum candidato ainda nesta vaga.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Entrevistas agendadas */}
                <Card theme="light" noPadding>
                  <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
                    <CardTitle>Entrevistas — {vagaSelecionada.ticket_number}</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-neutral-100 px-5">
                    {entrevistas.map(e => {
                      const cand = candidatos.find(c => c.id === e.candidato_id)
                      const { dia, hora } = dataHoraLabel(e.data_hora)
                      return (
                        <div key={e.id} className="py-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg border border-neutral-200 p-2 text-center min-w-[52px]">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{hora}</p>
                              <p className="text-lg font-black text-neutral-900">{dia}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900">{cand?.nome ?? 'Candidato removido'}</p>
                              <p className="text-xs text-neutral-500">
                                {ENTREVISTA_TIPO_LABEL[e.tipo]} · Entrevistador: {e.entrevistador_nome ?? '—'}
                                {e.local_ou_link ? ` · ${e.local_ou_link}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {entrevistaStatusBadge(e.status)}
                            {e.status === 'agendada' && souAdministrador && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleMarcarEntrevista(e, 'realizada')}>Realizada</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleMarcarEntrevista(e, 'cancelada')}>Cancelar</Button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {entrevistas.length === 0 && (
                      <p className="py-6 text-center text-xs text-neutral-400">Nenhuma entrevista agendada.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!vagaSelecionada && vagasElegiveisPipeline.length === 0 && (
              <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                Nenhuma vaga aprovada ainda — o pipeline libera assim que o CEO aprovar uma requisição.
              </div>
            )}
          </div>
        )}

        {/* Tab 2 — Comunicações */}
        {activeTab === 2 && <ComunicacoesWhatsapp />}

        {/* Tab 3 — Admissão Digital */}
        {activeTab === 3 && (
          <div className="space-y-4">
            {carregandoAdmissoes && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            {erroAdmissoes && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroAdmissoes}</span>
              </div>
            )}
            {admissaoAcaoErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{admissaoAcaoErro}</span>
              </div>
            )}

            {admissoes.length === 0 && !carregandoAdmissoes && (
              <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                Nenhuma admissão ainda — aparece aqui automaticamente quando um candidato é marcado como "Contratado" no Pipeline.
              </div>
            )}

            {admissoes.map(adm => {
              const docs = documentosPorAdmissao[adm.id] ?? []
              const concluidos = docs.filter(d => d.entregue).length
              const total = docs.length
              const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0
              const nome = adm.candidato?.nome ?? 'Candidato removido'
              return (
                <Card key={adm.id} theme="light">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">
                        {iniciais(nome)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-neutral-900">{nome}</p>
                            <p className="text-xs text-neutral-500">
                              {adm.vaga?.titulo_cargo ?? '—'} · {adm.vaga?.ticket_number ?? '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {adm.contrato_assinado
                              ? <Badge variant="success">Contrato Assinado</Badge>
                              : <Badge variant="warning">Aguardando Docs.</Badge>
                            }
                            {souAdministrador && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleContrato(adm)}
                              >
                                {adm.contrato_assinado ? 'Desfazer Assinatura' : 'Marcar Assinado'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAdm(adm.id === selectedAdm?.id ? null : adm)}
                            >
                              {selectedAdm?.id === adm.id ? 'Fechar' : 'Ver Checklist'}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-2 rounded bg-neutral-100 overflow-hidden">
                            <div
                              className={`h-full rounded ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-600">{concluidos}/{total} docs</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded checklist */}
                    {selectedAdm?.id === adm.id && (
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4">
                        {docs.map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            disabled={!souAdministrador}
                            onClick={() => handleToggleDocumento(doc)}
                            className={`flex items-center gap-2 text-left text-sm rounded p-2 transition-colors ${
                              doc.entregue ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-400'
                            } ${souAdministrador ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className="text-base">{doc.entregue ? '✓' : '○'}</span>
                            {doc.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* Side Panel — Requisição Detalhe */}
      {selectedReq && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedReq(null)} />
          <div className="relative z-50 w-96 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Requisição {selectedReq.ticket_number}</h3>
              <button onClick={() => setSelectedReq(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cargo</p>
                <p className="mt-1 text-lg font-bold text-neutral-900">{selectedReq.titulo_cargo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.departamento}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Gestor Solicitante</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.gestor_nome}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tipo</p>
                  <p className="mt-1 text-sm text-neutral-700">{tipoVagaLabel(selectedReq.tipo_vaga)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Prioridade</p>
                  <div className="mt-1">{prioridadeBadge(selectedReq.prioridade)}</div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Regime</p>
                  <div className="mt-1">
                    <Badge variant={selectedReq.regime === 'CLT' ? 'success' : 'info'}>{selectedReq.regime}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Faixa Salarial</p>
                  <p className="mt-1 text-sm font-bold text-neutral-900">{faixaLabel(selectedReq)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Data de Abertura</p>
                  <p className="mt-1 text-sm text-neutral-700">{dataLabel(selectedReq.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Prazo Esperado</p>
                  <p className="mt-1 text-sm text-neutral-700">{dataLabel(selectedReq.prazo_esperado)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Status</p>
                  <p className="mt-1 text-sm text-neutral-700">{STATUS_LABEL[selectedReq.status]}</p>
                </div>
                {selectedReq.escopo_funcao && (
                  <div className="col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Escopo da Função</p>
                    <p className="mt-1 text-sm text-neutral-700">{selectedReq.escopo_funcao}</p>
                  </div>
                )}
                {selectedReq.perfil_tecnico && (
                  <div className="col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Perfil Técnico</p>
                    <p className="mt-1 text-sm text-neutral-700">{selectedReq.perfil_tecnico}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Justificativa</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.justificativa}</p>
                </div>
              </div>

              {acaoErro && (
                <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{acaoErro}</span>
                </div>
              )}

              {/* Aprovação executiva pendente */}
              {selectedReq.status === 'aguardando_aprovacao' && souAprovadorExecutivo && !mostrarFormRecusa && (
                <div className="flex gap-2 border-t border-neutral-100 pt-4">
                  <Button
                    className="flex-1"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    loading={acaoCarregando}
                    onClick={() => handleAprovar(selectedReq)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    onClick={() => setMostrarFormRecusa(true)}
                  >
                    Recusar
                  </Button>
                </div>
              )}

              {selectedReq.status === 'aguardando_aprovacao' && souAprovadorExecutivo && mostrarFormRecusa && (
                <div className="space-y-3 border-t border-neutral-100 pt-4">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-red-700">
                      Motivo da recusa * (mínimo 20 caracteres)
                    </span>
                    <textarea
                      value={justificativaRecusa}
                      onChange={e => setJustificativaRecusa(e.target.value)}
                      rows={3}
                      placeholder="Explique o motivo — o gestor verá este texto"
                      className="w-full resize-y rounded border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-300"
                    />
                    <span className="mt-1 block text-[11px] text-neutral-500">
                      {justificativaRecusa.trim().length} caracteres (mínimo 20)
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Pode reabrir a partir de (opcional)
                    </span>
                    <input
                      type="date"
                      min={HOJE}
                      value={podeReabrirEm}
                      onChange={e => setPodeReabrirEm(e.target.value)}
                      className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setMostrarFormRecusa(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      disabled={justificativaRecusa.trim().length < 20}
                      loading={acaoCarregando}
                      onClick={() => handleRecusar(selectedReq)}
                    >
                      Confirmar recusa
                    </Button>
                  </div>
                </div>
              )}

              {selectedReq.status === 'aguardando_aprovacao' && !souAprovadorExecutivo && (
                <p className="border-t border-neutral-100 pt-4 text-sm text-neutral-500">
                  Aguardando decisão do CEO.
                </p>
              )}

              {/* Recusada */}
              {selectedReq.status === 'recusada' && ultimaRecusa && (
                <div className="space-y-3 border-t border-neutral-100 pt-4">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <p className="font-bold uppercase tracking-wider">Motivo da recusa</p>
                    <p className="mt-1">{ultimaRecusa.justificativa_recusa}</p>
                    {ultimaRecusa.pode_reabrir_em && (
                      <p className="mt-2 text-red-700">Pode reenviar a partir de {dataLabel(ultimaRecusa.pode_reabrir_em)}.</p>
                    )}
                  </div>
                  {profile?.id === selectedReq.gestor_id && (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Justificativa (ajuste antes de reenviar)
                        </span>
                        <textarea
                          value={textoReenvio}
                          onChange={e => setTextoReenvio(e.target.value)}
                          rows={3}
                          className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      </label>
                      <Button
                        className="w-full"
                        leftIcon={<Send className="h-4 w-4" />}
                        loading={acaoCarregando}
                        disabled={textoReenvio.trim().length < 20}
                        onClick={() => handleReenviar(selectedReq)}
                      >
                        Reenviar para nova análise
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* RH conduz o processo */}
              {souAdministrador && PROXIMA_ETAPA[selectedReq.status] && (
                <div className="flex gap-2 border-t border-neutral-100 pt-4">
                  <Button
                    className="flex-1"
                    leftIcon={<ArrowRightCircle className="h-4 w-4" />}
                    loading={acaoCarregando}
                    onClick={() => handleAvancar(selectedReq)}
                  >
                    Avançar para {STATUS_LABEL[PROXIMA_ETAPA[selectedReq.status]!]}
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Ban className="h-4 w-4" />}
                    onClick={() => handleCancelar(selectedReq)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {selectedReq.status === 'concluida' && (
                <div className="border-t border-neutral-100 pt-4">
                  <Badge variant="success">Vaga concluída</Badge>
                </div>
              )}
              {selectedReq.status === 'cancelada' && (
                <div className="border-t border-neutral-100 pt-4">
                  <Badge variant="default">Vaga cancelada</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NovaRequisicaoVagaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvo={carregar}
      />

      <NovoCandidatoModal
        open={modalCandidatoAberto}
        vagaId={vagaSelecionadaId}
        criadoPor={profile?.id ?? ''}
        onClose={() => setModalCandidatoAberto(false)}
        onSalvo={carregarPipeline}
      />

      <NovaEntrevistaModal
        open={entrevistaAlvo !== null}
        candidatoId={entrevistaAlvo?.id ?? null}
        candidatoNome={entrevistaAlvo?.nome ?? ''}
        vagaId={vagaSelecionadaId}
        criadoPor={profile?.id ?? ''}
        onClose={() => setEntrevistaAlvo(null)}
        onSalvo={carregarPipeline}
      />

    </AppShell>
  )
}
