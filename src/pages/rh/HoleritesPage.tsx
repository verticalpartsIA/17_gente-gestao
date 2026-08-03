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
  DollarSign,
  Gift,
  Download,
  Eye
} from 'lucide-react'

// Nenhuma folha real foi processada ainda (não existe rh_folha) — os arrays
// ficam vazios em vez de fabricar salário/INSS/IRRF de pessoas reais.
const FOLHA_EMPLOYEES: { name: string; regime: string; salBase: number; he: number; inss: number; irrf: number; liquido: number }[] = []

const TOTAL_BRUTO = 0
const TOTAL_ENCARGOS = 0
const TOTAL_CUSTO = 0

const BENEFICIOS_CARDS: { nome: string; valor: string; cobertura: string; cor: string }[] = []

const BENEFICIOS_EMPLOYEES: { name: string; vr: boolean; vt: boolean; saude: boolean; odonto: boolean; seguro: boolean; total: number }[] = []

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
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const urlTab = searchParams.get('tab')

  // fechamento/holerites apontam pra mesma tabela de Folha Digital (ela já
  // lista os holerites por colaborador). "encargos" ainda não tem um
  // detalhamento próprio — só o KPI de Encargos Sociais no topo.
  useEffect(() => {
    if (urlTab === 'fechamento' || urlTab === 'holerites') setActiveTab(0)
  }, [urlTab])

  const TABS = ['Folha Digital', 'Benefícios']

  if (urlTab === 'encargos') {
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="FOLHA DIGITAL E BENEFÍCIOS">
        <div className="space-y-6">
          <DemoDataBanner />
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-fg2">
                Demonstrativo detalhado de encargos ainda não tem tela própria — hoje só o total de
                Encargos Sociais aparece nos KPIs da aba Folha Digital.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="FOLHA DIGITAL E BENEFÍCIOS">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={DollarSign} color="green"  label="TOTAL BRUTO"     value="—"  sub="Módulo ainda não integrado" />
          <KpiCard icon={DollarSign} color="orange" label="ENCARGOS SOCIAIS" value="—" sub="Módulo ainda não integrado" />
          <KpiCard icon={DollarSign} color="red"    label="CUSTO TOTAL RH"   value="—" sub="Módulo ainda não integrado" />
          <KpiCard icon={Gift}       color="blue"   label="PACOTE BENEFÍCIOS" value="—"  sub="Módulo ainda não integrado" />
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
                  <p className="mt-1 text-xs text-neutral-500">{FOLHA_EMPLOYEES.length} colaboradores CLT</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                  disabled
                  title="Desabilitado: os dados desta tabela são demonstrativos, não são holerites reais."
                >
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
                    {FOLHA_EMPLOYEES.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhuma folha processada ainda.</td></tr>
                    )}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-3 w-3" />}
                            onClick={() => alert('Visualização de holerite ainda não está conectada ao banco de dados.')}
                          >
                            Ver
                          </Button>
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
            {BENEFICIOS_CARDS.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">Nenhum benefício cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {BENEFICIOS_CARDS.map((b, i) => (
                  <div key={i} className={`rounded-lg border p-4 ${b.cor}`}>
                    <p className="text-xs font-bold uppercase tracking-wider">{b.nome}</p>
                    <p className="mt-2 text-sm font-bold">{b.valor}</p>
                    <p className="mt-1 text-[11px] opacity-70">{b.cobertura}</p>
                  </div>
                ))}
              </div>
            )}

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
                    {BENEFICIOS_EMPLOYEES.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">Nenhum benefício por colaborador cadastrado ainda.</td></tr>
                    )}
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
