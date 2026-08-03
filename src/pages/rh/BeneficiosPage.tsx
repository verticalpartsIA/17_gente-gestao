import { useSearchParams, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

// Férias saiu daqui e ganhou tela própria de DP (issue #43) —
// ver src/pages/rh/FeriasAfastamentosPage.tsx. Links antigos continuam
// funcionando via redirect em vez de cair num 404 ou tela errada.
const FERIAS_QUERIES = new Set(['ferias', 'minhas-ferias'])

// gestao/refeicao/transporte/saude prometidos pelo menu ainda não têm tela
// própria — mostram aviso honesto em vez de cair silenciosamente em
// Benefícios Ativos.
const NO_CONTENT_LABEL: Record<string, string> = {
  gestao: 'Gestão de Benefícios',
  refeicao: 'Vale Refeição & Alimentação',
  transporte: 'Vale Transporte',
  saude: 'Plano de Saúde',
}

export default function BeneficiosPage() {
  const [searchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')

  if (urlTab && FERIAS_QUERIES.has(urlTab)) {
    return <Navigate to="/ferias-afastamentos" replace />
  }

  if (urlTab && urlTab in NO_CONTENT_LABEL) {
    return (
      <AppShell navItems={NAV_ITEMS} pageTitle="BENEFÍCIOS">
        <div className="space-y-6">
          <DemoDataBanner />
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-fg2">
                {NO_CONTENT_LABEL[urlTab]} ainda não tem tela própria implementada.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="BENEFÍCIOS">
      <div className="space-y-6">
        <DemoDataBanner />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>BENEFÍCIOS DISPONÍVEIS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-xs text-fg3 font-sans">Nenhum benefício cadastrado ainda — este módulo ainda não está integrado ao banco de dados.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>INFORMAÇÕES DE CUSTOS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-sans text-fg2">
              <p>Sem benefícios cadastrados, não há custo consolidado a exibir ainda.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
