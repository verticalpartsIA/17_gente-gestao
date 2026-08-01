import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  DollarSign,
  Gift,
  Download,
  Eye
} from 'lucide-react'

// ── Data from HTML prototype — DP e Folha tabs 3 (Folha Digital) e 4 (Benefícios) ──

// Folha Digital — Tab 3
const FOLHA_EMPLOYEES = [
  { name: 'Ana Paula Rocha',  regime: 'CLT', salBase: 9000,  he: 500,   inss: 932,  irrf: 1250, liquido: 7318 },
  { name: 'Carlos Mendes',    regime: 'CLT', salBase: 5600,  he: 756,   inss: 695,  irrf: 567,  liquido: 5094 },
  { name: 'Roberto Faria',    regime: 'CLT', salBase: 11000, he: 0,     inss: 908,  irrf: 1820, liquido: 8272 },
  { name: 'Felipe Santos',    regime: 'CLT', salBase: 5000,  he: 0,     inss: 550,  irrf: 412,  liquido: 4038 },
  { name: 'Juliana Melo',     regime: 'CLT', salBase: 6500,  he: 0,     inss: 686,  irrf: 803,  liquido: 5011 },
  { name: 'Bruno Almeida',    regime: 'CLT', salBase: 4200,  he: 0,     inss: 420,  irrf: 241,  liquido: 3539 },
  { name: 'Beatriz Nunes',    regime: 'CLT', salBase: 2500,  he: 0,     inss: 225,  irrf: 0,    liquido: 2275 },
  { name: 'Daniela Souza',    regime: 'CLT', salBase: 4200,  he: 378,   inss: 453,  irrf: 271,  liquido: 3854 },
  { name: 'Paulo Rodrigues',  regime: 'CLT', salBase: 6200,  he: 0,     inss: 651,  irrf: 738,  liquido: 4811 },
]

const TOTAL_BRUTO = 66400
const TOTAL_ENCARGOS = 18592
const TOTAL_CUSTO = 84992

// Benefícios — Tab 4
const BENEFICIOS_CARDS = [
  { nome: 'Vale Refeição',     valor: 'R$ 25,00/dia',      cobertura: '100% colaboradores', cor: 'bg-green-50 border-green-200 text-green-700' },
  { nome: 'Vale Transporte',   valor: 'R$ 6,00/trajeto',   cobertura: 'Conforme distância',  cor: 'bg-blue-50 border-blue-200 text-blue-700' },
  { nome: 'Plano de Saúde',    valor: 'R$ 380,00/mês',     cobertura: 'Unimed — Copart.',    cor: 'bg-red-50 border-red-200 text-red-700' },
  { nome: 'Plano Odontológico',valor: 'R$ 45,00/mês',      cobertura: 'OdontoSESC',          cor: 'bg-purple-50 border-purple-200 text-purple-700' },
  { nome: 'Seguro de Vida',    valor: 'R$ 20,00/mês',      cobertura: '100% colaboradores',  cor: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
]

const BENEFICIOS_EMPLOYEES = [
  { name: 'Ana Paula Rocha', vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Carlos Mendes',   vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Roberto Faria',   vr: true, vt: false,saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Felipe Santos',   vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Juliana Melo',    vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Bruno Almeida',   vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
  { name: 'Beatriz Nunes',   vr: true, vt: true, saude: true, odonto: false,seguro: true, total: 1525 },
  { name: 'Paulo Rodrigues', vr: true, vt: true, saude: true, odonto: true, seguro: true, total: 1525 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtBrl(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function Chk({ v }: { v: boolean }) {
  return v
    ? <span className="text-green-500 font-bold">✓</span>
    : <span className="text-neutral-300">—</span>
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HoleritesPage() {
  const [activeTab, setActiveTab] = useState(0)

  const TABS = ['Folha Digital', 'Benefícios']

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="FOLHA DIGITAL E BENEFÍCIOS">
      <div className="space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={DollarSign} color="green"  label="TOTAL BRUTO"     value="R$ 66.400"  sub="Competência Julho/2026" />
          <KpiCard icon={DollarSign} color="orange" label="ENCARGOS SOCIAIS" value="R$ 18.592" sub="FGTS, INSS patronal etc." />
          <KpiCard icon={DollarSign} color="red"    label="CUSTO TOTAL RH"   value="R$ 84.992" sub="Folha + Encargos" />
          <KpiCard icon={Gift}       color="blue"   label="PACOTE BENEFÍCIOS" value="R$ 1.525"  sub="Por colaborador/mês" />
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

        {/* Tab 0 — Folha Digital */}
        {activeTab === 0 && (
          <div className="space-y-4">
            {/* Resumo financeiro */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Bruto</p>
                <p className="mt-1 text-xl font-bold text-neutral-900">{fmtBrl(TOTAL_BRUTO)}</p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Encargos Sociais</p>
                <p className="mt-1 text-xl font-bold text-orange-700">{fmtBrl(TOTAL_ENCARGOS)}</p>
                <p className="text-[10px] text-orange-500">FGTS + INSS Patronal + outros</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Custo Total RH</p>
                <p className="mt-1 text-xl font-bold text-red-700">{fmtBrl(TOTAL_CUSTO)}</p>
              </div>
            </div>

            <Card theme="light" noPadding>
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
                <div>
                  <CardTitle>Folha de Pagamento — Julho 2026</CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">9 colaboradores CLT</p>
                </div>
                <Button size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                  Exportar PDF
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Regime</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">Sal. Base</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">H. Extras</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">INSS</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">IRRF</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">Líquido</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Holerite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {FOLHA_EMPLOYEES.map((emp, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium text-neutral-900">{emp.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={emp.regime === 'CLT' ? 'success' : 'info'}>{emp.regime}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-neutral-700">{fmtBrl(emp.salBase)}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-green-600">
                          {emp.he > 0 ? fmtBrl(emp.he) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-red-600">-{fmtBrl(emp.inss)}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-red-600">
                          {emp.irrf > 0 ? `-${fmtBrl(emp.irrf)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-bold text-neutral-900">{fmtBrl(emp.liquido)}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3 w-3" />}>Ver</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                      <td colSpan={2} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Total</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-neutral-800">{fmtBrl(TOTAL_BRUTO)}</td>
                      <td colSpan={3} />
                      <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">{fmtBrl(FOLHA_EMPLOYEES.reduce((a, e) => a + e.liquido, 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 1 — Benefícios */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* Cards de benefícios */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {BENEFICIOS_CARDS.map((b, i) => (
                <div key={i} className={`rounded-lg border p-4 ${b.cor}`}>
                  <p className="text-xs font-bold uppercase tracking-wider">{b.nome}</p>
                  <p className="mt-2 text-sm font-bold">{b.valor}</p>
                  <p className="mt-1 text-[11px] opacity-70">{b.cobertura}</p>
                </div>
              ))}
            </div>

            {/* Tabela por colaborador */}
            <Card theme="light" noPadding>
              <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Benefícios por Colaborador</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vale Ref.</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vale Transp.</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Saúde</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Odonto</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Seg. Vida</th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total/mês</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {BENEFICIOS_EMPLOYEES.map((emp, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium text-neutral-900">{emp.name}</td>
                        <td className="px-4 py-3 text-center"><Chk v={emp.vr} /></td>
                        <td className="px-4 py-3 text-center"><Chk v={emp.vt} /></td>
                        <td className="px-4 py-3 text-center"><Chk v={emp.saude} /></td>
                        <td className="px-4 py-3 text-center"><Chk v={emp.odonto} /></td>
                        <td className="px-4 py-3 text-center"><Chk v={emp.seguro} /></td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-800">{fmtBrl(emp.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                      <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500" colSpan={6}>
                        Custo Total Benefícios/mês
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                        {fmtBrl(BENEFICIOS_EMPLOYEES.reduce((a, e) => a + e.total, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
