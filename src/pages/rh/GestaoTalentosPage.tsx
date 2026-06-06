import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Briefcase,
  MapPin,
  Cake,
  Gift
} from 'lucide-react'

interface Admission {
  id: string
  name: string
  role: string
  department: string
  status: 'Envio Pendente' | 'Em Análise' | 'Aprovado'
  progress: number
  docsCount: string
}

interface SalaryGrade {
  id: string
  title: string
  cbo: string
  department: string
  salaryRange: string
  count: number
}

interface DepartmentItem {
  id: string
  name: string
  manager: string
  colabsCount: number
  budget: string
  salaryEquilibrium: string
}

interface UnitItem {
  id: string
  name: string
  address: string
  manager: string
  colabsCount: number
}

interface BirthdayItem {
  id: string
  name: string
  date: string
  role: string
  department: string
  type: 'Nascimento' | 'Empresa'
  details?: string
}

const INITIAL_ADMISSIONS: Admission[] = [
  { id: 'adm-1', name: 'Rodrigo Mendonça', role: 'Mecânico de Manutenção Pleno', department: 'Logística', status: 'Em Análise', progress: 75, docsCount: '3/4' },
  { id: 'adm-2', name: 'Carla Dias', role: 'Analista de Planejamento de Frota', department: 'Engenharia', status: 'Envio Pendente', progress: 25, docsCount: '1/4' },
  { id: 'adm-3', name: 'Bruno Farias', role: 'Auxiliar de Almoxarifado', department: 'Compras', status: 'Aprovado', progress: 100, docsCount: '4/4' }
]

const SALARY_GRADES: SalaryGrade[] = [
  { id: 'sg-1', title: 'Analista de Engenharia Júnior', cbo: '2142-05', department: 'Engenharia', salaryRange: 'R$ 4.500,00 - R$ 5.500,00', count: 4 },
  { id: 'sg-2', title: 'Analista de Engenharia Pleno', cbo: '2142-05', department: 'Engenharia', salaryRange: 'R$ 6.000,00 - R$ 7.800,00', count: 2 },
  { id: 'sg-3', title: 'Mecânico de Manutenção Senior', cbo: '9144-05', department: 'Logística', salaryRange: 'R$ 5.000,00 - R$ 6.500,00', count: 3 },
  { id: 'sg-4', title: 'Auxiliar de Almoxarifado', cbo: '4141-40', department: 'Compras', salaryRange: 'R$ 2.000,00 - R$ 2.800,00', count: 6 }
]

const DEPARTMENTS: DepartmentItem[] = [
  { id: 'dept-1', name: 'Engenharia', manager: 'Karla Souza', colabsCount: 12, budget: 'R$ 72.000,00', salaryEquilibrium: '92.4%' },
  { id: 'dept-2', name: 'Logística', manager: 'Carlos Oliveira', colabsCount: 35, budget: 'R$ 115.000,00', salaryEquilibrium: '88.0%' },
  { id: 'dept-3', name: 'Compras', manager: 'Mariana Nogueira', colabsCount: 8, budget: 'R$ 28.000,00', salaryEquilibrium: '90.5%' },
  { id: 'dept-4', name: 'Financeiro', manager: 'Juliana Silva', colabsCount: 5, budget: 'R$ 26.500,00', salaryEquilibrium: '95.0%' },
  { id: 'dept-5', name: 'Recursos Humanos', manager: 'Juliana Silva', colabsCount: 4, budget: 'R$ 18.000,00', salaryEquilibrium: '97.2%' },
  { id: 'dept-6', name: 'Vendas', manager: 'Sabrina Almeida', colabsCount: 25, budget: 'R$ 88.000,00', salaryEquilibrium: '85.4%' }
]

const UNITS: UnitItem[] = [
  { id: 'unit-1', name: 'Matriz - São Paulo', address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', manager: 'Juliana Silva', colabsCount: 62 },
  { id: 'unit-2', name: 'Centro de Distribuição - Guarulhos', address: 'Rod. Presidente Dutra, Km 210 - Bonsucesso, Guarulhos - SP', manager: 'Carlos Oliveira', colabsCount: 65 },
  { id: 'unit-3', name: 'Filial - Santos', address: 'Rua do Comércio, 150 - Centro Histórico, Santos - SP', manager: 'Karla Souza', colabsCount: 15 }
]

const BIRTHDAYS: BirthdayItem[] = [
  { id: 'b-1', name: 'Jovanna Regina dos Santos Mello', date: '23/05', role: 'Analista Financeiro Jr', department: 'Financeiro', type: 'Nascimento' },
  { id: 'b-2', name: 'José Costa', date: '10/06', role: 'Motorista Frota Pesada', department: 'Logística', type: 'Nascimento' },
  { id: 'b-3', name: 'Rodrigo Mendonça', date: '18/06', role: 'Mecânico de Manutenção Pleno', department: 'Logística', type: 'Nascimento' },
  { id: 'b-4', name: 'Karla Souza', date: '01/06', role: 'Líder Engenharia', department: 'Engenharia', type: 'Empresa', details: '5 anos de casa' },
  { id: 'b-5', name: 'Carlos Oliveira', date: '15/06', role: 'Gestor de Logística', department: 'Logística', type: 'Empresa', details: '3 anos de casa' }
]

export default function GestaoTalentosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'admissao'
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

  const [admissions, setAdmissions] = useState<Admission[]>(INITIAL_ADMISSIONS)

  const handleApprove = (id: string) => {
    setAdmissions(admissions.map(adm => adm.id === id ? { ...adm, status: 'Aprovado', progress: 100, docsCount: '4/4' } : adm))
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE TALENTOS & ESTRUTURA E ORGANIZAÇÃO">
      <div className="space-y-6">
        
        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 overflow-x-auto gap-1">
          {[
            { id: 'admissao', label: 'Admissão Digital' },
            { id: 'cargos', label: 'Cargos & Salários (iGPS)' },
            { id: 'departamentos', label: 'Departamentos' },
            { id: 'unidades', label: 'Unidades / Filiais' },
            { id: 'aniversariantes', label: 'Aniversariantes' }
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

        {/* --- TAB: ADMISSÃO DIGITAL --- */}
        {activeTab === 'admissao' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={UserPlus}
                color="brand"
                label="ADMISSÕES EM ANDAMENTO"
                value={`${admissions.filter(a => a.status !== 'Aprovado').length} Candidatos`}
                sub="Aguardando validação ou envio"
              />
              <KpiCard
                icon={Clock}
                color="purple"
                label="PRAZO MÉDIO PARA ENVIO"
                value="2.4 Dias"
                sub="Dos documentos pelos novos colaboradores"
              />
              <KpiCard
                icon={CheckCircle}
                color="green"
                label="CONCLUÍDAS ESTE MÊS"
                value={`${admissions.filter(a => a.status === 'Aprovado').length} Concluídas`}
                sub="Prontos para integração de DP"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>PRÉ-ADMITIDOS E DOCUMENTAÇÃO DIGITAL</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                      <th className="p-3">COLABORADOR</th>
                      <th className="p-3">DEPARTAMENTO / CARGO</th>
                      <th className="p-3">STATUS DOCS</th>
                      <th className="p-3">PROGRESSO DO ENVIO</th>
                      <th className="p-3">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {admissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-surface-card/10">
                        <td className="p-3 font-semibold text-fg-on-dark uppercase">{adm.name}</td>
                        <td className="p-3 font-mono text-fg2">
                          <p>{adm.role}</p>
                          <p className="text-[10px] text-fg3">{adm.department}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant={adm.status === 'Aprovado' ? 'success' : adm.status === 'Em Análise' ? 'warning' : 'danger'}>
                            {adm.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-card h-2 max-w-[100px] border border-surface-border">
                              <div className="bg-primary h-full" style={{ width: `${adm.progress}%` }}></div>
                            </div>
                            <span className="font-mono text-[10px]">{adm.docsCount}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {adm.status === 'Em Análise' && (
                            <Button size="sm" onClick={() => handleApprove(adm.id)}>
                              APROVAR E ADMITIR
                            </Button>
                          )}
                          {adm.status === 'Envio Pendente' && (
                            <Button size="sm" variant="outline">
                              RECOBRAR ENVIO
                            </Button>
                          )}
                          {adm.status === 'Aprovado' && (
                            <span className="text-[10px] text-success font-bold font-mono">INTEGRADO AO DP</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* --- TAB: CARGOS E SALÁRIOS --- */}
        {activeTab === 'cargos' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Briefcase}
                color="brand"
                label="CARGOS HOMOLOGADOS"
                value="24 Cargos"
                sub="100% alinhados ao CBO do MTE"
              />
              <KpiCard
                icon={TrendingUp}
                color="blue"
                label="FAIXA MÉDIA DA EMPRESA"
                value="R$ 4.250,00"
                sub="Excluindo cargos diretivos"
              />
              <KpiCard
                icon={Users}
                color="green"
                label="EQUILÍBRIO DE FAIXA"
                value="88.2%"
                sub="Colaboradores dentro da faixa planejada"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                  <CardTitle>TABELA SALARIAL & CARGOS VIGENTES</CardTitle>
                  <Button size="sm" rightIcon={<UserPlus className="h-4 w-4" />}>
                    NOVO CARGO
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                        <th className="p-3">CARGO</th>
                        <th className="p-3">CBO</th>
                        <th className="p-3">DEPARTAMENTO</th>
                        <th className="p-3">FAIXA DE SALÁRIO</th>
                        <th className="p-3">ATIVOS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {SALARY_GRADES.map(grade => (
                        <tr key={grade.id} className="hover:bg-surface-card/10">
                          <td className="p-3 font-semibold text-fg-on-dark uppercase">{grade.title}</td>
                          <td className="p-3 font-mono">{grade.cbo}</td>
                          <td className="p-3 font-mono">{grade.department.toUpperCase()}</td>
                          <td className="p-3 font-mono text-primary font-bold">{grade.salaryRange}</td>
                          <td className="p-3">
                            <Badge variant="admin">{grade.count} COLABS</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>COMPLIANCE DE CARGOS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-sans text-fg2">
                  <p>
                    A tabela salarial da **VerticalParts** é revisada semestralmente utilizando a inteligência comportamental, associando pesos de competências requeridas para cada faixa do organograma.
                  </p>
                  <div className="p-3 border border-surface-border bg-surface-card space-y-2 font-mono text-[10px] text-fg3 rounded-md">
                    <p className="font-bold text-fg-on-dark font-sans">ALERTAS DE CONFORMIDADE:</p>
                    <div className="flex items-start gap-2 text-danger">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>CBO 9144-05 do cargo "Mecânico de Manutenção Senior" possui piso salarial regional atualizado no último acordo coletivo do sindicato.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* --- TAB: DEPARTAMENTOS --- */}
        {activeTab === 'departamentos' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>ESTRUTURA DE DEPARTAMENTOS corporativos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">DEPARTAMENTO</th>
                    <th className="p-3">GESTOR / RESPONSÁVEL</th>
                    <th className="p-3">COLABORADORES ATIVOS</th>
                    <th className="p-3">ORÇAMENTO MENSAL ESTIMADO</th>
                    <th className="p-3">EQUILÍBRIO SALARIAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {DEPARTMENTS.map(dept => (
                    <tr key={dept.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans">{dept.name}</td>
                      <td className="p-3 font-sans text-fg2">{dept.manager}</td>
                      <td className="p-3 font-bold text-fg-on-dark">{dept.colabsCount} colaboradores</td>
                      <td className="p-3 text-primary font-bold">{dept.budget}</td>
                      <td className="p-3 text-green-500 font-bold">{dept.salaryEquilibrium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- TAB: UNIDADES --- */}
        {activeTab === 'unidades' && (
          <Card>
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>UNIDADES E FILIAIS OPERACIONAIS</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">UNIDADE / FILIAL</th>
                    <th className="p-3">ENDEREÇO</th>
                    <th className="p-3">RESPONSÁVEL LOCAL</th>
                    <th className="p-3">COLABORADORES ATIVOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {UNITS.map(unit => (
                    <tr key={unit.id} className="hover:bg-surface-card/10">
                      <td className="p-3 font-semibold text-fg-on-dark uppercase font-sans flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" /> {unit.name}
                      </td>
                      <td className="p-3 font-sans text-fg2">{unit.address}</td>
                      <td className="p-3 font-sans text-fg2">{unit.manager}</td>
                      <td className="p-3 font-bold text-primary">{unit.colabsCount} colabs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- TAB: ANIVERSARIANTES --- */}
        {activeTab === 'aniversariantes' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Aniversariantes do Mês */}
            <Card>
              <CardHeader className="border-b border-surface-border pb-4 flex flex-row items-center gap-2">
                <Cake className="h-4 w-4 text-primary" />
                <CardTitle>ANIVERSARIANTES DO MÊS (NASCIMENTO)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-surface-border font-sans text-xs">
                {BIRTHDAYS.filter(b => b.type === 'Nascimento').map(b => (
                  <div key={b.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-fg-on-dark uppercase">{b.name}</h4>
                      <p className="text-[10px] text-fg3 font-mono mt-0.5">{b.role} • {b.department.toUpperCase()}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary bg-brand/10 px-3 py-1 rounded-full shrink-0">
                      {b.date}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Aniversários de Casa */}
            <Card>
              <CardHeader className="border-b border-surface-border pb-4 flex flex-row items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <CardTitle>ANIVERSÁRIOS DE EMPRESA (TEMPO DE CASA)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-surface-border font-sans text-xs">
                {BIRTHDAYS.filter(b => b.type === 'Empresa').map(b => (
                  <div key={b.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-fg-on-dark uppercase">{b.name}</h4>
                      <p className="text-[10px] text-fg3 font-mono mt-0.5">{b.role} • {b.department.toUpperCase()}</p>
                      <Badge variant="success" className="mt-1 font-mono text-[9px]">{b.details?.toUpperCase()}</Badge>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary bg-brand/10 px-3 py-1 rounded-full shrink-0">
                      {b.date}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
