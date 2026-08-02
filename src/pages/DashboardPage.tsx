import { 
  LayoutDashboard, 
  UserCheck, 
  Briefcase, 
  ShieldAlert, 
  Award, 
  Car, 
  Settings,
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FileText, 
  CheckCircle, 
  ArrowRight,
  ClipboardCheck,
  Zap,
  HelpCircle,
  HeartHandshake,
  Wallet,
  TrendingDown,
  Search,
  Sliders,
  Cake,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { useAuth } from '@/lib/auth'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Link } from 'react-router-dom'

export const NAV_ITEMS = [
  { label: 'HOME / DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { label: 'VERTICALPARTS PROFILER', href: '/profiler', icon: UserCheck },
  { label: 'ATRAÇÃO DE TALENTOS', href: '/atracao', icon: Briefcase },
  {
    label: 'GESTÃO DE TALENTOS',
    icon: Users,
    subItems: [
      { label: 'Admissão Digital', href: '/gestao-talentos?tab=admissao' },
      { label: 'Cargos e Salários', href: '/gestao-talentos?tab=cargos' },
      { label: 'Organograma', href: '/organograma' }
    ]
  },
  {
    label: 'DESENV. E PERFORMANCE',
    icon: Award,
    subItems: [
      { label: 'Competências', href: '/desempenho?tab=competencias' },
      { label: 'Avaliação Desempenho', href: '/desempenho?tab=avaliacao' },
      { label: 'Avaliação Experiência', href: '/desempenho?tab=experiencia' },
      { label: 'Gestão de Metas', href: '/desempenho?tab=metas' },
      { label: 'Análise de Performance', href: '/desempenho?tab=performance' },
      { label: 'Treinamentos', href: '/desempenho?tab=treinamentos' },
      { label: 'Matriz 9-Box', href: '/desempenho?tab=9box' },
      { label: 'Plano de Desenv. (PDI)', href: '/desempenho?tab=pdi' }
    ]
  },
  {
    label: 'RETEN. E ENGAJAMENTO',
    icon: HeartHandshake,
    subItems: [
      { label: 'Pesquisas de Clima', href: '/retencao-engajamento?tab=clima' },
      { label: 'Termômetro eNPS', href: '/retencao-engajamento?tab=enps' },
      { label: 'Feedbacks Coletivos', href: '/retencao-engajamento?tab=feedbacks' }
    ]
  },
  {
    label: 'SAÚDE OCUPACIONAL (SST)',
    icon: ShieldAlert,
    subItems: [
      { label: 'Exames Médicos ASO', href: '/ssma?tab=aso' },
      { label: 'Fichas de EPI', href: '/ssma?tab=epis' },
      { label: 'Normas Regulamentadoras', href: '/ssma?tab=nrs' }
    ]
  },
  {
    label: 'VERTICALPARTS BENEFÍCIOS',
    icon: Wallet,
    subItems: [
      { label: 'Gestão de Benefícios', href: '/beneficios?tab=gestao' },
      { label: 'Vale Refeição & Alimentação', href: '/beneficios?tab=refeicao' },
      { label: 'Vale Transporte', href: '/beneficios?tab=transporte' },
      { label: 'Plano de Saúde', href: '/beneficios?tab=saude' }
    ]
  },
  {
    label: 'VERTICALPARTS DP',
    icon: Clock,
    subItems: [
      { label: 'Colaboradores', href: '/colaboradores' },
      { label: 'Ponto Eletrônico', href: '/ponto' },
      { label: 'Férias & Afastamentos', href: '/beneficios?tab=ferias' }
    ]
  },
  {
    label: 'VERTICALPARTS FOLHA DIGITAL',
    icon: FileText,
    subItems: [
      { label: 'Fechamento de Folha', href: '/holerites?tab=fechamento' },
      { label: 'Holerites em Lote', href: '/holerites?tab=holerites' },
      { label: 'Demonstrativos e Encargos', href: '/holerites?tab=encargos' }
    ]
  },
  {
    label: 'CONFIGURAÇÕES',
    icon: Settings,
    subItems: [
      { label: 'Cadastro da Empresa', href: '/configuracoes?tab=empresa' },
      { label: 'Perfis & Acessos (RBAC)', href: '/configuracoes?tab=rbac' },
      { label: 'Integrações & API', href: '/configuracoes?tab=integracoes' }
    ]
  },
  {
    label: 'MEU ESPAÇO VERTICALPARTS',
    icon: Users,
    subItems: [
      { label: 'Marcar meu Ponto', href: '/ponto?tab=registrar' },
      { label: 'Meus Holerites', href: '/holerites?tab=meus' },
      { label: 'Minhas Férias', href: '/beneficios?tab=minhas-ferias' },
      { label: 'Meu PDI', href: '/desempenho?tab=pdi' }
    ]
  },
  {
    label: 'GESTÃO DE FROTA',
    icon: Car,
    subItems: [
      { label: 'Cadastro de Veículos', href: '/frota?tab=veiculos' },
      { label: 'Infrações e Multas', href: '/frota?tab=multas' }
    ]
  },
  { label: 'MARKETPLACE', href: '/marketplace', icon: Zap },
  { label: 'SUPORTE', href: '/suporte', icon: HelpCircle }
]

export default function DashboardPage() {
  const { profile } = useAuth()
  const userRole = profile?.level || 'Colaborador'

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle={`PAINEL GERAL — ${profile?.name || 'CONVIDADO'}`}>
      <div className="space-y-6">
        <DemoDataBanner />
        
        {/* --- VISÃO DE ADMINISTRADOR / GESTOR DE RH --- */}
        {userRole === 'Administrador' && (
          <>
            {/* KPI Cards Principais */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={Users}
                color="brand"
                label="TOTAL ATIVOS"
                value="142"
                sub="+3 admitidos este mês"
              />
              <KpiCard
                icon={ShieldAlert}
                color="red"
                label="ASO EXPIRANDO"
                value="3"
                sub="Vencem nos próximos 30 dias"
              />
              <KpiCard
                icon={AlertTriangle}
                color="purple"
                label="MULTAS PENDENTES"
                value="5"
                sub="Aguardando condutor"
              />
              <KpiCard
                icon={Clock}
                color="green"
                label="BANCO DE HORAS"
                value="1.420h"
                sub="Saldo total acumulado"
              />
            </div>

            {/* Grid Principal do RH */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Alertas e Pendências */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ALERTAS E PENDÊNCIAS DO DEPARTAMENTO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-red/10 text-danger">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">ASO VENCIDO: JOSÉ COSTA</p>
                          <p className="text-xs text-fg3 font-mono">NR-35 — TRABALHO EM ALTURA</p>
                        </div>
                      </div>
                      <Badge variant="danger">URGENTE</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-brand/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">REQUISIÇÃO DE ADMISSÃO APROVADA</p>
                          <p className="text-xs text-fg3 font-mono">CARGO: ANALISTA DE ENGENHARIA PLENO</p>
                        </div>
                      </div>
                      <Badge variant="warning">PENDENTE DOCS</Badge>
                    </div>

                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-purple/10 text-purple-600">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">NOVA MULTA REGISTRADA — PLACA VP-8980</p>
                          <p className="text-xs text-fg3 font-mono">INFRAÇÃO: EXCESSO DE VELOCIDADE</p>
                        </div>
                      </div>
                      <Badge variant="admin">ANALISAR FROTA</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>AÇÕES RÁPIDAS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/colaboradores">
                    <Button className="w-full justify-between" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      ADMITIR NOVO COLABORADOR
                    </Button>
                  </Link>
                  <Link to="/ssma">
                    <Button variant="secondary" className="w-full justify-between" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      ENTREGAR NOVO EPI
                    </Button>
                  </Link>
                  <Link to="/frota">
                    <Button variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      LANÇAR INFRAÇÃO / MULTA
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* SEÇÃO 1: Desligamentos e Profiler */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Entenda seus Desligamentos */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <CardTitle>ENTENDA SEUS DESLIGAMENTOS</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Total Geral</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">0 vol / 0 invol</p>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Menos de 1 Ano</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Neste mês</p>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Em Experiência</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Neste mês</p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-card border border-surface-border rounded-md space-y-1">
                    <p className="text-xs text-fg2 font-sans">
                      Metrifique a sua rotatividade para evitar gastos e otimizar a retenção de talentos.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-fg-on-dark font-sans">A sua rotatividade esse mês foi:</span>
                      <span className="text-sm font-bold text-green-500 font-mono flex items-center gap-1">
                        0% <TrendingDown className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] text-fg3 font-mono">(Em relação ao mês anterior)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link to="/atracao" className="flex-1">
                      <Button size="sm" className="w-full text-[10px]">ENCONTRAR OS MELHORES TALENTOS</Button>
                    </Link>
                    <Link to="/retencao-engajamento" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-[10px]">VER ANÁLISE DEMISSIONAL</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Dados de Profiler */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <CardTitle>ACOMPANHE OS SEUS DADOS DE PROFILER</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="p-3 border border-surface-border bg-surface-card rounded-md text-center">
                        <span className="block text-xl font-bold font-mono text-primary">832.8 Dias</span>
                        <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Tempo Médio de Permanência</span>
                      </div>
                      <div className="p-2.5 border border-surface-border bg-surface-card rounded-md">
                        <p className="text-[10px] text-fg3 font-bold uppercase tracking-wider font-mono">Perfil Predominante:</p>
                        <span className="text-lg font-bold font-mono text-primary">PEC</span>
                        <p className="text-[9px] text-fg2 font-sans mt-0.5 leading-relaxed">
                          Planejador, Executor, Comunicador. Resultados, diretos e estáveis.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-fg3 font-bold uppercase tracking-wider font-mono mb-1">Distribuição Comportamental:</p>
                      
                      <div className="space-y-1 text-[10px] font-sans">
                        <div className="flex justify-between font-mono">
                          <span>Executor</span>
                          <span className="font-bold text-fg-on-dark">25.69%</span>
                        </div>
                        <div className="bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '25.69%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] font-sans">
                        <div className="flex justify-between font-mono">
                          <span>Comunicador</span>
                          <span className="font-bold text-fg-on-dark">25.35%</span>
                        </div>
                        <div className="bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full" style={{ width: '25.35%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] font-sans">
                        <div className="flex justify-between font-mono">
                          <span>Planejador</span>
                          <span className="font-bold text-fg-on-dark">26.45%</span>
                        </div>
                        <div className="bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: '26.45%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] font-sans">
                        <div className="flex justify-between font-mono">
                          <span>Analista</span>
                          <span className="font-bold text-fg-on-dark">22.51%</span>
                        </div>
                        <div className="bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: '22.51%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link to="/profiler">
                      <Button size="sm" className="w-full" variant="outline">VER PROFILER DA EMPRESA</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEÇÃO 2: Avaliação de Desempenho e PDI */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Avaliação de Desempenho */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <CardTitle>DADOS DE AVALIAÇÃO DE DESEMPENHO</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Solicitações</span>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Respostas</span>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Pendentes</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-card border border-surface-border rounded-md font-sans text-xs">
                    <p className="text-fg3 font-semibold uppercase tracking-wide text-[9px] mb-1">Taxa de Respostas:</p>
                    <p className="text-fg2">
                      Dentro das Avaliações de desempenho distribuídas, a taxa de respostas dos seus funcionários é de: <span className="font-bold text-fg-on-dark font-mono">-</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link to="/desempenho?tab=participacao">
                      <Button size="sm" className="w-full">VER DADOS DE AVALIAÇÃO DE DESEMPENHO</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Planos de Desenvolvimento Individual */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <CardTitle>PLANOS DE DESENVOLVIMENTO INDIVIDUAL (PDI)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">0.00</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">PDIs Cadastrados</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Últimos 6 meses</p>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">47.00</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Sem PDI Ativo</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Colaboradores</p>
                    </div>
                    <div className="p-3 border border-surface-border bg-surface-card rounded-md">
                      <span className="block text-xl font-bold font-mono text-primary">100%</span>
                      <span className="text-[10px] text-fg3 font-bold font-sans uppercase">Metas Atingidas</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Últimos 6 meses</p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-card border border-surface-border rounded-md text-center py-5">
                    <p className="text-xs text-slate-400 font-sans italic">
                      Nenhum PDI cadastrado ainda! Comece a desenvolver seus colaboradores pelo menu Desenvolvimento e Performance e acompanhe as quantidades e status por aqui.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link to="/desempenho?tab=pdi">
                      <Button size="sm" className="w-full" variant="outline">VER PDIs CORPORATIVOS</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEÇÃO 3: Favoritos, Lembretes e DP */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Meus Favoritos */}
              <Card>
                <CardHeader>
                  <CardTitle>MEUS FAVORITOS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Pesquise aqui..." 
                      className="w-full bg-surface-card border border-surface-border rounded-md pl-9 pr-9 p-2 text-xs text-fg-on-dark focus:outline-none focus:border-primary"
                    />
                    <Sliders className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="p-4 border border-dashed border-surface-border bg-surface-card/10 text-center rounded-md">
                    <p className="text-xs text-slate-400 font-sans">
                      Você não possui favoritos. Clique em editar para adicionar um.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">EDITAR</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lembretes do Dia */}
              <Card>
                <CardHeader>
                  <CardTitle>LEMBRETES DO DIA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 font-sans text-xs">
                  <div className="flex items-start gap-3 p-3 border border-l-4 border-l-danger border-surface-border bg-red/5 rounded-md">
                    <span className="text-base">🚨</span>
                    <div>
                      <p className="font-bold text-fg-on-dark font-mono uppercase">NR-1: GERENCIAMENTO DE RISCOS</p>
                      <p className="text-[11px] text-fg3 font-mono mt-0.5">Prazo final em menos de 20 dias!</p>
                      <a href="https://meuespaco.solides.com/descomplicando-a-nr-1/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono text-[10px] mt-1 inline-block">
                        Saiba mais.
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border border-l-4 border-l-primary border-surface-border bg-brand/5 rounded-md">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="font-bold text-fg-on-dark font-mono uppercase">Acordo Coletivo 2026</p>
                      <p className="text-[11px] text-fg3 font-mono mt-0.5">Homologação da convenção da categoria prevista para este mês.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VerticalParts DP Promocional */}
              <Card>
                <CardHeader>
                  <CardTitle>VERTICALPARTS DP: TUDO EM UM LUGAR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-sans text-xs">
                  <ul className="space-y-1.5 font-mono text-[10.5px] text-fg2 list-disc pl-4">
                    <li>Controle de ponto eletrônico</li>
                    <li>Férias & Afastamentos</li>
                    <li>Admissão Digital</li>
                    <li>Gestão eletrônica de documentos (GED)</li>
                    <li>Integração direta com contabilidade</li>
                  </ul>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      TESTE GRÁTIS DP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEÇÃO 4: Aniversários Carrosséis */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pb-6">
              {/* Próximos Aniversários de Colaboradores */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <div className="flex items-center gap-2">
                    <Cake className="h-4 w-4 text-primary" />
                    <CardTitle>PRÓXIMOS ANIVERSÁRIOS DOS COLABORADORES</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between bg-surface-card p-3 border border-surface-border rounded-md">
                    <Button size="sm" variant="ghost" className="p-1 min-w-0" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <span className="inline-block text-[10px] font-bold font-mono bg-brand/10 text-primary px-2.5 py-0.5 rounded-full mb-1">
                        23/05
                      </span>
                      <h4 className="font-bold text-fg-on-dark uppercase text-xs">JOVANNA REGINA DOS SANTOS MELLO</h4>
                      <p className="text-[10px] text-fg3 font-mono mt-0.5">Analista Financeiro Jr • Financeiro</p>
                    </div>
                    <Button size="sm" variant="ghost" className="p-1 min-w-0">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Aniversários de Empresa (Tempo de Casa) */}
              <Card>
                <CardHeader className="border-b border-surface-border pb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <CardTitle>PRÓXIMOS ANIVERSÁRIOS DE CASA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between bg-surface-card p-3 border border-surface-border rounded-md">
                    <Button size="sm" variant="ghost" className="p-1 min-w-0" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center py-2 flex-1 px-4">
                      <span className="inline-block text-[10px] font-bold font-mono bg-surface-elevated text-slate-400 px-2.5 py-0.5 rounded-full mb-1">
                        23/05
                      </span>
                      <p className="text-xs text-slate-400 font-sans italic">
                        Não existe aniversário de casa dos seus colaboradores no dia especificado.
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="p-1 min-w-0">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* --- VISÃO DE LÍDER --- */}
        {userRole === 'Lider' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Users}
                color="brand"
                label="LIDERADOS DIRETOS"
                value="18"
                sub="Departamento: Engenharia"
              />
              <KpiCard
                icon={Award}
                color="purple"
                label="AVALIAÇÕES PENDENTES"
                value="2"
                sub="Ciclo: Experiência 45/90 dias"
              />
              <KpiCard
                icon={Calendar}
                color="green"
                label="SOLICITAÇÕES FÉRIAS"
                value="1"
                sub="Aguardando aprovação"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AVALIAÇÕES PENDENTES DA SUA EQUIPE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div>
                        <p className="font-semibold text-sm">MARCOS PONTES — AUXILIAR DE MONTAGEM</p>
                        <p className="text-xs text-fg3 font-mono">AVALIAÇÃO DE 45 DIAS — VENCE EM 3 DIAS</p>
                      </div>
                      <Link to="/desempenho">
                        <Button size="sm">AVALIAR →</Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <p className="font-semibold text-sm">SABRINA ALMEIDA — PROJETISTA ENGENHARIA</p>
                        <p className="text-xs text-fg3 font-mono">AVALIAÇÃO DE 90 DIAS (EFETIVAÇÃO) — VENCE EM 7 DIAS</p>
                      </div>
                      <Link to="/desempenho">
                        <Button size="sm">AVALIAR →</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ATALHOS DO LÍDER</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/organograma">
                    <Button className="w-full" variant="secondary">VISUALIZAR HIERARQUIA</Button>
                  </Link>
                  <Link to="/ssma">
                    <Button className="w-full" variant="outline">FICHAS DE EPI DA EQUIPE</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* --- VISÃO DE COLABORADOR --- */}
        {userRole === 'Colaborador' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Clock}
                color="green"
                label="BANCO DE HORAS"
                value="+14:30"
                sub="Saldo de horas a compensar"
              />
              <KpiCard
                icon={Calendar}
                color="brand"
                label="SALDO DE FÉRIAS"
                value="30 dias"
                sub="Vencimento: Dezembro/2026"
              />
              <KpiCard
                icon={CheckCircle}
                color="blue"
                label="SAÚDE OCUPACIONAL"
                value="Apto"
                sub="ASO Periódico válido"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>SUAS ATIVIDADES E PENDÊNCIAS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3 bg-red/5 p-3 border-l-4 border-l-danger">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-danger" />
                        <div>
                          <p className="font-semibold text-sm text-danger">RECONHECIMENTO DE MULTA PENDENTE</p>
                          <p className="text-xs text-fg3 font-mono">MULTA EM 22/05/2026 — VEÍCULO PLACA VP-1234</p>
                        </div>
                      </div>
                      <Link to="/frota">
                        <Button size="sm" variant="danger">RECONHECER →</Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">HOLERITE DE MAIO DISPONÍVEL</p>
                          <p className="text-xs text-fg3 font-mono">PDF DISPONIBILIZADO EM 30/05/2026</p>
                        </div>
                      </div>
                      <Badge variant="success">ASSINADO</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-sm">ASO PERIÓDICO REALIZADO</p>
                          <p className="text-xs text-fg3 font-mono">EXAME COMPROMISSADO EM 02/06/2026</p>
                        </div>
                      </div>
                      <Badge variant="success">APTO</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>REGISTRO RÁPIDO DE PONTO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center bg-surface-card p-4 border border-surface-border">
                    <p className="text-2xl font-mono tracking-widest text-primary font-bold animate-pulse">16:23:45</p>
                    <p className="text-xs text-fg3 font-mono mt-1">Sexta-feira, 05 de Junho de 2026</p>
                  </div>
                  <Link to="/ponto" className="block">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <Zap className="h-4 w-4" /> REGISTRAR PONTO AGORA →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

      </div>
    </AppShell>
  )
}
