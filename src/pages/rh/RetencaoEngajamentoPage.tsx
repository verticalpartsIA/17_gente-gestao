import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { useAuth } from '@/lib/auth'
import { getProfilerResumo, type ProfilerResumo } from '@/lib/profilerContract'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Heart,
  Users,
  ThumbsUp,
  ThumbsDown,
  Plus
} from 'lucide-react'

// ── Page ─────────────────────────────────────────────────────────────────────

const TAB_BY_QUERY: Record<string, number> = { enps: 0, clima: 1, feedbacks: 2 }

export default function RetencaoEngajamentoPage() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [profiler, setProfiler] = useState<ProfilerResumo | null>(null)

  useEffect(() => {
    const q = searchParams.get('tab')
    if (q && q in TAB_BY_QUERY) setActiveTab(TAB_BY_QUERY[q])
  }, [searchParams])

  // Cruzamento com perfil comportamental do Profiler — issue #56. Ainda
  // 'nao_implementado' (ver src/lib/profilerContract.ts) até o Profiler ter
  // motor de cálculo de verdade.
  useEffect(() => {
    if (profile) getProfilerResumo(profile.id).then(setProfiler)
  }, [profile])

  const TABS = ['eNPS', 'Pesquisa de Clima', 'Feedbacks 360°']

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="RETENÇÃO E ENGAJAMENTO">
      <div className="space-y-6">
        <DemoDataBanner />

        {profiler && (
          <p className="text-xs italic text-neutral-500">
            Cruzamento com perfil comportamental (Profiler): {profiler.statusProfiler === 'nao_implementado'
              ? 'ainda não disponível — motor de cálculo do Profiler não implementado.'
              : profiler.perfilPredominante}
          </p>
        )}

        {/* KPI Cards — nenhuma pesquisa/eNPS foi aplicada ainda */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Heart}     color="brand"  label="ENPS"            value="—"  sub="Nenhuma pesquisa aplicada" />
          <KpiCard icon={Users}     color="blue"   label="RESPONDENTES"    value="0"  sub="De 0 pesquisas enviadas" />
          <KpiCard icon={ThumbsUp}  color="green"  label="PROMOTORES"      value="0"  sub="Módulo ainda não integrado" />
          <KpiCard icon={ThumbsDown}color="red"    label="DETRATORES"      value="0"  sub="Módulo ainda não integrado" />
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

        {/* Tab 0 — eNPS */}
        {activeTab === 0 && (
          <Card theme="light">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle>Score eNPS</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-neutral-500">
                Nenhuma pesquisa de eNPS foi enviada ainda — score, evolução mensal e comentários anônimos
                aparecem aqui depois da primeira rodada. Este módulo ainda não está integrado ao banco de dados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 — Pesquisa de Clima */}
        {activeTab === 1 && (
          <Card theme="light">
            <CardHeader className="border-b border-neutral-200 pb-4">
              <CardTitle>Pesquisa de Clima Organizacional</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-neutral-500">
                Nenhuma pesquisa de clima foi aplicada ainda — resultados por dimensão (infraestrutura,
                liderança, cultura etc.) aparecem aqui depois da primeira rodada. Este módulo ainda não está
                integrado ao banco de dados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tab 2 — Feedbacks 360° */}
        {activeTab === 2 && (
          <Card theme="light" noPadding>
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
              <CardTitle>Feedbacks 360° — Registros Recentes</CardTitle>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => alert('Registro de feedback ainda não está conectado ao banco de dados.')}
              >
                Novo Feedback
              </Button>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-neutral-500">Nenhum feedback registrado ainda.</p>
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  )
}
