import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  FileCheck, 
  DollarSign, 
  TrendingUp, 
  Download
} from 'lucide-react'

export default function HoleritesPage() {
  const [signedCount, setSignedCount] = useState(2)

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="DEPARTAMENTO PESSOAL — FOLHA & HOLERITES">
      <div className="space-y-6">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KpiCard
            icon={DollarSign}
            color="brand"
            label="VALOR TOTAL DA FOLHA"
            value="R$ 37.500,00"
            sub="Referente a Maio/2026"
          />
          <KpiCard
            icon={TrendingUp}
            color="green"
            label="ENCARGOS E IMPOSTOS"
            value="R$ 11.250,00"
            sub="INSS, FGTS, IRRF providos"
          />
          <KpiCard
            icon={FileCheck}
            color="blue"
            label="HOLERITES ASSINADOS"
            value={`${signedCount} / 3`}
            sub="Carlos Oliveira pendente"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* FECHAMENTO DE FOLHA */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-surface-border pb-4">
              <CardTitle>FECHAMENTO DE FOLHA MENSAL (MAIO / 2026)</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-surface-border">
              
              <div className="py-4 flex justify-between items-center text-xs font-sans">
                <div>
                  <h4 className="font-bold text-fg-on-dark uppercase">Juliana Silva (Gestora RH)</h4>
                  <p className="text-fg3 font-mono">CLT | Salário: R$ 8.500,00 | Encargos: R$ 2.550,00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">ASSINADO DIGITALMENTE</Badge>
                  <Button size="sm" variant="outline" rightIcon={<Download className="h-3.5 w-3.5" />}>PDF</Button>
                </div>
              </div>

              <div className="py-4 flex justify-between items-center text-xs font-sans">
                <div>
                  <h4 className="font-bold text-fg-on-dark uppercase">Karla Souza (Líder Engenharia)</h4>
                  <p className="text-fg3 font-mono">CLT | Salário: R$ 10.200,00 | Encargos: R$ 3.060,00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">ASSINADO DIGITALMENTE</Badge>
                  <Button size="sm" variant="outline" rightIcon={<Download className="h-3.5 w-3.5" />}>PDF</Button>
                </div>
              </div>

              <div className="py-4 flex justify-between items-center text-xs font-sans">
                <div>
                  <h4 className="font-bold text-fg-on-dark uppercase">Carlos Oliveira (Motorista)</h4>
                  <p className="text-fg3 font-mono">CLT | Salário: R$ 3.800,00 | Encargos: R$ 1.140,00</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">AGUARDANDO ASSINATURA</Badge>
                  <Button size="sm" variant="outline" rightIcon={<Download className="h-3.5 w-3.5" />}>PDF</Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* ACÕES DE FECHAMENTO */}
          <Card>
            <CardHeader>
              <CardTitle>OPERACIONAL DO DP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-sans">
              <p className="text-fg2">
                O fechamento da folha e geração de lotes bancários (SISPAG) é realizado automaticamente após a aprovação de todos os espelhos de ponto no dia 30 de cada mês.
              </p>
              <Button className="w-full" onClick={() => setSignedCount(3)}>
                NOTIFICAR ASSINATURAS PENDENTES
              </Button>
              <div className="w-full h-0.5 bg-surface-border my-2"></div>
              <p className="text-[10px] text-fg3 font-mono">
                Validação de arquivo bancário: CNAB 240 / Lote Fechamento Integrado.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  )
}
