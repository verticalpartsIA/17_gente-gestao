import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { useAuth } from '@/lib/auth'
import { NovaRequisicaoVagaModal } from '@/components/rh/NovaRequisicaoVagaModal'
import {
  listarVagas,
  listarAprovacoes,
  aprovarVaga,
  recusarVaga,
  reenviarVaga,
  avancarStatus,
  ehAprovadorExecutivo,
  persistenciaDisponivel,
  type Vaga,
  type Aprovacao,
  type VagaStatus,
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

const PIPELINE_STAGES = ['Triagem', 'Entrevista — RH', 'Entrevista — Gestor', 'Proposta Enviada', 'Contratado']

interface Candidate {
  initials: string
  name: string
  fonte: string
  score: number
  stage: string
  req: string
}

// Pipeline de candidatos e comunicações ainda não têm integração real com
// nenhum sistema de recrutamento/WhatsApp/e-mail — em vez de simular pessoas
// e conversas fictícias (issue #19), as listas ficam vazias até existir a
// integração de verdade.
const CANDIDATOS: Candidate[] = []

interface Comunicacao {
  tipo: 'whatsapp' | 'email'
  de: string
  para: string
  hora: string
  msg: string
}

const COMUNICACOES: Comunicacao[] = []

interface Entrevista {
  data: string
  candidato: string
  tipo: string
  entrevistador: string
  hora: string
}

const ENTREVISTAS: Entrevista[] = []

interface AdmissaoDoc {
  nome: string
  status: boolean
}

interface Admissao {
  id: string
  initials: string
  name: string
  cargo: string
  docs: AdmissaoDoc[]
  assinado: boolean
}

const ADMISSOES: Admissao[] = [
  {
    id: 'ADM-001', initials: 'JF', name: 'João Figueiredo', cargo: 'Aux. de Logística', assinado: false,
    docs: [
      { nome: 'RG', status: true }, { nome: 'CPF', status: true }, { nome: 'PIS/PASEP', status: true },
      { nome: 'Comprovante de residência', status: true }, { nome: 'Certidão de nascimento/casamento', status: true },
      { nome: 'CTPS', status: true }, { nome: 'Título de eleitor', status: true }, { nome: 'Certificado reservista', status: false },
      { nome: 'Foto 3x4', status: false }, { nome: 'ASO — Exame admissional', status: false },
      { nome: 'Dados bancários', status: false }, { nome: 'Formulário pré-admissional', status: false },
    ]
  },
  {
    id: 'ADM-002', initials: 'BN', name: 'Beatriz Nunes', cargo: 'Assistente Financeiro', assinado: true,
    docs: [
      { nome: 'RG', status: true }, { nome: 'CPF', status: true }, { nome: 'PIS/PASEP', status: true },
      { nome: 'Comprovante de residência', status: true }, { nome: 'Certidão de nascimento/casamento', status: true },
      { nome: 'CTPS', status: true }, { nome: 'Título de eleitor', status: true }, { nome: 'Certificado reservista', status: true },
      { nome: 'Foto 3x4', status: true }, { nome: 'ASO — Exame admissional', status: true },
      { nome: 'Dados bancários', status: true }, { nome: 'Formulário pré-admissional', status: false },
    ]
  },
  {
    id: 'ADM-003', initials: 'RT', name: 'Rafael Teixeira', cargo: 'Assistente Financeiro', assinado: true,
    docs: [
      { nome: 'RG', status: true }, { nome: 'CPF', status: true }, { nome: 'PIS/PASEP', status: true },
      { nome: 'Comprovante de residência', status: true }, { nome: 'Certidão de nascimento/casamento', status: true },
      { nome: 'CTPS', status: true }, { nome: 'Título de eleitor', status: true }, { nome: 'Certificado reservista', status: true },
      { nome: 'Foto 3x4', status: true }, { nome: 'ASO — Exame admissional', status: true },
      { nome: 'Dados bancários', status: true }, { nome: 'Formulário pré-admissional', status: true },
    ]
  },
]

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

function stageBadge(stage: string) {
  if (stage === 'Proposta Enviada') return <Badge variant="success">{stage}</Badge>
  if (stage === 'Contratado')       return <Badge variant="success">{stage}</Badge>
  if (stage === 'Triagem')          return <Badge variant="default">{stage}</Badge>
  return <Badge variant="info">{stage}</Badge>
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const HOJE = new Date().toISOString().slice(0, 10)

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AtracaoPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [modalAberto, setModalAberto] = useState(false)

  const [vagas, setVagas] = useState<Vaga[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)

  const [selectedReq, setSelectedReq] = useState<Vaga | null>(null)
  const [selectedAdm, setSelectedAdm] = useState<Admissao | null>(null)

  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([])
  const [mostrarFormRecusa, setMostrarFormRecusa] = useState(false)
  const [justificativaRecusa, setJustificativaRecusa] = useState('')
  const [podeReabrirEm, setPodeReabrirEm] = useState('')
  const [textoReenvio, setTextoReenvio] = useState('')
  const [acaoCarregando, setAcaoCarregando] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)

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

  const kpiAberto = vagas.filter(v => v.status !== 'concluida' && v.status !== 'cancelada').length
  const kpiTriagem = vagas.filter(v => v.status === 'em_triagem').length
  const kpiAprovacao = vagas.filter(v => v.status === 'aguardando_aprovacao').length
  const kpiPipeline = vagas.filter(v => v.status === 'em_pipeline').length

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ATRAÇÃO DE TALENTOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"  label="VAGAS EM ABERTO"  value={String(kpiAberto)}  sub="Requisições ativas" />
          <KpiCard icon={Clock}     color="brand" label="EM TRIAGEM RH"    value={String(kpiTriagem)}  sub="Aguardando análise" />
          <KpiCard icon={CheckCircle} color="orange" label="AGUARD. APROVAÇÃO" value={String(kpiAprovacao)} sub="CEO / Diretoria" />
          <KpiCard icon={Users}     color="green" label="EM PIPELINE"      value={String(kpiPipeline)}  sub={`${CANDIDATOS.length} candidatos ativos`} />
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
                <div key={status} className="w-64 shrink-0 space-y-3">
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
            {/* Pipeline stages */}
            <div className="flex items-center gap-0 overflow-x-auto">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center">
                  <div className={`shrink-0 rounded px-3 py-2 text-xs font-bold ${
                    i === 0 ? 'bg-neutral-200 text-neutral-700' :
                    i === 1 ? 'bg-blue-100 text-blue-700' :
                    i === 2 ? 'bg-yellow-100 text-yellow-700' :
                    i === 3 ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {stage}
                    <span className="ml-1 opacity-60">
                      ({CANDIDATOS.filter(c => c.stage === stage).length})
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Pipeline de candidatos ainda não está integrado a um sistema de recrutamento — só a Requisição e a Aprovação Executiva (aba Kanban) já gravam no banco.</span>
            </div>

            {/* Tabela candidatos */}
            <Card theme="light" noPadding>
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Candidatos em Pipeline</CardTitle>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Adicionar Candidato ainda não está conectado ao banco de dados.')}>Adicionar Candidato</Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Candidato</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Fonte</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Score IA</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Etapa</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {CANDIDATOS.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhum candidato em pipeline ainda — este módulo ainda não está integrado a um sistema de recrutamento.</td></tr>
                    )}
                    {CANDIDATOS.map((c, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                              {c.initials}
                            </div>
                            <span className="font-medium text-neutral-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{c.fonte}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-lg font-black ${scoreColor(c.score)}`}>{c.score}%</span>
                        </td>
                        <td className="px-4 py-3">{stageBadge(c.stage)}</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">Avançar Etapa</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Entrevistas agendadas */}
            <Card theme="light" noPadding>
              <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Entrevistas Agendadas</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-neutral-100 px-5">
                {ENTREVISTAS.length === 0 && (
                  <div className="py-8 text-center text-sm text-neutral-400">Nenhuma entrevista agendada ainda.</div>
                )}
                {ENTREVISTAS.map((e, i) => (
                  <div key={i} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg border border-neutral-200 p-2 text-center min-w-[52px]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Jul</p>
                        <p className="text-lg font-black text-neutral-900">{e.data.split('/')[0]}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{e.candidato}</p>
                        <p className="text-xs text-neutral-500">{e.tipo} · Entrevistador: {e.entrevistador} · {e.hora}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert('Detalhes ainda não estão conectados ao banco de dados.')}>Ver Detalhes</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2 — Comunicações */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>WhatsApp ainda não está conectado — depende da central de roteamento compartilhada com o Pós-Venda.</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Candidatos lista */}
              <Card theme="light" className="lg:col-span-1">
                <CardHeader className="border-b border-neutral-200 pb-4">
                  <CardTitle>Candidatos</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-neutral-100">
                  {CANDIDATOS.length === 0 && (
                    <div className="py-8 text-center text-sm text-neutral-400">Nenhum candidato cadastrado ainda.</div>
                  )}
                  {CANDIDATOS.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 cursor-pointer hover:bg-neutral-50 -mx-4 px-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{c.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{c.stage}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Feed de comunicações */}
              <Card theme="light" noPadding className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
                  <CardTitle>Histórico de Comunicações</CardTitle>
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Mensagem ainda não está conectado ao banco de dados.')}>Nova Mensagem</Button>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pt-4 pb-5">
                  {COMUNICACOES.length === 0 && (
                    <div className="py-8 text-center text-sm text-neutral-400">Nenhuma comunicação registrada ainda — este módulo ainda não está integrado a WhatsApp/e-mail real.</div>
                  )}
                  {COMUNICACOES.map((c, i) => (
                    <div key={i} className={`flex gap-3 ${c.tipo === 'whatsapp' ? '' : 'flex-row-reverse'}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        c.tipo === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {c.tipo === 'whatsapp' ? 'W' : 'E'}
                      </div>
                      <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                        c.tipo === 'whatsapp'
                          ? 'bg-green-50 border border-green-200 text-neutral-800'
                          : 'bg-blue-50 border border-blue-200 text-neutral-800'
                      }`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          {c.tipo === 'whatsapp' ? 'WhatsApp' : 'E-mail'} · Para: {c.para} · {c.hora}
                        </p>
                        <p>{c.msg}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3 — Admissão Digital */}
        {activeTab === 3 && (
          <div className="space-y-4">
            {ADMISSOES.map(adm => {
              const concluidos = adm.docs.filter(d => d.status).length
              const total = adm.docs.length
              const pct = Math.round((concluidos / total) * 100)
              return (
                <Card key={adm.id} theme="light">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">
                        {adm.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-neutral-900">{adm.name}</p>
                            <p className="text-xs text-neutral-500">{adm.cargo} · {adm.id}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {adm.assinado
                              ? <Badge variant="success">Contrato Assinado</Badge>
                              : <Badge variant="warning">Aguardando Docs.</Badge>
                            }
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAdm(adm === selectedAdm ? null : adm)}
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
                        {adm.docs.map((doc, i) => (
                          <div key={i} className={`flex items-center gap-2 text-sm rounded p-2 ${
                            doc.status ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-400'
                          }`}>
                            <span className="text-base">{doc.status ? '✓' : '○'}</span>
                            {doc.nome}
                          </div>
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

    </AppShell>
  )
}
