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
  Clock,
  CheckCircle,
  X,
  Plus,
  ChevronRight
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

type ReqStatus = 0 | 1 | 2 | 3
const KANBAN_COLS = ['Abertura', 'Triagem RH', 'Aprovação CEO', 'Em Pipeline'] as const

interface Requisicao {
  id: string
  cargo: string
  depto: string
  gestor: string
  prioridade: 'normal' | 'alta' | 'critica'
  status: ReqStatus
  abertura: string
  faixa: string
  regime: 'CLT' | 'PJ'
}

const REQUISICOES: Requisicao[] = [
  { id: 'REQ-001', cargo: 'Técnico de Manutenção',         depto: 'Produção',           gestor: 'Carlos Mendes',  prioridade: 'normal',  status: 0, abertura: '12 Jul 2026', faixa: 'R$ 2.800',  regime: 'CLT' },
  { id: 'REQ-002', cargo: 'Analista Comercial',             depto: 'Comercial',          gestor: 'Ana Paula Rocha',prioridade: 'alta',    status: 1, abertura: '15 Jul 2026', faixa: 'R$ 4.200',  regime: 'CLT' },
  { id: 'REQ-003', cargo: 'Assistente Adm./Financeiro',    depto: 'Adm./Financeiro',    gestor: 'Roberto Faria',  prioridade: 'normal',  status: 1, abertura: '17 Jul 2026', faixa: 'R$ 2.500',  regime: 'CLT' },
  { id: 'REQ-004', cargo: 'Consultor Técnico Sênior',       depto: 'Consultoria Técnica',gestor: 'Mariana Costa',  prioridade: 'critica', status: 2, abertura: '08 Jul 2026', faixa: 'R$ 9.800',  regime: 'PJ'  },
  { id: 'REQ-005', cargo: 'Auxiliar de Logística',          depto: 'Logística',          gestor: 'Felipe Santos',  prioridade: 'alta',    status: 3, abertura: '03 Jul 2026', faixa: 'R$ 2.200',  regime: 'CLT' },
]

const PIPELINE_STAGES = ['Triagem', 'Entrevista — RH', 'Entrevista — Gestor', 'Proposta Enviada', 'Contratado']

interface Candidate {
  initials: string
  name: string
  fonte: string
  score: number
  stage: string
  req: string
}

const CANDIDATOS: Candidate[] = [
  { initials: 'MA', name: 'Marcos Andrade',  fonte: 'LinkedIn',         score: 87, stage: 'Entrevista — Gestor', req: 'REQ-005' },
  { initials: 'PC', name: 'Priya Correia',   fonte: 'Indeed',           score: 74, stage: 'Entrevista — RH',     req: 'REQ-005' },
  { initials: 'JF', name: 'João Figueiredo', fonte: 'Indicação Interna', score: 91, stage: 'Proposta Enviada',    req: 'REQ-005' },
  { initials: 'LS', name: 'Lívia Santos',    fonte: 'Gupy',             score: 68, stage: 'Triagem',             req: 'REQ-005' },
]

const COMUNICACOES = [
  { tipo: 'whatsapp', de: 'RH', para: 'Marcos Andrade',  hora: '10:30', msg: 'Olá, Marcos! Gostaríamos de confirmar sua entrevista para amanhã, 25/Jul, às 10h com o Gestor.' },
  { tipo: 'email',    de: 'RH', para: 'Priya Correia',   hora: '09:45', msg: 'Priya, sua entrevista com o RH está confirmada para 26/Jul às 14h. Enviaremos o link da reunião.' },
  { tipo: 'whatsapp', de: 'RH', para: 'Lívia Santos',    hora: '09:15', msg: 'Lívia, recebemos seu currículo! Gostaríamos de agendar uma triagem inicial. Você tem disponibilidade?' },
  { tipo: 'email',    de: 'RH', para: 'João Figueiredo', hora: '08:55', msg: 'João, segue em anexo a proposta formal de trabalho. Por favor, revise e confirme até 30/Jul.' },
]

const ENTREVISTAS = [
  { data: '25/Jul', candidato: 'Marcos Andrade',  tipo: 'Entrevista — Gestor', entrevistador: 'Felipe Santos', hora: '10:00h' },
  { data: '26/Jul', candidato: 'Priya Correia',   tipo: 'Entrevista — RH',     entrevistador: 'Gelson Simões', hora: '14:00h' },
  { data: '28/Jul', candidato: 'Lívia Santos',    tipo: 'Triagem RH',           entrevistador: 'Gelson Simões', hora: '09:30h' },
]

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

function prioridadeBadge(p: 'normal' | 'alta' | 'critica') {
  if (p === 'critica') return <Badge variant="danger">Crítica</Badge>
  if (p === 'alta')    return <Badge variant="warning">Alta</Badge>
  return <Badge variant="default">Normal</Badge>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AtracaoPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedReq, setSelectedReq] = useState<Requisicao | null>(null)
  const [selectedAdm, setSelectedAdm] = useState<Admissao | null>(null)

  const TABS = ['Requisições (Kanban)', 'Pipeline de Candidatos', 'Comunicações', 'Admissão Digital']

  // Group by kanban status
  const kanbanCols = [0, 1, 2, 3].map(col => REQUISICOES.filter(r => r.status === col))

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ATRAÇÃO DE TALENTOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Briefcase} color="blue"  label="VAGAS EM ABERTO"  value="5"  sub="Requisições ativas" />
          <KpiCard icon={Clock}     color="brand" label="EM TRIAGEM RH"    value="2"  sub="Aguardando análise" />
          <KpiCard icon={CheckCircle} color="orange" label="AGUARD. APROVAÇÃO" value="1" sub="CEO / Diretoria" />
          <KpiCard icon={Users}     color="green" label="EM PIPELINE"      value="1"  sub="4 candidatos ativos" />
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
            <div className="flex justify-end">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Nova Requisição ainda não está conectado ao banco de dados.')}>Nova Requisição</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {KANBAN_COLS.map((col, colIdx) => (
                <div key={col} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">{col}</h3>
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
                          <span className="font-mono text-[10px] text-neutral-400">{req.id}</span>
                          {prioridadeBadge(req.prioridade)}
                        </div>
                        <p className="font-semibold text-sm text-neutral-900 mb-1">{req.cargo}</p>
                        <p className="text-xs text-neutral-500 mb-2">{req.depto}</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{req.gestor}</span>
                          <span className="font-mono">{req.faixa}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={req.regime === 'CLT' ? 'success' : 'info'}>{req.regime}</Badge>
                          <span className="text-[10px] text-neutral-400">{req.abertura}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

            {/* Tabela candidatos */}
            <Card theme="light" noPadding>
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Candidatos em Pipeline — REQ-005 (Aux. de Logística)</CardTitle>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Candidatos lista */}
            <Card theme="light" className="lg:col-span-1">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle>Candidatos</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-neutral-100">
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Requisição {selectedReq.id}</h3>
              <button onClick={() => setSelectedReq(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cargo</p>
                <p className="mt-1 text-lg font-bold text-neutral-900">{selectedReq.cargo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Departamento</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.depto}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Gestor Solicitante</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.gestor}</p>
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
                  <p className="mt-1 text-sm font-bold text-neutral-900">{selectedReq.faixa}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Data de Abertura</p>
                  <p className="mt-1 text-sm text-neutral-700">{selectedReq.abertura}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Status</p>
                  <p className="mt-1 text-sm text-neutral-700">{KANBAN_COLS[selectedReq.status]}</p>
                </div>
              </div>
              <Button variant="primary" className="w-full">Mover para Próxima Etapa</Button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  )
}
