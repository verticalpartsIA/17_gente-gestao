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

// ── Data from HTML prototype ──────────────────────────────────────────────────

const ASO_DATA = [
  { id: 1, initials: 'CM', name: 'Carlos Mendes',     role: 'Técnico de Manutenção', next: '05/03/2027', status: 'Em Dia' },
  { id: 2, initials: 'FS', name: 'Felipe Santos',     role: 'Coord. de Logística',   next: '14/09/2026', status: 'Em Dia' },
  { id: 3, initials: 'TB', name: 'Thiago Barbosa',    role: 'Auxiliar de Produção',  next: '20/06/2026', status: 'Vencido' },
  { id: 4, initials: 'VC', name: 'Vinícius Castro',   role: 'Operador de Máquinas',  next: '05/08/2026', status: 'A Vencer' },
  { id: 5, initials: 'SO', name: 'Sandra Oliveira',   role: 'Aux. de Almoxarifado',  next: '11/01/2027', status: 'Em Dia' },
  { id: 6, initials: 'JF', name: 'João Figueiredo',   role: 'Aux. de Logística',     next: '01/08/2026', status: 'Em Dia' },
  { id: 7, initials: 'BN', name: 'Beatriz Nunes',     role: 'Assistente Financeiro', next: '28/07/2027', status: 'Em Dia' },
  { id: 8, initials: 'EP', name: 'Eduardo Pires',     role: 'Consultor Técnico',     next: '08/07/2026', status: 'Vencido' },
  { id: 9, initials: 'PR', name: 'Paulo Rodrigues',   role: 'Coord. de Almoxarifado',next: '22/09/2026', status: 'A Vencer' },
  { id: 10,initials: 'DA', name: 'Daniela Souza',     role: 'Analista de Qualidade', next: '30/04/2027', status: 'Em Dia' },
]

const EPI_DATA = [
  { id: 1, initials: 'CM', name: 'Carlos Mendes',   epi: 'Capacete de Segurança',   ca: '43280', entrega: '10/03/2026', vencimento: '10/03/2027', status: 'Em Dia' },
  { id: 2, initials: 'TB', name: 'Thiago Barbosa',  epi: 'Luva de Proteção',        ca: '29792', entrega: '15/03/2026', vencimento: '15/06/2026', status: 'Vencido' },
  { id: 3, initials: 'VC', name: 'Vinícius Castro', epi: 'Óculos de Proteção',      ca: '35156', entrega: '01/04/2026', vencimento: '01/10/2026', status: 'A Vencer' },
  { id: 4, initials: 'FS', name: 'Felipe Santos',   epi: 'Colete Refletivo',        ca: '12345', entrega: '20/01/2026', vencimento: '20/01/2027', status: 'Em Dia' },
  { id: 5, initials: 'JF', name: 'João Figueiredo', epi: 'Botina de Segurança',     ca: '67890', entrega: '01/08/2026', vencimento: '01/08/2027', status: 'Em Dia' },
  { id: 6, initials: 'PR', name: 'Paulo Rodrigues', epi: 'Protetor Auricular',      ca: '54321', entrega: '22/03/2026', vencimento: '22/09/2026', status: 'A Vencer' },
  { id: 7, initials: 'DA', name: 'Daniela Souza',   epi: 'Capacete de Segurança',   ca: '43280', entrega: '05/02/2026', vencimento: '05/02/2027', status: 'Em Dia' },
]

const NR_DATA = [
  { nr: 'NR-01', titulo: 'Disposições Gerais e Gerenciamento de Riscos', vencimento: '15/01/2027', responsavel: 'Roberto Lima',   status: 'Conforme' },
  { nr: 'NR-05', titulo: 'Comissão Interna de Prevenção de Acidentes (CIPA)', vencimento: '30/06/2027', responsavel: 'Carlos Mendes',  status: 'Conforme' },
  { nr: 'NR-06', titulo: 'Equipamentos de Proteção Individual (EPI)',      vencimento: '10/03/2027', responsavel: 'Paulo Rodrigues', status: 'Atenção' },
  { nr: 'NR-07', titulo: 'Programas de Controle Médico de Saúde Ocupacional (PCMSO)', vencimento: '20/04/2027', responsavel: 'Felipe Santos',  status: 'Atenção' },
  { nr: 'NR-09', titulo: 'Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos', vencimento: '05/08/2026', responsavel: 'Carlos Mendes',  status: 'Conforme' },
  { nr: 'NR-10', titulo: 'Segurança em Instalações e Serviços em Eletricidade', vencimento: '22/07/2027', responsavel: 'Diego Alves',    status: 'Conforme' },
  { nr: 'NR-12', titulo: 'Segurança no Trabalho em Máquinas e Equipamentos', vencimento: '18/09/2026', responsavel: 'Vinícius Castro', status: 'Conforme' },
  { nr: 'NR-17', titulo: 'Ergonomia',                                       vencimento: '11/11/2026', responsavel: 'Daniela Souza',  status: 'Atenção' },
  { nr: 'NR-35', titulo: 'Trabalho em Altura',                               vencimento: '03/06/2027', responsavel: 'Thiago Barbosa', status: 'Conforme' },
]

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
          <KpiCard icon={HeartPulse}  color="green"  label="ASO EM DIA"           value="6"          sub="Exames médicos em dia" />
          <KpiCard icon={AlertTriangle} color="red"  label="ASO VENCIDOS"          value="2"          sub="Necessitam renovação urgente" />
          <KpiCard icon={ShieldAlert} color="orange" label="A VENCER (90 DIAS)"   value="2"          sub="Agendar em breve" />
          <KpiCard icon={CheckCircle} color="blue"   label="NRs EM CONFORMIDADE"  value="6"          sub="De 9 normas monitoradas" />
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
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> 6 Conformes</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span> 3 Atenção</span>
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
