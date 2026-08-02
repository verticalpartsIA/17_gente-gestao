import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'

// ── Data from HTML prototype — DP e Folha tab 1 (Ponto Eletrônico, Junho 2026) ──

const DIAS_UTEIS = [1,2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30]

// Each employee: name, initials, dept, role, total_he (+ positive = HE; - negative = falta)
const PONTO_EMPLOYEES = [
  { initials: 'AP', name: 'Ana Paula Rocha',  dept: 'Comercial',       role: 'Gerente Comercial',    he: +8  },
  { initials: 'CM', name: 'Carlos Mendes',    dept: 'Produção',        role: 'Supervisor',            he: +12 },
  { initials: 'FS', name: 'Felipe Santos',    dept: 'Logística',       role: 'Coord. de Logística',   he: -4  },
  { initials: 'BA', name: 'Bruno Almeida',    dept: 'Comercial',       role: 'Executivo de Vendas',   he: 0   },
  { initials: 'DS', name: 'Daniela Souza',    dept: 'Qualidade',       role: 'Analista de Qualidade', he: +6  },
  { initials: 'PR', name: 'Paulo Rodrigues',  dept: 'Almoxarifado',    role: 'Coord. de Almoxarifado',he: -2  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PontoPage() {
  const [mesRef] = useState('Junho 2026')

  const totalHE = PONTO_EMPLOYEES.reduce((acc, e) => acc + (e.he > 0 ? e.he : 0), 0)
  const totalFalta = PONTO_EMPLOYEES.reduce((acc, e) => acc + (e.he < 0 ? Math.abs(e.he) : 0), 0)

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="PONTO ELETRÔNICO">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Clock}         color="blue"   label="HORAS EXTRAS TOTAL" value={`${totalHE}h`}   sub={`Competência ${mesRef}`} />
          <KpiCard icon={AlertTriangle} color="red"    label="HORAS NEGATIVAS"    value={`${totalFalta}h`} sub="Ausências sem justificativa" />
          <KpiCard icon={CheckCircle}   color="green"  label="DIAS ÚTEIS"          value="22"              sub={`Dias úteis em ${mesRef}`} />
          <KpiCard icon={Calendar}      color="brand"  label="COLABORADORES"       value={`${PONTO_EMPLOYEES.length}`} sub="Na folha de ponto" />
        </div>

        {/* Tabela de ponto */}
        <Card theme="light" noPadding>
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
            <div className="flex items-center gap-4">
              <button className="text-neutral-400 hover:text-neutral-700">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <CardTitle>{mesRef}</CardTitle>
              <button className="text-neutral-400 hover:text-neutral-700">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Exportar Espelho
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap">Colaborador</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Dias Trabalhados</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">H. Normais</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">H. Extras</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">H. Negativas</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Saldo</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {PONTO_EMPLOYEES.map((emp, i) => {
                  const hNorm = DIAS_UTEIS.length * 8
                  const hExtra = emp.he > 0 ? emp.he : 0
                  const hNeg = emp.he < 0 ? Math.abs(emp.he) : 0
                  const saldo = emp.he
                  return (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                            {emp.initials}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 whitespace-nowrap">{emp.name}</p>
                            <p className="text-xs text-neutral-500">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{emp.dept}</td>
                      <td className="px-4 py-3 text-center text-neutral-700">{DIAS_UTEIS.length}</td>
                      <td className="px-4 py-3 text-center font-mono text-neutral-700">{hNorm}h</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-green-600">
                        {hExtra > 0 ? `+${hExtra}h` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-red-600">
                        {hNeg > 0 ? `-${hNeg}h` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          saldo > 0 ? 'text-green-600' :
                          saldo < 0 ? 'text-red-600' :
                          'text-neutral-500'
                        }`}>
                          {saldo > 0 ? `+${saldo}h` : saldo < 0 ? `${saldo}h` : '0h'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {saldo >= 0
                          ? <Badge variant="success">Regular</Badge>
                          : <Badge variant="warning">Pendência</Badge>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Total da equipe</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-green-600">+{totalHE}h</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-red-600">-{totalFalta}h</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-neutral-700">
                    {totalHE - totalFalta >= 0 ? `+${totalHE - totalFalta}h` : `${totalHE - totalFalta}h`}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-green-500" /> Horas extras (banco de horas)</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-red-400" /> Horas negativas (ausência)</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-neutral-300" /> Sem variação</span>
        </div>

      </div>
    </AppShell>
  )
}
