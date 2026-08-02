import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Car,
  AlertTriangle,
  Wrench,
  Gauge,
  Plus,
  Eye
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

const VEICULOS = [
  { placa: 'ABC-1234', modelo: 'VW Gol',            ano: 2021, tipo: 'Hatch',  depto: 'Logística',          responsavel: 'Felipe Santos',   km: '84.320',  status: 'Regular' },
  { placa: 'DEF-5678', modelo: 'Fiat Strada',       ano: 2020, tipo: 'Pickup', depto: 'Logística',          responsavel: 'João Figueiredo', km: '67.150',  status: 'Regular' },
  { placa: 'GHI-9012', modelo: 'Ford Transit',      ano: 2019, tipo: 'Van',    depto: 'Logística',          responsavel: 'Priya Correia',   km: '102.840', status: 'Atenção' },
  { placa: 'JKL-3456', modelo: 'Toyota Hilux',      ano: 2022, tipo: '4x4',   depto: 'Consultoria Técnica', responsavel: 'Eduardo Pires',   km: '48.920',  status: 'Regular' },
  { placa: 'MNO-7890', modelo: 'Renault Duster',    ano: 2020, tipo: 'SUV',   depto: 'Comercial',           responsavel: 'Bruno Almeida',   km: '59.430',  status: 'Regular' },
  { placa: 'PQR-1122', modelo: 'Mercedes Sprinter', ano: 2018, tipo: 'Furgão',depto: 'Produção',            responsavel: 'Vinícius Castro', km: '148.160', status: 'Crítico' },
]

const INFRACOES = [
  { placa: 'GHI-9012', data: '15/07/2026', tipo: 'Excesso de velocidade',    pontos: 4, valor: 'R$ 195,23', status: 'Pendente'    },
  { placa: 'MNO-7890', data: '08/07/2026', tipo: 'Uso de celular ao volante', pontos: 7, valor: 'R$ 293,47', status: 'Pendente'    },
  { placa: 'ABC-1234', data: '02/07/2026', tipo: 'Estacionamento irregular',  pontos: 3, valor: 'R$ 130,16', status: 'Pago'        },
  { placa: 'PQR-1122', data: '22/06/2026', tipo: 'Avanço de sinal vermelho',  pontos: 7, valor: 'R$ 293,47', status: 'Contestado'  },
  { placa: 'DEF-5678', data: '10/06/2026', tipo: 'Excesso de velocidade',     pontos: 3, valor: 'R$ 130,16', status: 'Pago'        },
]

const MANUTENCOES = [
  { placa: 'PQR-1122', modelo: 'Mercedes Sprinter', tipo: 'Revisão geral + troca de correia',   previsao: '25/07/2026', urgencia: 'Urgente'    },
  { placa: 'GHI-9012', modelo: 'Ford Transit',      tipo: 'Alinhamento, balanceamento e pneus', previsao: '30/07/2026', urgencia: 'Em Breve'   },
  { placa: 'ABC-1234', modelo: 'VW Gol',            tipo: 'Troca de óleo e filtros',            previsao: '15/08/2026', urgencia: 'Programado' },
  { placa: 'DEF-5678', modelo: 'Fiat Strada',       tipo: 'Revisão dos 70.000 km',              previsao: '20/08/2026', urgencia: 'Programado' },
  { placa: 'JKL-3456', modelo: 'Toyota Hilux',      tipo: 'Troca de óleo + filtro de ar',       previsao: '05/09/2026', urgencia: 'Programado' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function veiculoStatusBadge(status: string) {
  if (status === 'Regular') return <Badge variant="success">{status}</Badge>
  if (status === 'Atenção') return <Badge variant="warning">{status}</Badge>
  if (status === 'Crítico') return <Badge variant="danger">{status}</Badge>
  return <Badge>{status}</Badge>
}

function infracaoStatusBadge(status: string) {
  if (status === 'Pago')       return <Badge variant="success">{status}</Badge>
  if (status === 'Pendente')   return <Badge variant="danger">{status}</Badge>
  if (status === 'Contestado') return <Badge variant="warning">{status}</Badge>
  return <Badge>{status}</Badge>
}

function urgenciaBadge(urgencia: string) {
  if (urgencia === 'Urgente')    return <Badge variant="danger">{urgencia}</Badge>
  if (urgencia === 'Em Breve')   return <Badge variant="warning">{urgencia}</Badge>
  if (urgencia === 'Programado') return <Badge variant="info">{urgencia}</Badge>
  return <Badge>{urgencia}</Badge>
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FrotaPage() {
  const [activeTab, setActiveTab] = useState(0)

  const TABS = ['Veículos', 'Infrações', 'Manutenção']

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="GESTÃO DE FROTA">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Car}           color="blue"   label="VEÍCULOS NA FROTA"    value="6"       sub="Ativos e monitorados" />
          <KpiCard icon={Gauge}         color="green"  label="KM TOTAL RODADOS"     value="410.820" sub="Total acumulado da frota" />
          <KpiCard icon={AlertTriangle} color="red"    label="MULTAS PENDENTES"      value="2"       sub="R$ 488,70 a regularizar" />
          <KpiCard icon={Wrench}        color="orange" label="MANUTENÇÕES PRÓXIMAS" value="2"       sub="Nos próximos 7 dias" />
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

        {/* Tab 0 — Veículos */}
        {activeTab === 0 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Frota de Veículos</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Adicionar Veículo</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Placa</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Modelo / Ano</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Tipo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Responsável</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">KM</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {VEICULOS.map((v, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded bg-neutral-800 px-2 py-1 font-mono text-xs font-bold text-white">
                          {v.placa}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">{v.modelo}</span>{' '}
                        <span className="text-neutral-400">{v.ano}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{v.tipo}</td>
                      <td className="px-4 py-3 text-neutral-600">{v.depto}</td>
                      <td className="px-4 py-3 text-neutral-600">{v.responsavel}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-neutral-700">{v.km} km</td>
                      <td className="px-4 py-3">{veiculoStatusBadge(v.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Infrações */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total de Multas</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">R$ 1.042,49</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Pendente de Pagamento</p>
                <p className="mt-1 text-2xl font-bold text-red-700">R$ 488,70</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">Já Regularizadas</p>
                <p className="mt-1 text-2xl font-bold text-green-700">R$ 260,32</p>
              </div>
            </div>

            <Card theme="light" noPadding>
              <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Histórico de Infrações</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Placa</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Data</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Infração</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Pontos</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">Valor</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {INFRACOES.map((inf, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded bg-neutral-800 px-2 py-1 font-mono text-xs font-bold text-white">
                            {inf.placa}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-neutral-600">{inf.data}</td>
                        <td className="px-4 py-3 text-neutral-700">{inf.tipo}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            inf.pontos >= 7 ? 'bg-red-100 text-red-700' :
                            inf.pontos >= 4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {inf.pontos}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-neutral-800">{inf.valor}</td>
                        <td className="px-4 py-3">{infracaoStatusBadge(inf.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2 — Manutenção */}
        {activeTab === 2 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Agenda de Manutenção</CardTitle>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Agendar Manutenção</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Placa</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Modelo</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Serviço</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Previsão</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Urgência</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {MANUTENCOES.map((m, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded bg-neutral-800 px-2 py-1 font-mono text-xs font-bold text-white">
                          {m.placa}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{m.modelo}</td>
                      <td className="px-4 py-3 text-neutral-600">{m.tipo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">{m.previsao}</td>
                      <td className="px-4 py-3">{urgenciaBadge(m.urgencia)}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>Detalhes</Button>
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
