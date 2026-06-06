import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  User, 
  Clock, 
  Calendar, 
  FileText, 
  Zap, 
  Download,
  AlertTriangle
} from 'lucide-react'

export default function MeuEspacoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'ponto'
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

  // Data mocks para o colaborador logado
  const mockPonto = [
    { date: '05/06/2026', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '17:00', balance: '00:00' },
    { date: '04/06/2026', entry1: '07:45', exit1: '12:00', entry2: '13:00', exit2: '17:15', balance: '+00:30' },
    { date: '03/06/2026', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '17:00', balance: '00:00' }
  ]

  const mockHolerites = [
    { period: 'Maio / 2026', gross: 'R$ 4.800,00', net: 'R$ 3.920,00', status: 'Assinado' },
    { period: 'Abril / 2026', gross: 'R$ 4.800,00', net: 'R$ 3.920,00', status: 'Assinado' },
    { period: 'Março / 2026', gross: 'R$ 4.800,00', net: 'R$ 3.920,00', status: 'Assinado' }
  ]

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="MEU ESPAÇO VERTICALPARTS — PORTAL DO COLABORADOR">
      <div className="space-y-6">
        
        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 overflow-x-auto gap-1">
          <button
            onClick={() => handleTabChange('ponto')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'ponto' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Meu Ponto
          </button>
          <button
            onClick={() => handleTabChange('holerites')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'holerites' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Meus Holerites
          </button>
          <button
            onClick={() => handleTabChange('ferias')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'ferias' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Minhas Férias
          </button>
        </div>

        {/* --- TAB: MEU PONTO --- */}
        {activeTab === 'ponto' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Clock}
                color="brand"
                label="SALDO DE HORAS GERAL"
                value="+14:30"
                sub="Pronto para compensação"
              />
              <KpiCard
                icon={User}
                color="green"
                label="JORNADA CONTRATUAL"
                value="44h Semanais"
                sub="De Segunda a Sexta"
              />
              <KpiCard
                icon={Zap}
                color="blue"
                label="STATUS DO REGISTRO"
                value="Regular"
                sub="Nenhuma pendência ou atraso"
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>HISTÓRICO RECENTE DE BATIDAS</CardTitle>
                <Button size="sm">SOLICITAR AJUSTE</Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                      <th className="p-3">DATA</th>
                      <th className="p-3">ENTRADA 1</th>
                      <th className="p-3">SAÍDA 1</th>
                      <th className="p-3">ENTRADA 2</th>
                      <th className="p-3">SAÍDA 2</th>
                      <th className="p-3">SALDO DO DIA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border font-mono">
                    {mockPonto.map((day, idx) => (
                      <tr key={idx} className="hover:bg-surface-card/10">
                        <td className="p-3 font-bold text-fg-on-dark">{day.date}</td>
                        <td className="p-3">{day.entry1}</td>
                        <td className="p-3">{day.exit1}</td>
                        <td className="p-3">{day.entry2}</td>
                        <td className="p-3">{day.exit2}</td>
                        <td className="p-3">
                          <span className={day.balance.startsWith('+') ? 'text-success font-bold' : 'text-fg2'}>
                            {day.balance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* --- TAB: MEUS HOLERITES --- */}
        {activeTab === 'holerites' && (
          <Card>
            <CardHeader>
              <CardTitle>SEUS DEMONSTRATIVOS DE PAGAMENTO</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card text-fg3 font-mono">
                    <th className="p-3">PERÍODO</th>
                    <th className="p-3">SALÁRIO BRUTO</th>
                    <th className="p-3">SALÁRIO LÍQUIDO</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">DOWNLOAD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {mockHolerites.map((hol, idx) => (
                    <tr key={idx} className="hover:bg-surface-card/10">
                      <td className="p-3 font-bold text-fg-on-dark uppercase font-sans">{hol.period}</td>
                      <td className="p-3">{hol.gross}</td>
                      <td className="p-3 text-primary font-bold">{hol.net}</td>
                      <td className="p-3">
                        <Badge variant="success">{hol.status.toUpperCase()}</Badge>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" rightIcon={<Download className="h-3.5 w-3.5" />}>
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* --- TAB: MINHAS FÉRIAS --- */}
        {activeTab === 'ferias' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Calendar}
                color="brand"
                label="SALDO DE DIAS"
                value="30 Dias"
                sub="Adquiridos e disponíveis"
              />
              <KpiCard
                icon={FileText}
                color="blue"
                label="PERÍODO AQUISITIVO"
                value="2025 - 2026"
                sub="Vence em Dezembro/2026"
              />
              <KpiCard
                icon={AlertTriangle}
                color="purple"
                label="SOLICITAÇÕES"
                value="Nenhuma ativa"
                sub="Aguardando envio pelo portal"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SOLICITAR AGENDAMENTO DE FÉRIAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 font-sans text-xs">
                <p className="text-fg2">
                  Você possui **30 dias** de férias disponíveis referentes ao período aquisitivo de **2025 - 2026**.
                  Envie sua solicitação para a liderança com pelo menos **60 dias** de antecedência para garantir a aprovação.
                </p>
                <div className="flex justify-start border-t border-surface-border pt-4">
                  <Button>AGENDAR FÉRIAS AGORA</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </AppShell>
  )
}
