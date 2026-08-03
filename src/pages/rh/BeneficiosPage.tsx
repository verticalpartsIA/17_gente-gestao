import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

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
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-xs text-fg3 font-sans">Nenhuma férias programada ainda — este módulo ainda não está integrado ao banco de dados.</p>
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
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-xs text-fg3 font-sans">Nenhum benefício cadastrado ainda — este módulo ainda não está integrado ao banco de dados.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>INFORMAÇÕES DE CUSTOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-sans text-fg2">
                <p>Sem benefícios cadastrados, não há custo consolidado a exibir ainda.</p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
