import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import { Plane, Stethoscope, Users, CalendarClock, Plus } from 'lucide-react'

// Tela própria de DP para "Férias & Afastamentos" (issue #43) — antes essa
// entrada do menu caía em /beneficios?tab=ferias, que só cobria férias e
// misturava o assunto com o módulo de Benefícios. Aqui os dois temas (férias
// e afastamentos) têm cada um sua aba, e nenhum dos dois existe ainda como
// tabela real no banco — por isso os KPIs e listas ficam honestamente vazios,
// exceto o total de colaboradores ativos, que já vem de `profiles`.
type Tab = 'ferias' | 'afastamentos'

export default function FeriasAfastamentosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<Tab>(urlTab === 'afastamentos' ? 'afastamentos' : 'ferias')
  const [activeCount, setActiveCount] = useState<number | null>(null)

  useEffect(() => {
    if (urlTab === 'afastamentos' || urlTab === 'ferias') setActiveTab(urlTab)
  }, [urlTab])

  useEffect(() => {
    async function load() {
      const { count } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      setActiveCount(count ?? 0)
    }
    load()
  }, [])

  function selectTab(tab: Tab) {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="DEPARTAMENTO PESSOAL — FÉRIAS & AFASTAMENTOS">
      <div className="space-y-6">
        <DemoDataBanner />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Users}         color="brand" label="COLABORADORES ATIVOS" value={activeCount === null ? '—' : `${activeCount}`} sub="Base elegível a férias/afastamentos" />
          <KpiCard icon={Plane}         color="blue"  label="FÉRIAS PROGRAMADAS"   value="0" sub="Nenhuma programação cadastrada" />
          <KpiCard icon={Stethoscope}   color="red"   label="AFASTAMENTOS ATIVOS"  value="0" sub="Nenhum afastamento em aberto" />
          <KpiCard icon={CalendarClock} color="green" label="RETORNOS NOS PRÓX. 30 DIAS" value="0" sub="Férias e afastamentos" />
        </div>

        {/* TABS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1">
          <button
            onClick={() => selectTab('ferias')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'ferias' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            FÉRIAS
          </button>
          <button
            onClick={() => selectTab('afastamentos')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'afastamentos' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            AFASTAMENTOS
          </button>
        </div>

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

        {activeTab === 'afastamentos' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>AFASTAMENTOS EM ANDAMENTO</CardTitle>
                <Button
                  size="sm"
                  rightIcon={<Plus className="h-4 w-4" />}
                  onClick={() => alert('Registro de afastamento ainda não está conectado ao banco de dados.')}
                >
                  REGISTRAR AFASTAMENTO
                </Button>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-xs text-fg3 font-sans">Nenhum afastamento registrado ainda — este módulo ainda não está integrado ao banco de dados.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TIPOS DE AFASTAMENTO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-sans">
                <div className="p-3 bg-surface-card border border-surface-border">
                  <p className="font-bold text-fg-on-dark">PREVISTOS</p>
                  <p className="text-fg3 font-mono mt-1">Atestado médico, licença maternidade/paternidade, acidente de trabalho, licença sem vencimento.</p>
                </div>
                <div className="p-3 bg-surface-card border border-surface-border">
                  <p className="font-bold text-fg-on-dark">REGRAS GERAIS</p>
                  <p className="text-[10px] text-fg3 font-mono mt-1">Afastamentos por atestado médico acima de 15 dias exigem perícia do INSS (auxílio-doença).</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
