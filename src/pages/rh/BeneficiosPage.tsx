import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Heart, 
  Clock, 
  Plus, 
  FileText
} from 'lucide-react'

const FERIAS_QUERIES = new Set(['ferias', 'minhas-ferias'])

// gestao/refeicao/transporte/saude prometidos pelo menu ainda não têm tela
// própria — mostram aviso honesto em vez de cair silenciosamente em Férias
// ou Benefícios Ativos.
const NO_CONTENT_LABEL: Record<string, string> = {
  gestao: 'Gestão de Benefícios',
  refeicao: 'Vale Refeição & Alimentação',
  transporte: 'Vale Transporte',
  saude: 'Plano de Saúde',
}

export default function BeneficiosPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'ferias' | 'beneficios'>('ferias')
  const urlTab = searchParams.get('tab')

  useEffect(() => {
    if (urlTab && FERIAS_QUERIES.has(urlTab)) setActiveTab('ferias')
  }, [urlTab])

  if (urlTab && urlTab in NO_CONTENT_LABEL) {
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="DEPARTAMENTO PESSOAL — FÉRIAS & BENEFÍCIOS">
        <div className="space-y-6">
          <DemoDataBanner />
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-fg2">
                {NO_CONTENT_LABEL[urlTab]} ainda não tem tela própria implementada.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="DEPARTAMENTO PESSOAL — FÉRIAS & BENEFÍCIOS">
      <div className="space-y-6">
        <DemoDataBanner />
        
        {/* TABS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1">
          <button
            onClick={() => setActiveTab('ferias')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'ferias' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            CONTROLE DE FÉRIAS
          </button>
          <button
            onClick={() => setActiveTab('beneficios')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'beneficios' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            BENEFÍCIOS ATIVOS
          </button>
        </div>

        {/* TAB: FERIAS */}
        {activeTab === 'ferias' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>PROGRAMAÇÃO DE FÉRIAS DA EQUIPE</CardTitle>
                <Button
                  size="sm"
                  rightIcon={<Plus className="h-4 w-4" />}
                  onClick={() => alert('Solicitação de agendamento de férias ainda não está conectada ao banco de dados.')}
                >
                  SOLICITAR AGENDAMENTO
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border">
                
                <div className="py-4 flex justify-between items-center text-xs font-sans">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase">Carlos Oliveira (Logística)</h4>
                    <p className="text-fg3 font-mono">Período Aquisitivo: 2024/2025 | Programado: 01/12/2026 a 30/12/2026</p>
                  </div>
                  <Badge variant="success">APROVADO GESTOR</Badge>
                </div>

                <div className="py-4 flex justify-between items-center text-xs font-sans">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase">Karla Souza (Engenharia)</h4>
                    <p className="text-fg3 font-mono">Período Aquisitivo: 2023/2024 | Programado: 10/07/2026 a 25/07/2026 (15 dias)</p>
                  </div>
                  <Badge variant="warning">EM ANÁLISE RH</Badge>
                </div>

                <div className="py-4 flex justify-between items-center text-xs font-sans">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase">Juliana Silva (Financeiro)</h4>
                    <p className="text-fg3 font-mono">Período Aquisitivo: 2022/2023 | Sem programação de férias pendente</p>
                  </div>
                  <Badge variant="collaborator">SEM PROGRAMAÇÃO</Badge>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SALDOS ADQUIRIDOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-sans">
                <div className="p-3 bg-surface-card border border-surface-border">
                  <p className="font-bold text-fg-on-dark">FÉRIAS VENCIDAS</p>
                  <p className="text-fg3 font-mono mt-1">Nenhum colaborador com férias vencidas ou acumuladas fora do prazo legal.</p>
                </div>
                <div className="p-3 bg-surface-card border border-surface-border">
                  <p className="font-bold text-fg-on-dark">REGRAS GERAIS</p>
                  <p className="text-[10px] text-fg3 font-mono mt-1">Conforme CLT, o aviso de férias deve ser comunicado por escrito com antecedência mínima de 30 dias ao colaborador.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB: BENEFICIOS */}
        {activeTab === 'beneficios' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>BENEFÍCIOS DISPONÍVEIS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-sans">
                
                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-fg-on-dark">PLANO DE SAÚDE SULAMÉRICA</p>
                      <p className="text-[10px] text-fg3">Co-participativo, cobertura nacional.</p>
                    </div>
                  </div>
                  <Badge variant="success">ATIVADO</Badge>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-fg-on-dark">VALE ALIMENTAÇÃO / REFEIÇÃO</p>
                      <p className="text-[10px] text-fg3">R$ 35,00 por dia útil (Cartão Pluxee).</p>
                    </div>
                  </div>
                  <Badge variant="success">ATIVADO</Badge>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-fg-on-dark">VALE TRANSPORTE CORPORATIVO</p>
                      <p className="text-[10px] text-fg3">Desconto padrão em folha (6%) para deslocamentos.</p>
                    </div>
                  </div>
                  <Badge variant="success">ATIVADO</Badge>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>INFORMAÇÕES DE CUSTOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-sans text-fg2">
                <p>
                  O custo mensal consolidado de benefícios corporativos ativos na VerticalParts representa **18.4%** adicionais sobre a folha de pagamento base.
                </p>
                <p>
                  A gestão e recargas de vale refeição/transporte são coordenadas pelo financeiro no dia 28 de cada mês subsequente.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
