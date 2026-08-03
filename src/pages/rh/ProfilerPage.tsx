import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { DemoDataBanner } from '@/components/ui/DemoDataBanner'
import { NAV_ITEMS } from '../DashboardPage'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { buildOrgForest, allIds, type ProfileRow } from '@/lib/orgTree'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  UserCheck,
  Users,
  HelpCircle,
  FileText,
  Lock
} from 'lucide-react'

// Módulo demonstrativo (issue #57, 17_gente-gestao) — não integrado ao banco.
//
// Identidade, cargo, gestor e escopo de visualização por papel já são reais
// (issue #55 — usam profiles.job_title/department/manager_id via orgTree.ts,
// igual ao Organograma). O que falta pra virar fonte oficial de dados
// comportamentais é só o motor de cálculo em si:
//   - questionário do Profiler persistido (tabela `rh_profiler_respostas` ou
//     equivalente) + motor de cálculo de perfil (Planejador/Executor/
//     Comunicador/Analista).
// Enquanto isso não existir, nenhuma outra tela (dashboard, desempenho,
// retenção, atração, organograma) deve tratar os números daqui como reais —
// ver issue #56 e src/lib/profilerContract.ts.
export default function ProfilerPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'empresa' | 'individual'>('empresa')
  const [rows, setRows] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, name, department, is_department_lead, avatar_url, manager_id, job_title, unit')
        .eq('is_active', true)
      if (!error && data) setRows(data as ProfileRow[])
      setLoading(false)
    }
    load()
  }, [])

  // Escopo de visibilidade por papel — Colaborador só vê o próprio registro,
  // Líder vê a própria equipe (via manager_id, reaproveitando a mesma árvore
  // do Organograma), Administrador vê a empresa toda.
  const { meuNode, gestorNome, equipeIds } = useMemo(() => {
    if (!profile || rows.length === 0) return { meuNode: null, gestorNome: null, equipeIds: new Set<string>() }
    const meuId = profile.id
    const { root } = buildOrgForest(rows)
    function encontrar(node: typeof root): typeof root {
      if (!node) return null
      if (node.id === meuId) return node
      for (const child of node.reports) {
        const achado = encontrar(child)
        if (achado) return achado
      }
      return null
    }
    const meu = encontrar(root)
    const gestor = meu ? rows.find(r => r.id === meu.manager_id)?.name ?? null : null
    const equipe = meu ? allIds(meu) : new Set<string>([profile.id])
    return { meuNode: meu, gestorNome: gestor, equipeIds: equipe }
  }, [profile, rows])

  const escopo: 'proprio' | 'equipe' | 'empresa' =
    profile?.level === 'Administrador' ? 'empresa' : profile?.level === 'Lider' ? 'equipe' : 'proprio'

  const totalNoEscopo = escopo === 'empresa' ? rows.length : escopo === 'equipe' ? equipeIds.size : 1
  const podeVerAbaEmpresa = escopo !== 'proprio'

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="VERTICALPARTS PROFILER — MAPEAMENTO COMPORTAMENTAL">
      <div className="space-y-6">
        <DemoDataBanner />
        
        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1">
          <button
            onClick={() => podeVerAbaEmpresa && setActiveTab('empresa')}
            disabled={!podeVerAbaEmpresa}
            title={podeVerAbaEmpresa ? undefined : 'Disponível apenas para Líderes (equipe) e Administradores (empresa toda).'}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 flex items-center justify-center gap-1.5 ${
              !podeVerAbaEmpresa ? 'border-t-transparent text-fg3/40 cursor-not-allowed' :
              activeTab === 'empresa' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            {!podeVerAbaEmpresa && <Lock className="h-3 w-3" />}
            {escopo === 'equipe' ? 'PERFIL MÉDIO DA EQUIPE' : 'PERFIL MÉDIO DA EMPRESA'}
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-2 text-xs font-bold font-sans tracking-wider uppercase border-t-2 ${
              !podeVerAbaEmpresa || activeTab === 'individual' ? 'border-t-primary bg-surface text-primary' : 'border-t-transparent text-fg3 hover:text-fg-on-dark'
            }`}
          >
            SEU PROFILER INDIVIDUAL
          </button>
        </div>

        {/* TAB: PERFIL MÉDIO DA EMPRESA/EQUIPE — Colaborador nunca vê esta aba (issue #55). */}
        {podeVerAbaEmpresa && activeTab === 'empresa' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <KpiCard
                icon={Users}
                color="brand"
                label={escopo === 'equipe' ? 'PESSOAS NA SUA EQUIPE' : 'COLABORADORES ATIVOS'}
                value={loading ? '...' : String(totalNoEscopo)}
                sub={escopo === 'equipe' ? 'Subordinados diretos e indiretos — dado real' : 'Empresa toda — dado real (profiles)'}
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
                  composição comportamental {escopo === 'equipe' ? 'da sua equipe' : 'da empresa'} aparece aqui assim que existir.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* TAB: PROFILER INDIVIDUAL */}
        {(!podeVerAbaEmpresa || activeTab === 'individual') && (
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

                {/* Identidade real — issue #55 (profiles.job_title/department/manager_id). */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-surface-border pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg3">Cargo</p>
                    <p className="text-sm text-fg2">{meuNode?.job_title || 'Cargo ainda não cadastrado'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg3">Departamento</p>
                    <p className="text-sm text-fg2">{meuNode?.department || profile?.department || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg3">Gestor direto</p>
                    <p className="text-sm text-fg2">{gestorNome || 'Sem gestor cadastrado (raiz do organograma)'}</p>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-4">
                  <p className="text-xs text-fg2">
                    Você ainda não respondeu ao Profiler comportamental — a ficha de inteligência comportamental
                    (energia de trabalho, flexibilidade, perfil predominante) aparece aqui depois da primeira resposta.
                    O questionário e o motor de cálculo ainda não estão implementados.
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
