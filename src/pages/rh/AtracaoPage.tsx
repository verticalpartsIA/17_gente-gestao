import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Field } from '@/components/auth/Field'
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  Plus, 
  ArrowRight,
  Send,
  Award,
  TrendingUp
} from 'lucide-react'


interface Job {
  id: string
  title: string
  department: string
  location: string
  type: 'CLT' | 'PJ' | 'Estágio'
  status: 'Aberta' | 'Pausada' | 'Preenchida'
  candidatesCount: number
}

interface Candidate {
  id: string
  name: string
  profiler: string
  salaryExpectation: string
  skills: string[]
  registeredAt: string
}

interface TestItem {
  id: string
  name: string
  type: string
  appliedCount: number
  status: 'Ativo' | 'Arquivado'
}

const INITIAL_JOBS: Job[] = [
  { id: 'job-1', title: 'Analista de Engenharia Pleno', department: 'Engenharia', location: 'Matriz - São Paulo', type: 'CLT', status: 'Aberta', candidatesCount: 14 },
  { id: 'job-2', title: 'Motorista Frota Pesada', department: 'Logistica', location: 'Centro Distribuição', type: 'CLT', status: 'Aberta', candidatesCount: 8 },
  { id: 'job-3', title: 'Auxiliar de Almoxarifado', department: 'Compras', location: 'Filial - Santos', type: 'CLT', status: 'Pausada', candidatesCount: 4 }
]

const INITIAL_CANDIDATES: Candidate[] = [
  { id: 'cand-1', name: 'Ana Carolina Silva', profiler: 'Planejador / Analista (Apto)', salaryExpectation: 'R$ 4.800,00', skills: ['Excel Avançado', 'Inglês Intermediário', 'Organização'], registeredAt: '15/05/2026' },
  { id: 'cand-2', name: 'Marcos Vinícius Barbosa', profiler: 'Executor / Comunicador (Apto)', salaryExpectation: 'R$ 5.500,00', skills: ['Negociação', 'Vendas B2B', 'Proatividade'], registeredAt: '28/05/2026' },
  { id: 'cand-3', name: 'Gabriela Rocha Nogueira', profiler: 'Analista (Apto)', salaryExpectation: 'R$ 3.800,00', skills: ['SQL', 'PowerBI', 'Análise de Dados'], registeredAt: '02/06/2026' },
  { id: 'cand-4', name: 'Ricardo Mendes Ramos', profiler: 'Comunicador / Planejador', salaryExpectation: 'R$ 4.200,00', skills: ['Relacionamento', 'Atendimento', 'Comunicação'], registeredAt: '03/06/2026' }
]

const INITIAL_TESTS: TestItem[] = [
  { id: 'test-1', name: 'Profiler (Mapeamento Comportamental)', type: 'Comportamental', appliedCount: 142, status: 'Ativo' },
  { id: 'test-2', name: 'Raciocínio Lógico Pro', type: 'Técnico / Cognitivo', appliedCount: 45, status: 'Ativo' },
  { id: 'test-3', name: 'Fit Cultural VerticalParts', type: 'Valores & Cultura', appliedCount: 88, status: 'Ativo' },
  { id: 'test-4', name: 'Inglês Técnico Operacional', type: 'Idiomas', appliedCount: 18, status: 'Ativo' }
]

export default function AtracaoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'vagas'
  const [activeTab, setActiveTab] = useState<string>(tabParam)

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [candidates] = useState<Candidate[]>(INITIAL_CANDIDATES)
  const [tests] = useState<TestItem[]>(INITIAL_TESTS)
  const [showForm, setShowForm] = useState(false)
  const [activeJob, setActiveJob] = useState<Job | null>(INITIAL_JOBS[0])

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDept, setFormDept] = useState('Engenharia')
  const [formType, setFormType] = useState<'CLT' | 'PJ' | 'Estágio'>('CLT')

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle) return
    const newJob: Job = {
      id: 'job-' + Math.random().toString(36).substring(2),
      title: formTitle,
      department: formDept,
      location: 'Matriz - São Paulo',
      type: formType,
      status: 'Aberta',
      candidatesCount: 0
    }
    setJobs([...jobs, newJob])
    setShowForm(false)
    setFormTitle('')
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="ATRAÇÃO DE TALENTOS — RECRUTAMENTO & SELEÇÃO">
      <div className="space-y-6">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KpiCard
            icon={Briefcase}
            color="brand"
            label="VAGAS EM PROCESSO"
            value={`${jobs.filter(j => j.status === 'Aberta').length} Vagas Ativas`}
            sub="3 departamentos com demandas"
          />
          <KpiCard
            icon={Users}
            color="blue"
            label="TOTAL DE CANDIDATOS"
            value="174 Inscritos"
            sub="Mapeamento comportamental ativo"
          />
          <KpiCard
            icon={CheckCircle}
            color="green"
            label="CUSTO MÉDIO POR ADMISSÃO"
            value="R$ 1.800,00"
            sub="Otimizado por triagem automática"
          />
        </div>

        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 overflow-x-auto gap-1">
          {[
            { id: 'vagas', label: 'Vagas em Aberto' },
            { id: 'banco', label: 'Banco de Talentos' },
            { id: 'provas', label: 'Provas & Testes' },
            { id: 'metricas', label: 'Métricas do Processo' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
                activeTab === tab.id 
                  ? 'border-t-primary bg-surface text-primary' 
                  : 'border-t-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- ABA: VAGAS EM ABERTO --- */}
        {activeTab === 'vagas' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* PAINEL DE VAGAS */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>VAGAS ATIVAS</CardTitle>
                <Button size="sm" onClick={() => setShowForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                  CRIAR
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border">
                {jobs.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => setActiveJob(job)}
                    className={`py-3.5 px-2 -mx-2 cursor-pointer transition-colors ${
                      activeJob?.id === job.id ? 'bg-primary/10 border-l-4 border-l-primary pl-1' : 'hover:bg-surface-card/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-fg-on-dark uppercase">{job.title}</h4>
                      <Badge variant={job.status === 'Aberta' ? 'success' : 'danger'}>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-fg3 font-mono mt-1">{job.department} | {job.type} | {job.candidatesCount} CANDIDATOS</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FUNIL DE RECRUTAMENTO COMPLETO DA VAGA ATIVA */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-surface-border pb-4">
                <CardTitle>FUNIL DE CANDIDATOS: {activeJob ? activeJob.title.toUpperCase() : 'SELECIONE UMA VAGA'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                {activeJob ? (
                  <>
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono font-bold">
                      <div className="p-2 border border-surface-border bg-surface-card text-fg-on-dark rounded-sm">
                        <span className="block text-base text-primary font-mono">05</span>
                        TRIAGEM
                      </div>
                      <div className="p-2 border border-surface-border bg-surface-card text-fg-on-dark rounded-sm">
                        <span className="block text-base text-primary font-mono">04</span>
                        PROFILER
                      </div>
                      <div className="p-2 border border-surface-border bg-surface-card text-fg-on-dark rounded-sm">
                        <span className="block text-base text-primary font-mono">03</span>
                        ENTREVISTA
                      </div>
                      <div className="p-2 border border-surface-border bg-surface-card text-fg-on-dark rounded-sm">
                        <span className="block text-base text-primary font-mono">02</span>
                        GESTÃO
                      </div>
                      <div className="p-2 border border-surface-border bg-surface-card text-fg-on-dark rounded-sm">
                        <span className="block text-base text-primary font-mono">01</span>
                        PROPOSTA
                      </div>
                    </div>

                    <div className="border-t border-surface-border pt-4">
                      <h4 className="text-xs font-bold text-fg-on-dark uppercase mb-3 font-display tracking-wider">Candidatos em Destaque (Profiler Apto)</h4>
                      <div className="space-y-3">
                        <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center text-xs rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold font-mono">
                              AS
                            </div>
                            <div>
                              <p className="font-bold text-fg-on-dark">Arthur Souza</p>
                              <p className="text-[10px] text-fg3 font-mono">Mapeamento Profiler: <strong className="text-primary font-sans font-bold">Executor / Analista (Apto)</strong></p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">VER LAUDO</Button>
                            <Button size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>AVANÇAR</Button>
                          </div>
                        </div>

                        <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center text-xs rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold font-mono">
                              MN
                            </div>
                            <div>
                              <p className="font-bold text-fg-on-dark">Mariana Nogueira</p>
                              <p className="text-[10px] text-fg3 font-mono">Mapeamento Profiler: <strong className="text-primary font-sans font-bold">Planejador / Analista (Apto)</strong></p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">VER LAUDO</Button>
                            <Button size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>AVANÇAR</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-fg3 font-mono">
                    Nenhuma vaga selecionada no menu esquerdo para exibir o funil.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- ABA: BANCO DE TALENTOS --- */}
        {activeTab === 'banco' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>BANCO UNIFICADO DE TALENTOS (TRIAGEM COMPORTAMENTAL)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">CANDIDATO</th>
                    <th className="p-3">PERFIL PROFILER</th>
                    <th className="p-3">PRETENSÃO SALARIAL</th>
                    <th className="p-3">PRINCIPAIS COMPETÊNCIAS</th>
                    <th className="p-3">DATA CADASTRO</th>
                    <th className="p-3">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {candidates.map(cand => (
                    <tr key={cand.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">{cand.name}</td>
                      <td className="p-3">
                        <Badge variant="admin">{cand.profiler.toUpperCase()}</Badge>
                      </td>
                      <td className="p-3 text-primary font-bold">{cand.salaryExpectation}</td>
                      <td className="p-3 font-sans text-fg2">{cand.skills.join(', ')}</td>
                      <td className="p-3">{cand.registeredAt}</td>
                      <td className="p-3">
                        <div className="flex gap-2 font-sans">
                          <Button size="sm" variant="outline">VER CV</Button>
                          <Button size="sm" variant="ghost" rightIcon={<Send className="h-3 w-3" />}>CONVIDAR</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- ABA: PROVAS & TESTES --- */}
        {activeTab === 'provas' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4 flex flex-row justify-between items-center">
              <CardTitle>BIBLIOTECA DE PROVAS E AVALIAÇÕES COMPORTAMENTAIS</CardTitle>
              <Button size="sm" rightIcon={<Plus className="h-4 w-4" />}>NOVO MODELO</Button>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">NOME DO TESTE</th>
                    <th className="p-3">CATEGORIA</th>
                    <th className="p-3">APLICAÇÕES EFETIVADAS</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">{test.name}</td>
                      <td className="p-3 font-sans text-fg2">{test.type.toUpperCase()}</td>
                      <td className="p-3">{test.appliedCount} envios</td>
                      <td className="p-3">
                        <Badge variant={test.status === 'Ativo' ? 'success' : 'danger'}>
                          {test.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 font-sans">
                          <Button size="sm" variant="outline">VISUALIZAR MODELO</Button>
                          <Button size="sm" rightIcon={<Send className="h-3 w-3" />}>ENVIAR POR E-MAIL</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- ABA: MÉTRICAS DO PROCESSO --- */}
        {activeTab === 'metricas' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* KPI Cards de Performance */}
            <div className="lg:col-span-1 space-y-6">
              <KpiCard
                icon={TrendingUp}
                color="brand"
                label="TIME-TO-HIRE MÉDIO"
                value="18.5 Dias"
                sub="Redução de 4.2 dias este ano"
              />
              <KpiCard
                icon={Award}
                color="purple"
                label="CONVERSÃO FINAL DO FUNIL"
                value="12.4%"
                sub="Triagem comportamental efetiva"
              />
            </div>

            {/* Canal de Contratações */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>EFICIÊNCIA POR CANAL DE DIVULGAÇÃO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 font-sans text-xs">
                <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                  <div className="flex justify-between font-mono font-bold">
                    <span>LINKEDIN RECRUITER</span>
                    <span className="text-primary">65% das Admissões</span>
                  </div>
                  <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                  <div className="flex justify-between font-mono font-bold">
                    <span>PORTAL DE VAGAS SÓLIDES / VERTICALPARTS</span>
                    <span className="text-primary">25% das Admissões</span>
                  </div>
                  <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                  <div className="flex justify-between font-mono font-bold">
                    <span>PROGRAMA DE INDICAÇÃO INTERNA (QUEM INDICA)</span>
                    <span className="text-primary">10% das Admissões</span>
                  </div>
                  <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL CRIAR VAGA */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                ABRIR NOVA VAGA DE TRABALHO
              </h3>
              
              <form onSubmit={handleAddJob} className="space-y-4">
                <Field
                  label="TÍTULO DA VAGA"
                  placeholder="Ex: Auxiliar Técnico de Montagem"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">DEPARTAMENTO</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                  >
                    <option value="Compras">COMPRAS</option>
                    <option value="Engenharia">ENGENHARIA</option>
                    <option value="Financeiro">FINANCEIRO</option>
                    <option value="Logistica">LOGÍSTICA</option>
                    <option value="MKT">MKT</option>
                    <option value="Vendas">VENDAS</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">VÍNCULO</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary"
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">ESTÁGIO</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    ABRIR VAGA →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
