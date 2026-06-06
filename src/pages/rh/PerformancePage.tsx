import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/auth/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  CheckCircle, 
  Plus, 
  Users,
  AlertTriangle,
  Sparkles,
  Clock,
  Award
} from 'lucide-react'

interface PdiAction {
  id: string
  description: string
  type: string
  dueDate: string
  status: 'Planejado' | 'Em Andamento' | 'Concluído'
}

interface Competency {
  id: string
  name: string
  group: string
  weight: number
  roles: string
}

interface MetaItem {
  id: string
  name: string
  code: string
  period: string
  value: string
  progress: number
  status: 'Atingido' | 'Em Andamento' | 'Pendente'
}

interface EvaluationCycle {
  id: string
  name: string
  status: 'Rascunho' | 'Finalizada' | 'Cancelada' | 'Ativa'
  created: string
  started: string
  ended: string
}

const INITIAL_PDI_ACTIONS: PdiAction[] = [
  { id: 'act-1', description: 'Curso de Liderança Situacional — 16h', type: 'Treinamento', dueDate: '2026-07-15', status: 'Em Andamento' },
  { id: 'act-2', description: 'Certificação Técnica Elevadores de Alta Velocidade', type: 'Certificação', dueDate: '2026-09-30', status: 'Planejado' },
  { id: 'act-3', description: 'Mentoria quinzenal com Diretor de Engenharia', type: 'Mentoria', dueDate: '2026-06-30', status: 'Em Andamento' }
]

const INITIAL_COMPETENCIES: Competency[] = [
  { id: 'comp-1', name: 'Inteligência Emocional', group: 'Competências Comportamentais', weight: 3, roles: 'Todos os cargos' },
  { id: 'comp-2', name: 'Resolução de Conflitos', group: 'Competências Interpessoais', weight: 2, roles: 'Lideranças' },
  { id: 'comp-3', name: 'Gestão de Projetos e Prazos', group: 'Competências Técnicas', weight: 4, roles: 'Engenharia, Logística' },
  { id: 'comp-4', name: 'Tolerância e Resiliência ao Estresse', group: 'Competências Comportamentais', weight: 3, roles: 'Operacional' }
]

const INITIAL_METAS: MetaItem[] = [
  { id: 'meta-1', name: 'Redução de tempo médio de manutenção frota', code: 'MET-FRO-01', period: '05/2026', value: '15h por veículo', progress: 90, status: 'Em Andamento' },
  { id: 'meta-2', name: 'Fechamento de folha de pagamento no prazo', code: 'MET-FIN-02', period: '05/2026', value: '100% de pontualidade', progress: 100, status: 'Atingido' },
  { id: 'meta-3', name: 'Zero pendências em fichas de EPI e NRs', code: 'MET-SSMA-03', period: '06/2026', value: 'Conformidade total', progress: 60, status: 'Em Andamento' }
]

const INITIAL_CYCLES: EvaluationCycle[] = [
  { id: 'cyc-1', name: 'Avaliação de Desempenho 2025 - 1º ciclo', status: 'Finalizada', created: '09/05/2025', started: '24/06/2025', ended: '30/08/2025' },
  { id: 'cyc-2', name: 'AVALIACAO DE DESEMPENHO 180ª - 2º CICLO 10.24', status: 'Rascunho', created: '13/09/2024', started: '01/10/2024', ended: '11/10/2024' },
  { id: 'cyc-3', name: 'AVALIACAO 180º - 1º CICLO - 06.2024', status: 'Finalizada', created: '21/06/2024', started: '24/06/2024', ended: '25/07/2024' },
  { id: 'cyc-4', name: 'AVALIACAO 1º CICLO -06/2024', status: 'Cancelada', created: '11/06/2024', started: '20/06/2024', ended: '05/07/2024' }
]

export default function PerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'competencias'
  
  // Sincroniza aba ativa do estado com query parameter
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

  const [pdiActions, setPdiActions] = useState<PdiAction[]>(INITIAL_PDI_ACTIONS)
  const competencies = INITIAL_COMPETENCIES
  const metas = INITIAL_METAS
  const [cycles, setCycles] = useState<EvaluationCycle[]>(INITIAL_CYCLES)
  
  // States para novo PDI
  const [showPdiForm, setShowPdiForm] = useState(false)
  const [formPdiDesc, setFormPdiDesc] = useState('')
  const [formPdiType, setFormPdiType] = useState('Treinamento')
  const [formPdiDate, setFormPdiDate] = useState('')

  // Experiência States
  const [expScore1, setExpScore1] = useState(8)
  const [expScore2, setExpScore2] = useState(7)
  const [expScore3, setExpScore3] = useState(9)
  const [evalSubmitted, setEvalSubmitted] = useState(false)

  // AVD: Dashboard Participação States
  const [partCiclo, setPartCiclo] = useState('')
  const [partStatus, setPartStatus] = useState('Todas')
  const [partNivel, setPartNivel] = useState('')
  const [partOpcao, setPartOpcao] = useState('')
  const [showPartResult, setShowPartResult] = useState(false)

  // AVD: Relatórios Individuais States
  const [indCiclo, setIndCiclo] = useState('')
  const [indNivel, setIndNivel] = useState('')
  const [indOpcao, setIndOpcao] = useState('')
  const [indModeracao, setIndModeracao] = useState('Todos')
  const [showIndResult, setShowIndResult] = useState(false)

  // AVD: Relatório Geral States
  const [genCiclo, setGenCiclo] = useState('')
  const [showGenResult, setShowGenResult] = useState(false)

  // AVD: Wizard Criar Avaliação States
  const [createStep, setCreateStep] = useState(1)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createDates, setCreateDates] = useState('')

  // Treinamentos Sub-tab State
  const [trainingsTab, setTrainingsTab] = useState<'gestao' | 'dashboard'>('gestao')

  const handleAddPdi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPdiDesc || !formPdiDate) return
    const newAct: PdiAction = {
      id: 'act-' + Math.random().toString(36).substring(2),
      description: formPdiDesc,
      type: formPdiType,
      dueDate: formPdiDate,
      status: 'Planejado'
    }
    setPdiActions([...pdiActions, newAct])
    setFormPdiDesc('')
    setFormPdiDate('')
    setShowPdiForm(false)
  }

  const handleToggleStatus = (id: string) => {
    setPdiActions(pdiActions.map(act => {
      if (act.id === id) {
        const nextStatus = act.status === 'Planejado' ? 'Em Andamento' : act.status === 'Em Andamento' ? 'Concluído' : 'Planejado'
        return { ...act, status: nextStatus }
      }
      return act
    }))
  }

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName || !createDates) return
    
    if (createStep < 4) {
      setCreateStep(createStep + 1)
    } else {
      const newCycle: EvaluationCycle = {
        id: 'cyc-' + Math.random().toString(36).substring(2),
        name: createName,
        status: 'Rascunho',
        created: new Date().toLocaleDateString('pt-BR'),
        started: createDates.split(' - ')[0] || new Date().toLocaleDateString('pt-BR'),
        ended: createDates.split(' - ')[1] || new Date().toLocaleDateString('pt-BR')
      }
      setCycles([newCycle, ...cycles])
      handleTabChange('avaliacao')
      // Reset
      setCreateStep(1)
      setCreateName('')
      setCreateDesc('')
      setCreateDates('')
    }
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="DESENV. E PERFORMANCE — AVALIAÇÃO DE DESEMPENHO">
      <div className="space-y-6">
        
        {/* TAB CONTROLS (Estilo VerticalParts) */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 overflow-x-auto gap-1">
          {[
            { id: 'competencias', label: 'Competências' },
            { id: 'avaliacao', label: 'Ciclos Avaliativos' },
            { id: 'criar', label: 'Criar Avaliação' },
            { id: 'participacao', label: 'Dashboard Participação' },
            { id: 'individuais', label: 'Relatórios Individuais' },
            { id: 'geral', label: 'Relatório Geral' },
            { id: 'experiencia', label: 'Avaliação Experiência' },
            { id: 'pdi', label: 'Plano de Desenv. (PDI)' },
            { id: 'treinamentos', label: 'Treinamentos' },
            { id: 'metas', label: 'Gestão de Metas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-4 text-[10px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
                activeTab === tab.id 
                  ? 'border-t-primary bg-surface text-primary' 
                  : 'border-t-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB: COMPETÊNCIAS --- */}
        {activeTab === 'competencias' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>COMPETÊNCIAS CADASTRADAS (VERTICALPARTS)</CardTitle>
                <Button size="sm" rightIcon={<Plus className="h-4 w-4" />}>
                  CRIAR COMPETÊNCIA
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border">
                {competencies.map(comp => (
                  <div key={comp.id} className="py-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-fg-on-dark uppercase text-xs">{comp.name}</h4>
                      <p className="text-[10px] text-fg3 font-mono mt-0.5">{comp.group.toUpperCase()} | PESO: {comp.weight}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-sans">CARGOS VINCULADOS: {comp.roles.toUpperCase()}</p>
                    </div>
                    <Badge variant="collaborator">ATIVO</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GRUPOS DE COMPETÊNCIAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 font-sans text-xs">
                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <span>COMPORTAMENTAIS</span>
                  <Badge variant="admin">2 ITENS</Badge>
                </div>
                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <span>INTERPESSOAIS</span>
                  <Badge variant="admin">1 ITEM</Badge>
                </div>
                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <span>TÉCNICAS</span>
                  <Badge variant="admin">1 ITEM</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- TAB: CICLOS AVALIATIVOS (AVD) --- */}
        {activeTab === 'avaliacao' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <div>
                <CardTitle>CICLOS DE AVALIAÇÃO DE DESEMPENHO</CardTitle>
                <p className="text-xs text-fg3 font-mono mt-1">GERENCIE AVALIAÇÕES EXISTENTES OU CRIE UMA NOVA</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleTabChange('criar')} rightIcon={<Plus className="h-4 w-4" />}>
                  NOVA AVALIAÇÃO
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">NOME DO CICLO</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">CRIADA EM</th>
                    <th className="p-3">INICIADA EM</th>
                    <th className="p-3">FINALIZADA EM</th>
                    <th className="p-3">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {cycles.map(cyc => (
                    <tr key={cyc.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">{cyc.name}</td>
                      <td className="p-3">
                        <Badge variant={cyc.status === 'Finalizada' ? 'success' : cyc.status === 'Rascunho' ? 'warning' : 'danger'}>
                          {cyc.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">{cyc.created}</td>
                      <td className="p-3">{cyc.started}</td>
                      <td className="p-3">{cyc.ended}</td>
                      <td className="p-3">
                        <div className="flex gap-2 font-sans">
                          <Button size="sm" variant="outline" onClick={() => {
                            setPartCiclo(cyc.name);
                            handleTabChange('participacao');
                          }}>DASHBOARD</Button>
                          <Button size="sm" variant="ghost">LINK</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- TAB: CRIAR AVALIAÇÃO (WIZARD 4 ETAPAS) --- */}
        {activeTab === 'criar' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* STEPPER ESQUERDA */}
            <div className="lg:col-span-1 space-y-3 font-sans text-xs">
              {[
                { step: 1, title: 'CRIAR AVALIAÇÃO', desc: 'Defina nome, descrição e tipo.' },
                { step: 2, title: 'ESCALAS', desc: 'Escolha o modelo de rótulos.' },
                { step: 3, title: 'CONFIGURAÇÕES', desc: 'Regras e prazos adicionais.' },
                { step: 4, title: 'SOLICITAR', desc: 'Defina participantes e avaliadores.' }
              ].map(st => (
                <div 
                  key={st.step} 
                  className={`p-3 border transition-colors ${
                    createStep === st.step 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-surface-border bg-surface-card text-slate-500'
                  }`}
                >
                  <p className="font-bold font-mono">ETAPA {st.step} — {st.title}</p>
                  <p className="text-[10px] mt-0.5">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* WIZARD FORM CONTEÚDO */}
            <Card className="lg:col-span-3">
              <CardHeader className="border-b border-surface-border pb-4">
                <CardTitle>NOVA AVALIAÇÃO DE DESEMPENHO — ETAPA {createStep} DE 4</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateEvaluation} className="space-y-6">
                  
                  {/* ETAPA 1 */}
                  {createStep === 1 && (
                    <div className="space-y-4">
                      <Field
                        label="NOME DA AVALIAÇÃO*"
                        placeholder="Ex: Avaliação Colaboradores - período mm/aaaa"
                        value={createName}
                        onChange={e => setCreateName(e.target.value)}
                        required
                      />

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-fg-on-dark block">DESCRIÇÃO</label>
                        <textarea
                          rows={4}
                          className="w-full bg-surface-card border border-surface-border p-3 text-xs text-fg-on-dark focus:outline-none focus:border-primary font-sans"
                          placeholder="Escreva uma introdução para os participantes..."
                          value={createDesc}
                          onChange={e => setCreateDesc(e.target.value)}
                        />
                        <div className="flex justify-between items-center text-[10px] text-fg3 font-mono mt-1">
                          <span>{createDesc.length} / 1500 CARACTERES</span>
                          <span className={createDesc.length >= 140 ? 'text-primary' : 'text-fg3'}>MÍNIMO 140 PARA COPILOT</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          disabled={createDesc.length < 140}
                          rightIcon={<Sparkles className="h-3.5 w-3.5" />}
                        >
                          MELHORAR COM COPILOT VERTICALPARTS
                        </Button>
                      </div>

                      <Field
                        label="PERÍODO AVALIATIVO (PRAZO DE PARTICIPAÇÃO)*"
                        placeholder="Ex: dd/mm/aaaa - dd/mm/aaaa"
                        value={createDates}
                        onChange={e => setCreateDates(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* ETAPA 2 */}
                  {createStep === 2 && (
                    <div className="space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-fg-on-dark uppercase">ESCOLHA O MODELO DE ESCALA</h4>
                      <p className="text-fg3">Defina as notas ou níveis que os avaliadores usarão para pontuar competências.</p>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border border-surface-border bg-surface-card cursor-pointer">
                          <input type="radio" name="scale" defaultChecked className="accent-primary" />
                          <div>
                            <p className="font-bold text-fg-on-dark uppercase">Escala Linear de 1 a 10 (Recomendado)</p>
                            <p className="text-[10px] text-fg3">Notas numéricas diretas ponderadas.</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-surface-border bg-surface-card cursor-pointer">
                          <input type="radio" name="scale" className="accent-primary" />
                          <div>
                            <p className="font-bold text-fg-on-dark uppercase">Escala Estrela (Insatisfatório a Excelente)</p>
                            <p className="text-[10px] text-fg3">5 níveis de estrela baseados em comportamento observável.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 3 */}
                  {createStep === 3 && (
                    <div className="space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-fg-on-dark uppercase">CONFIGURAÇÕES DE VISIBILIDADE & MODERAÇÃO</h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="accent-primary" />
                          <span className="font-semibold text-fg-on-dark">Exigir validação/moderação do RH antes de liberar relatório individual</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="accent-primary" />
                          <span className="font-semibold text-fg-on-dark">Permitir autoavaliação (colaborador avalia a si mesmo)</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="accent-primary" />
                          <span className="font-semibold text-fg-on-dark">Ocultar nome do avaliador para o avaliado (avaliação confidencial)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 4 */}
                  {createStep === 4 && (
                    <div className="space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-fg-on-dark uppercase">SOLICITAR AVALIAÇÃO: PARTICIPANTES</h4>
                      <p className="text-fg3">Selecione quais colaboradores participarão como avaliados neste ciclo.</p>
                      
                      <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                        <div>
                          <p className="font-bold text-fg-on-dark">TODOS OS COLABORADORES DA VERTICALPARTS</p>
                          <p className="text-[10px] text-fg3 font-mono">142 colaboradores mapeados</p>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-primary" />
                      </div>
                    </div>
                  )}

                  {/* AÇÕES DE BOTÃO */}
                  <div className="flex justify-between border-t border-surface-border pt-4 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={createStep === 1}
                      onClick={() => setCreateStep(createStep - 1)}
                    >
                      VOLTAR
                    </Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => handleTabChange('avaliacao')}>
                        CANCELAR
                      </Button>
                      <Button type="submit">
                        {createStep === 4 ? 'FINALIZAR E PUBLICAR' : 'SALVAR E CONTINUAR'}
                      </Button>
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- TAB: DASHBOARD RELATÓRIO DE PARTICIPAÇÃO --- */}
        {activeTab === 'participacao' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>FILTRAR RELATÓRIO DE PARTICIPAÇÃO (AVD)</CardTitle>
                <p className="text-xs text-fg3 font-mono mt-1">SELECIONE O CICLO AVALIATIVO PARA ATIVAR OS DADOS</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">CICLO AVALIATIVO*</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={partCiclo}
                    onChange={e => setPartCiclo(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Avaliação de Desempenho 2025 - 1º ciclo">Avaliação de Desempenho 2025 - 1º ciclo</option>
                    <option value="AVALIACAO DE DESEMPENHO 90º">AVALIACAO DE DESEMPENHO 90º</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">STATUS</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={partStatus}
                    onChange={e => setPartStatus(e.target.value)}
                  >
                    <option value="Todas">Todas</option>
                    <option value="Respondida">Respondida</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">NÍVEL</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={partNivel}
                    onChange={e => setPartNivel(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Unidade">Unidade</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Superior direto">Superior direto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">OPÇÃO DE NÍVEL</label>
                  <input 
                    type="text" 
                    placeholder="Busca por unidade/depto..."
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark disabled:opacity-50"
                    disabled={!partNivel}
                    value={partOpcao}
                    onChange={e => setPartOpcao(e.target.value)}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <Button 
                    disabled={!partCiclo} 
                    onClick={() => setShowPartResult(true)}
                  >
                    FILTRAR RELATÓRIO
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showPartResult && partCiclo && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <KpiCard
                  icon={Users}
                  color="brand"
                  label="TOTAL DE SOLICITAÇÕES"
                  value="142"
                  sub="Colaboradores convocados"
                />
                <KpiCard
                  icon={CheckCircle}
                  color="green"
                  label="RESPOSTAS EFETIVADAS"
                  value={partStatus === 'Pendente' ? '0' : '121'}
                  sub="Adesão de 85.2%"
                />
                <KpiCard
                  icon={AlertTriangle}
                  color="purple"
                  label="RESPOSTAS PENDENTES"
                  value={partStatus === 'Respondida' ? '0' : '21'}
                  sub="Lembretes de envio ativos"
                />
              </div>
            )}
          </>
        )}

        {/* --- TAB: RELATÓRIOS INDIVIDUAIS --- */}
        {activeTab === 'individuais' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>RELATÓRIOS INDIVIDUAIS POR COLABORADOR</CardTitle>
                <p className="text-xs text-fg3 font-mono mt-1">FILTRE PARA VISUALIZAR A NOTA GERAL E STATUS DE MODERAÇÃO</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">CICLO AVALIATIVO*</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={indCiclo}
                    onChange={e => setIndCiclo(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Avaliação de Desempenho 2025 - 1º ciclo">Avaliação de Desempenho 2025 - 1º ciclo</option>
                    <option value="AVALIACAO DE DESEMPENHO 90º">AVALIACAO DE DESEMPENHO 90º</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">NÍVEL DE FILTRAGEM</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={indNivel}
                    onChange={e => setIndNivel(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Cargo">Cargo</option>
                    <option value="Departamento">Departamento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">OPÇÃO</label>
                  <input 
                    type="text" 
                    placeholder="Opção..."
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark disabled:opacity-50"
                    disabled={!indNivel}
                    value={indOpcao}
                    onChange={e => setIndOpcao(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">STATUS DE MODERAÇÃO</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={indModeracao}
                    onChange={e => setIndModeracao(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Não moderado">Não moderado</option>
                  </select>
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <Button 
                    disabled={!indCiclo} 
                    onClick={() => setShowIndResult(true)}
                  >
                    FILTRAR INDIVIDUAIS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showIndResult && indCiclo && (
              <Card>
                <CardHeader>
                  <CardTitle>LISTA DE RELATÓRIOS CONSOLIDADOS</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                        <th className="p-3">COLABORADOR</th>
                        <th className="p-3">CARGO / DEPARTAMENTO</th>
                        <th className="p-3">NOTA FINAL</th>
                        <th className="p-3">MODERAÇÃO</th>
                        <th className="p-3">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border font-mono">
                      <tr className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">JULIANA SILVA</td>
                        <td className="p-3">GESTORA FINANCEIRO / FINANCEIRO</td>
                        <td className="p-3 text-primary font-bold">8.6 / 10</td>
                        <td className="p-3">
                          <Badge variant="success">MODERADO</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm">VER RELATÓRIO</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">MARCOS PONTES</td>
                        <td className="p-3">AUXILIAR DE MONTAGEM / LOGÍSTICA</td>
                        <td className="p-3 text-primary font-bold">8.0 / 10</td>
                        <td className="p-3">
                          <Badge variant="warning">PENDENTE</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm">VER RELATÓRIO</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* --- TAB: RELATÓRIO GERAL --- */}
        {activeTab === 'geral' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>RELATÓRIO GERAL E RESULTADO CONSOLIDADO (AVD)</CardTitle>
                <p className="text-xs text-fg3 font-mono mt-1">SELECIONE O CICLO AVALIATIVO PARA EXTRAÇÃO GERAL</p>
              </CardHeader>
              <CardContent className="flex gap-4 items-end">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">CICLO AVALIATIVO</label>
                  <select 
                    className="w-full bg-surface-card border border-surface-border p-2 text-xs text-fg-on-dark"
                    value={genCiclo}
                    onChange={e => setGenCiclo(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Avaliação de Desempenho 2025 - 1º ciclo">Avaliação de Desempenho 2025 - 1º ciclo</option>
                  </select>
                </div>
                <Button disabled={!genCiclo} onClick={() => setShowGenResult(true)}>FILTRAR CONSOLIDADO</Button>
              </CardContent>
            </Card>

            {showGenResult && genCiclo && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>MÉDIAS GERAIS POR GRUPO DE COMPETÊNCIA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span>COMPETÊNCIAS COMPORTAMENTAIS</span>
                        <span>8.8 / 10</span>
                      </div>
                      <div className="bg-surface-elevated h-2">
                        <div className="bg-primary h-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span>COMPETÊNCIAS INTERPESSOAIS</span>
                        <span>8.2 / 10</span>
                      </div>
                      <div className="bg-surface-elevated h-2">
                        <div className="bg-primary h-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span>COMPETÊNCIAS TÉCNICAS</span>
                        <span>8.5 / 10</span>
                      </div>
                      <div className="bg-surface-elevated h-2">
                        <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>RESUMO CORPORATIVO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 font-sans text-xs text-fg2">
                    <p>Média Geral da Empresa: **8.5 / 10**</p>
                    <p>Participação: **100%**</p>
                    <p>Relatórios Moderados: **92%**</p>
                    <Button className="w-full">EXPORTAR PDF GERAL</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* --- TAB: EXPERIÊNCIA --- */}
        {activeTab === 'experiencia' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-surface-border pb-4">
                <CardTitle>AVALIAÇÃO DE CONTINUIDADE (45 E 90 DIAS)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!evalSubmitted ? (
                  <form onSubmit={(e) => { e.preventDefault(); setEvalSubmitted(true) }} className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-fg-on-dark text-sm uppercase">COLABORADOR AVALIADO</h4>
                      <div className="p-3 bg-surface-card border border-surface-border text-sm font-mono text-fg2">
                        <p className="font-bold text-fg-on-dark">MARCOS PONTES — AUXILIAR DE MONTAGEM</p>
                        <p>Admissão: 22/04/2026 | Período: 45 Dias (Vencendo esta semana)</p>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-surface-border pt-4">
                      <h4 className="font-bold text-fg-on-dark text-sm uppercase">COMPETÊNCIAS AVALIADAS</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-sans text-fg-on-dark">
                          <span>QUALIDADE E PRODUTIVIDADE OPERACIONAL</span>
                          <span className="font-bold">{expScore1} / 10</span>
                        </div>
                        <input
                          type="range" min="1" max="10"
                          className="w-full accent-primary"
                          value={expScore1}
                          onChange={e => setExpScore1(Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-sans text-fg-on-dark">
                          <span>DISCIPLINA E PONTUALIDADE (REGRAS E NRs)</span>
                          <span className="font-bold">{expScore2} / 10</span>
                        </div>
                        <input
                          type="range" min="1" max="10"
                          className="w-full accent-primary"
                          value={expScore2}
                          onChange={e => setExpScore2(Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-sans text-fg-on-dark">
                          <span>TRABALHO EM EQUIPE E COMUNICAÇÃO</span>
                          <span className="font-bold">{expScore3} / 10</span>
                        </div>
                        <input
                          type="range" min="1" max="10"
                          className="w-full accent-primary"
                          value={expScore3}
                          onChange={e => setExpScore3(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-fg-on-dark block">PARECER DO GESTOR</label>
                      <select className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none">
                        <option value="continue">Aprovado: Recomendar continuidade do contrato</option>
                        <option value="terminate">Reprovado: Encerrar vínculo contratual</option>
                        <option value="extend">Prorrogar: Aguardar avaliação de 90 dias</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full">
                      GRAVAR AVALIAÇÃO DE EXPERIÊNCIA →
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle className="h-16 w-16 text-success mx-auto" />
                    <div>
                      <h4 className="font-bold text-lg text-fg-on-dark">AVALIAÇÃO DE EXPERIÊNCIA ENVIADA</h4>
                      <p className="text-sm text-fg3 font-mono mt-1">Registrado com sucesso no perfil do colaborador.</p>
                    </div>
                    <Button onClick={() => setEvalSubmitted(false)} variant="outline">
                      AVALIAR OUTRO COLABORADOR
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HISTÓRICO RECENTE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-mono">
                <div className="p-3 border border-surface-border bg-surface-card">
                  <p className="font-bold text-fg-on-dark">CARLOS OLIVEIRA (90 DIAS)</p>
                  <p>Parecer: Efetivado com sucesso</p>
                  <p className="text-fg3 mt-1">Nota Geral: 8.8 / 10</p>
                </div>
                <div className="p-3 border border-surface-border bg-surface-card">
                  <p className="font-bold text-fg-on-dark">ROBERTO SANTOS (45 DIAS)</p>
                  <p>Parecer: Recomendado continuidade</p>
                  <p className="text-fg3 mt-1">Nota Geral: 7.5 / 10</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- TAB: PDI --- */}
        {activeTab === 'pdi' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>AÇÕES E COMPROMISSOS DO PDI</CardTitle>
                <Button size="sm" onClick={() => setShowPdiForm(true)} rightIcon={<Plus className="h-4 w-4" />}>
                  NOVA AÇÃO PDI
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border">
                {pdiActions.map(act => (
                  <div key={act.id} className="py-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-fg-on-dark uppercase text-xs">{act.description}</h4>
                      <p className="text-[10px] text-fg3 font-mono mt-0.5">TIPO: {act.type.toUpperCase()} | DATA MÁXIMA: {act.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={act.status === 'Concluído' ? 'success' : act.status === 'Em Andamento' ? 'warning' : 'admin'}>
                        {act.status.toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(act.id)}>
                        ALTERAR
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>COMO FUNCIONA O PDI?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-fg2 space-y-2">
                <p>
                      O Plano de Desenvolvimento Individual é acordado entre Líder e Colaborador a partir das oportunidades mapeadas nas avaliações semestrais.
                    </p>
                    <p className="font-bold text-fg-on-dark">REGRAS:</p>
                    <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-fg3">
                      <li>Pelo menos uma ação técnica e uma comportamental</li>
                      <li>Revisões a cada 3 meses</li>
                      <li>Evidência de conclusão anexada na entrega</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

        {/* --- TAB: METAS --- */}
        {activeTab === 'metas' && (
          <div className="space-y-6">
            {/* Aviso de conformidade / limite */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between font-sans text-xs gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold uppercase">Aviso de Plano: Gestão de Metas Ocupado (90%)</p>
                  <p className="text-[11px] text-amber-500/80">Você possui <strong>47 colaboradores ativos</strong> cadastrados de um limite máximo de 50 no seu plano atual.</p>
                </div>
              </div>
              <Link to="/marketplace">
                <Button size="sm" variant="outline" className="border-amber-500/50 hover:bg-amber-500/20 text-amber-500 hover:text-amber-500 text-[10px]">
                  AUMENTAR LIMITE
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                  <CardTitle>CADASTRO DE METAS (LAYOUT COMPATÍVEL LEGADO)</CardTitle>
                  <Button size="sm" rightIcon={<Plus className="h-4 w-4" />}>
                    CADASTRAR META
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto pt-4">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                        <th className="p-3">NOME DA META</th>
                        <th className="p-3">CÓDIGO</th>
                        <th className="p-3">MÊS/ANO</th>
                        <th className="p-3">VALOR DA META</th>
                        <th className="p-3">PROGRESSO</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border font-mono">
                      {metas.map(meta => (
                        <tr key={meta.id} className="hover:bg-surface-card/10">
                          <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">{meta.name}</td>
                          <td className="p-3">{meta.code}</td>
                          <td className="p-3">{meta.period}</td>
                          <td className="p-3 text-primary font-bold">{meta.value}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <div className="flex-1 bg-surface-card h-1.5 border border-surface-border rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${meta.progress}%` }}></div>
                              </div>
                              <span className="text-[10px] text-fg-on-dark">{meta.progress}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={meta.status === 'Atingido' ? 'success' : 'warning'}>
                              {meta.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 font-sans">
                              <Button size="sm" variant="outline" className="text-[10px] px-2 py-0.5">EDITAR</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>REVISÃO DE METAS corporativas</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-fg2 space-y-3 font-sans">
                  <p>
                    As metas são avaliadas semestralmente e estão atreladas ao programa de participação nos lucros e resultados (PLR) da VerticalParts.
                  </p>
                  <p className="text-[10px] text-fg3 font-mono border-t border-surface-border pt-2 mt-2">
                    Última sincronização de progresso: Hoje às 12:00.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button size="sm" variant="outline" className="w-full text-[10px]">EXPORTAR RELATÓRIO EXCEL</Button>
                    <Button size="sm" variant="ghost" className="w-full text-[10px]">EXPORTAR RELATÓRIO PDF</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* --- TAB: TREINAMENTOS --- */}
        {activeTab === 'treinamentos' && (
          <div className="space-y-6">
            {/* SUB-TABS INTERNAS */}
            <div className="flex gap-2 bg-surface-card p-1 border border-surface-border max-w-[320px]">
              <button 
                onClick={() => setTrainingsTab('gestao')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  trainingsTab === 'gestao' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gestão de Cursos
              </button>
              <button 
                onClick={() => setTrainingsTab('dashboard')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  trainingsTab === 'dashboard' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            </div>

            {trainingsTab === 'gestao' ? (
              <Card>
                <CardHeader className="border-b border-surface-border pb-4 flex flex-row justify-between items-center">
                  <CardTitle>GESTÃO DE TREINAMENTOS E CERTIFICAÇÕES</CardTitle>
                  <Button size="sm" rightIcon={<Plus className="h-4 w-4" />}>NOVO CURSO</Button>
                </CardHeader>
                <CardContent className="overflow-x-auto pt-4">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                        <th className="p-3">CURSO / TREINAMENTO</th>
                        <th className="p-3">CATEGORIA</th>
                        <th className="p-3">COLABORADORES CONVOCADOS</th>
                        <th className="p-3">PROGRESSO MÉDIO</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border font-mono">
                      <tr className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">Direção Defensiva Frota Pesada</td>
                        <td className="p-3 font-sans text-fg2">Segurança / Operações</td>
                        <td className="p-3">35 motoristas</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 bg-surface-card h-1.5 border border-surface-border rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-[10px] text-fg-on-dark">85%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="warning">ATIVO</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="text-[10px] px-2 py-0.5">GERENCIAR</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">NR-35 - Trabalho em Altura</td>
                        <td className="p-3 font-sans text-fg2">Segurança Ocupacional</td>
                        <td className="p-3">12 colaboradores</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 bg-surface-card h-1.5 border border-surface-border rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: '100%' }}></div>
                            </div>
                            <span className="text-[10px] text-fg-on-dark">100%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="success">CONCLUÍDO</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="text-[10px] px-2 py-0.5">GERENCIAR</Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">Liderança Operacional e Gestão de Pessoas</td>
                        <td className="p-3 font-sans text-fg2">Desenvolvimento Lideranças</td>
                        <td className="p-3">8 liderados</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 bg-surface-card h-1.5 border border-surface-border rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: '40%' }}></div>
                            </div>
                            <span className="text-[10px] text-fg-on-dark">40%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="warning">ATIVO</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="text-[10px] px-2 py-0.5">GERENCIAR</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                  <KpiCard
                    icon={Clock}
                    color="brand"
                    label="TOTAL HORAS ASSISTIDAS"
                    value="240h"
                    sub="Acumulado nos treinamentos ativos"
                  />
                  <KpiCard
                    icon={CheckCircle}
                    color="green"
                    label="TAXA DE CONCLUSÃO"
                    value="91.2%"
                    sub="Média geral da empresa"
                  />
                  <KpiCard
                    icon={Award}
                    color="purple"
                    label="AVALIAÇÃO DE REAÇÃO"
                    value="4.8 / 5.0"
                    sub="Excelente satisfação dos cursos"
                  />
                </div>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>PARTICIPAÇÃO EM TREINAMENTOS POR DEPARTAMENTO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 font-sans text-xs">
                    <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                      <div className="flex justify-between font-mono font-bold">
                        <span>ENGENHARIA</span>
                        <span className="text-primary">95% de Participação</span>
                      </div>
                      <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                      <div className="flex justify-between font-mono font-bold">
                        <span>LOGÍSTICA / FROTA</span>
                        <span className="text-primary">88% de Participação</span>
                      </div>
                      <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 border border-surface-border bg-surface-card space-y-1 rounded-md">
                      <div className="flex justify-between font-mono font-bold">
                        <span>ADMINISTRATIVO / COMPRAS</span>
                        <span className="text-primary">78% de Participação</span>
                      </div>
                      <div className="bg-surface-elevated h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* MODAL DE ADICIONAR PDI */}
        {showPdiForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4 uppercase">
                NOVA AÇÃO DE DESENVOLVIMENTO (PDI)
              </h3>
              
              <form onSubmit={handleAddPdi} className="space-y-4">
                <Field
                  label="DESCRIÇÃO DA AÇÃO"
                  placeholder="Ex: Fazer curso de oratória"
                  value={formPdiDesc}
                  onChange={e => setFormPdiDesc(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-fg-on-dark tracking-wider block">TIPO DE DESENVOLVIMENTO</label>
                  <select
                    className="w-full bg-surface-card border border-surface-border p-2 text-sm text-fg-on-dark focus:outline-none focus:border-primary font-sans"
                    value={formPdiType}
                    onChange={e => setFormPdiType(e.target.value)}
                  >
                    <option value="Treinamento">TREINAMENTO</option>
                    <option value="Mentoria">MENTORIA</option>
                    <option value="Certificação">CERTIFICAÇÃO</option>
                    <option value="Desafio Prático">DESAFIO PRÁTICO</option>
                  </select>
                </div>
                <Field
                  label="PRAZO FINAL PARA CONCLUIR"
                  type="date"
                  value={formPdiDate}
                  onChange={e => setFormPdiDate(e.target.value)}
                />

                <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowPdiForm(false)}>
                    CANCELAR
                  </Button>
                  <Button type="submit">
                    CRIAR AÇÃO PDI →
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
