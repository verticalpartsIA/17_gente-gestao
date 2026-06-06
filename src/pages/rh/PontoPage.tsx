import { useState, useEffect } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  Clock, 
  Calendar, 
  FileCheck, 
  Download, 
  MapPin
} from 'lucide-react'

interface TimeRecord {
  date: string
  in1: string
  out1: string
  in2: string
  out2: string
  total: string
  status: 'Aprovado' | 'Pendente' | 'Ajustado'
}

const MONTHLY_RECORDS: TimeRecord[] = [
  { date: '2026-06-01', in1: '08:02', out1: '12:00', in2: '13:00', out2: '18:05', total: '09h 03m', status: 'Aprovado' },
  { date: '2026-06-02', in1: '07:58', out1: '12:05', in2: '13:01', out2: '18:00', total: '09h 08m', status: 'Aprovado' },
  { date: '2026-06-03', in1: '08:00', out1: '12:00', in2: '13:00', out2: '18:00', total: '09h 00m', status: 'Aprovado' },
  { date: '2026-06-04', in1: '08:05', out1: '12:02', in2: '13:00', out2: '19:15', total: '10h 12m', status: 'Aprovado' },
  { date: '2026-06-05', in1: '07:55', out1: '12:00', in2: '13:00', out2: '18:10', total: '09h 15m', status: 'Pendente' }
]

export default function PontoPage() {
  const [time, setTime] = useState(new Date())
  const [todayRecords, setTodayRecords] = useState<string[]>([])
  const [signedHolerite, setSignedHolerite] = useState(false)
  const [holeriteSignModal, setHoleriteSignModal] = useState(false)

  // Atualiza relógio
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockIn = () => {
    const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setTodayRecords([...todayRecords, timeStr])
  }

  const formatTime = (t: Date) => {
    return t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDate = (t: Date) => {
    return t.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getPunchLabel = (index: number) => {
    if (index === 0) return 'Entrada'
    if (index === 1) return 'Saída Almoço'
    if (index === 2) return 'Retorno Almoço'
    if (index === 3) return 'Saída'
    return `Marcação ${index + 1}`
  }

  const handleSignHolerite = () => {
    setSignedHolerite(true)
    setHoleriteSignModal(false)
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="PONTO E BANCO DE HORAS">
      <div className="space-y-6">
        
        {/* BANCO DE HORAS SUMMARY */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KpiCard
            icon={Clock}
            color="green"
            label="SALDO BANCO DE HORAS"
            value="+14h 30m"
            sub="Prazo de compensação: 6 meses"
          />
          <KpiCard
            icon={Calendar}
            color="brand"
            label="JORNADA CONTRATUAL"
            value="220h"
            sub="Segunda a Sexta (08:00 - 18:00)"
          />
          <KpiCard
            icon={FileCheck}
            color="blue"
            label="HOLERITE ATUAL"
            value={signedHolerite ? "Assinado" : "Assinatura Pendente"}
            sub="Referente a Maio/2026"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* REGISTRO DE PONTO EM TEMPO REAL */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>REGISTRO ELETRÔNICO DE PONTO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center bg-surface-card p-6 border border-surface-border">
                <p className="text-3xl font-mono tracking-widest text-primary font-bold">{formatTime(time)}</p>
                <p className="text-xs text-fg3 font-mono mt-2 uppercase">{formatDate(time)}</p>
              </div>

              <div className="flex flex-col gap-2 bg-surface-elevated p-3 border border-surface-border">
                <span className="text-[10px] font-bold text-fg3 tracking-wider">MARCAÇÕES DE HOJE</span>
                {todayRecords.length === 0 ? (
                  <span className="text-xs text-fg3 italic">Nenhuma marcação realizada hoje.</span>
                ) : (
                  <div className="space-y-2">
                    {todayRecords.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-fg2 font-mono uppercase">{getPunchLabel(i)}</span>
                        <span className="font-bold text-fg-on-dark font-mono bg-surface-card px-2 py-0.5 border border-surface-border">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleClockIn}>
                  REGISTRAR PONTO →
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-fg3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Localização detectada: Matriz - São Paulo</span>
              </div>
            </CardContent>
          </Card>

          {/* HOLERITE E COMPROVANTES */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
              <CardTitle>HOLERITES E RECIBOS DIGITAIS</CardTitle>
              <Badge variant={signedHolerite ? "success" : "warning"}>
                {signedHolerite ? "CONCLUÍDO" : "PENDENTE ASSINATURA"}
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-fg-on-dark uppercase">HOLERITE DE MAIO / 2026</h4>
                  <p className="text-xs text-fg3 font-mono">Disponibilizado em: 30/05/2026 | Expira em: 15/06/2026</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" rightIcon={<Download className="h-4 w-4" />}>
                    PDF
                  </Button>
                  {!signedHolerite ? (
                    <Button size="sm" onClick={() => setHoleriteSignModal(true)}>
                      ASSINAR RECIBO →
                    </Button>
                  ) : (
                    <Badge variant="success">ASSINADO EM 05/06/2026</Badge>
                  )}
                </div>
              </div>

              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-fg-on-dark uppercase">HOLERITE DE ABRIL / 2026</h4>
                  <p className="text-xs text-fg3 font-mono">Disponibilizado em: 30/04/2026</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" rightIcon={<Download className="h-4 w-4" />}>
                    PDF
                  </Button>
                  <Badge variant="success">ASSINADO EM 30/04/2026</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESPELHO DE PONTO MENSAL */}
        <Card>
          <CardHeader className="border-b border-surface-border pb-4">
            <CardTitle>ESPELHO DE PONTO MENSAL (JUNHO / 2026)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated text-[11px] font-bold text-fg-on-dark tracking-wider border-b border-surface-border uppercase font-mono">
                  <th className="p-3">DATA</th>
                  <th className="p-3">ENTRADA 1</th>
                  <th className="p-3">SAÍDA 1</th>
                  <th className="p-3">ENTRADA 2</th>
                  <th className="p-3">SAÍDA 2</th>
                  <th className="p-3">TOTAL TRABALHADO</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-sm font-mono">
                {MONTHLY_RECORDS.map(rec => (
                  <tr key={rec.date} className="hover:bg-surface-card/30">
                    <td className="p-3 text-fg-on-dark">{rec.date}</td>
                    <td className="p-3 text-fg2">{rec.in1}</td>
                    <td className="p-3 text-fg2">{rec.out1}</td>
                    <td className="p-3 text-fg2">{rec.in2}</td>
                    <td className="p-3 text-fg2">{rec.out2}</td>
                    <td className="p-3 font-semibold text-fg-on-dark">{rec.total}</td>
                    <td className="p-3">
                      <Badge variant={rec.status === 'Aprovado' ? 'success' : 'warning'}>
                        {rec.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* MODAL DE ASSINATURA DE HOLERITE */}
        {holeriteSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-surface border border-surface-border p-6 shadow-dark">
              <h3 className="text-lg font-display font-bold text-primary tracking-wider border-b border-surface-border pb-3 mb-4">
                ASSINATURA DIGITAL DE HOLERITE
              </h3>
              
              <div className="space-y-4 text-sm">
                <p className="text-fg2">
                  Ao assinar este documento, você declara que está de acordo com os valores de vencimento e descontos listados no demonstrativo de pagamento referente ao mês de **Maio de 2026**.
                </p>
                
                <div className="bg-surface-card p-3 border border-surface-border space-y-2 font-mono text-xs">
                  <div className="flex justify-between"><span>SALÁRIO BASE:</span><span className="font-bold text-fg-on-dark">R$ 3.800,00</span></div>
                  <div className="flex justify-between text-green-600"><span>VENCIMENTOS:</span><span className="font-bold">R$ 3.800,00</span></div>
                  <div className="flex justify-between text-danger"><span>DESCONTOS (INSS/IR):</span><span className="font-bold">R$ 412,50</span></div>
                  <div className="flex justify-between border-t border-surface-border pt-1 font-bold text-fg-on-dark"><span>LÍQUIDO A RECEBER:</span><span>R$ 3.387,50</span></div>
                </div>

                <div className="bg-surface-card p-3 border border-surface-border text-xs text-fg3 space-y-1">
                  <p>IP: 189.120.33.4</p>
                  <p>Data: 05/06/2026 - 16:23:58</p>
                  <p>Assinatura Eletrônica em conformidade com MP 2.200-2/2001 (ICP-Brasil)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-surface-border pt-4 mt-6">
                <Button variant="outline" onClick={() => setHoleriteSignModal(false)}>
                  CANCELAR
                </Button>
                <Button onClick={handleSignHolerite}>
                  ASSINAR AGORA →
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
