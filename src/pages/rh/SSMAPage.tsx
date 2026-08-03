import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  ShieldAlert,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  Plus,
  FileText
} from 'lucide-react'

// Módulos de SST (ASO/EPI/NR) ainda não têm tabela real no Supabase.
// Em vez de fabricar exames/entregas/normas sobre pessoas que não passaram
// por nenhum desses processos de verdade, ficam vazios até existir dado real.
const ASO_DATA: { id: number; initials: string; name: string; role: string; next: string; status: string }[] = []
const EPI_DATA: { id: number; initials: string; name: string; epi: string; ca: string; entrega: string; vencimento: string; status: string }[] = []
const NR_DATA: { nr: string; titulo: string; vencimento: string; responsavel: string; status: string }[] = []

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === 'Em Dia' || status === 'Conforme') return <Badge variant="success">{status}</Badge>
  if (status === 'Vencido') return <Badge variant="danger">{status}</Badge>
  if (status === 'A Vencer') return <Badge variant="warning">{status}</Badge>
  if (status === 'Atenção') return <Badge variant="warning">{status}</Badge>
  return <Badge>{status}</Badge>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TAB_BY_QUERY: Record<string, number> = { aso: 0, epis: 1, nrs: 2 }

export default function SSMAPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const q = searchParams.get('tab')
    if (q && q in TAB_BY_QUERY) setActiveTab(TAB_BY_QUERY[q])
  }, [searchParams])

  const TABS = ['Exames ASO', 'Fichas de EPI', 'Normas Regulamentadoras (NRs)']

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="SST — SAÚDE E SEGURANÇA DO TRABALHO">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={HeartPulse}  color="green"  label="ASO EM DIA"           value="0"          sub="Módulo ainda não integrado" />
          <KpiCard icon={AlertTriangle} color="red"  label="ASO VENCIDOS"          value="0"          sub="Módulo ainda não integrado" />
          <KpiCard icon={ShieldAlert} color="orange" label="A VENCER (90 DIAS)"   value="0"          sub="Módulo ainda não integrado" />
          <KpiCard icon={CheckCircle} color="blue"   label="NRs EM CONFORMIDADE"  value="0"          sub="Módulo ainda não integrado" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0 — Exames ASO */}
        {activeTab === 0 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Controle de Exames Médicos (ASO)</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Agendamento de ASO ainda não está conectado ao banco de dados.')}>Agendar ASO</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Próx. Vencimento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ASO_DATA.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhum exame ASO cadastrado ainda.</td></tr>
                  )}
                  {ASO_DATA.map(row => (
                    <tr key={row.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                            {row.initials}
                          </div>
                          <span className="font-medium text-neutral-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{row.role}</td>
                      <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{row.next}</td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                      <td className="px-4 py-3">
                        {row.status !== 'Em Dia' ? (
                          <Button variant="outline" size="sm" onClick={() => alert('Agendamento de ASO ainda não está conectado ao banco de dados.')}>Agendar</Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => alert('Visualização de laudo ainda não está conectada ao banco de dados.')}>Ver Laudo</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Fichas de EPI */}
        {activeTab === 1 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Fichas de EPI — Controle de Entrega</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => alert('Registro de entrega de EPI ainda não está conectado ao banco de dados.')}>Registrar Entrega</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">EPI</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">CA</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Entrega</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vencimento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {EPI_DATA.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhuma entrega de EPI cadastrada ainda.</td></tr>
                  )}
                  {EPI_DATA.map(row => (
                    <tr key={row.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                            {row.initials}
                          </div>
                          <span className="font-medium text-neutral-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-800">{row.epi}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{row.ca}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{row.entrega}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{row.vencimento}</td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 2 — NRs */}
        {activeTab === 2 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Normas Regulamentadoras — Status de Conformidade</CardTitle>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> 0 Conformes</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span> 0 Atenção</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">NR</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Título</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vencimento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Responsável</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {NR_DATA.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhuma norma regulamentadora cadastrada ainda.</td></tr>
                  )}
                  {NR_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded bg-neutral-800 px-2 py-1 text-xs font-bold text-white">
                          {row.nr}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 max-w-xs">{row.titulo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{row.vencimento}</td>
                      <td className="px-4 py-3 text-neutral-600">{row.responsavel}</td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FileText className="h-3 w-3" />}
                          onClick={() => alert('Visualização de documento de NR ainda não está conectada ao banco de dados.')}
                        >
                          Ver Doc.
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  )
}
