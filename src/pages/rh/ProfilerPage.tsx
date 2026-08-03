import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  UserCheck,
  Users,
  HelpCircle,
  FileText
} from 'lucide-react'

// Módulo demonstrativo (issue #57, 17_gente-gestao) — não integrado ao banco.
//
// Para virar fonte oficial de dados comportamentais este contrato mínimo
// precisa existir antes de qualquer ação rápida ser reativada:
//   - questionário do Profiler persistido (tabela `rh_profiler_respostas` ou
//     equivalente) + motor de cálculo de perfil (Planejador/Executor/
//     Comunicador/Analista);
//   - herança de dados reais de /colaboradores, /organograma e
//     /gestao-talentos?tab=cargos (issue #55);
//   - permissão de visualização por papel (próprio perfil / equipe / RH-Admin).
// Enquanto isso não existir, nenhuma outra tela (dashboard, desempenho,
// retenção, atração, organograma) deve tratar os números daqui como reais —
// ver issue #56.
export default function ProfilerPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'empresa' | 'individual'>('empresa')
  const [activeCount, setActiveCount] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { count } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      setActiveCount(count ?? 0)
    }
    load()
  }, [])

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="VERTICALPARTS PROFILER — MAPEAMENTO COMPORTAMENTAL">
      <div className="space-y-6">
        <DemoDataBanner />
        
        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'empresa' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            PERFIL MÉDIO DA EMPRESA
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              activeTab === 'individual' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            SEU PROFILER INDIVIDUAL
          </button>
        </div>

        {/* TAB: PERFIL MÉDIO DA EMPRESA */}
        {activeTab === 'empresa' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <KpiCard
                icon={Users}
                color="brand"
                label="COLABORADORES ATIVOS"
                value={activeCount === null ? '...' : String(activeCount)}
                sub="Dado real (profiles)"
              />
              <KpiCard
                icon={UserCheck}
                color="green"
                label="PROFILERS RESPONDIDOS"
                value="0"
                sub="Questionário ainda não implementado"
              />
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-fg2">
                  Nenhum colaborador respondeu ao Profiler comportamental ainda — o questionário e o motor de
                  cálculo de perfil (Planejador/Executor/Comunicador/Analista) não estão implementados. A
                  composição comportamental da equipe aparece aqui assim que existir.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* TAB: PROFILER INDIVIDUAL */}
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-surface-border pb-4">
                <CardTitle>SUA FICHA DE INTELIGÊNCIA COMPORTAMENTAL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/30">
                    <UserCheck className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-fg-on-dark uppercase">{profile?.name || 'COLABORADOR'}</h3>
                    <p className="text-xs text-fg3 font-mono">NENHUM PROFILER RESPONDIDO AINDA</p>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-4">
                  <p className="text-xs text-fg2">
                    Você ainda não respondeu ao Profiler comportamental — a ficha de inteligência comportamental
                    (energia de trabalho, flexibilidade, perfil predominante) aparece aqui depois da primeira resposta.
                    Este módulo ainda não está integrado ao banco de dados.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AÇÕES RÁPIDAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  disabled
                  title="Indisponível: questionário e motor de cálculo do Profiler ainda não foram implementados."
                >
                  RESPONDER PROFILER NOVAMENTE →
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  rightIcon={<FileText className="h-4 w-4" />}
                  disabled
                  title="Indisponível: exportação de laudo em PDF ainda não foi implementada."
                >
                  EXPORTAR LAUDO PDF
                </Button>
                <p className="text-[11px] text-fg3 text-center">
                  Ações desabilitadas até o módulo ser integrado ao banco de dados.
                </p>
                <div className="p-3 bg-surface-card border border-surface-border text-center text-xs text-fg3">
                  <HelpCircle className="h-5 w-5 text-primary mx-auto mb-1" />
                  <span>O profiler é recomendado a ser respondido a cada 12 meses.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
