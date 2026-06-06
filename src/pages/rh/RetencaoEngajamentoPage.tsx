import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  Smile, 
  ThumbsUp, 
  CheckCircle
} from 'lucide-react'

interface FeedbackItem {
  id: string
  from: string
  to: string
  badge: string
  message: string
  date: string
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  { id: 'fb-1', from: 'Carlos Oliveira (Supervisor)', to: 'Marcos Pontes (Auxiliar)', badge: 'Trabalho em Equipe', message: 'Marcos demonstrou muita proatividade e engajamento na manutenção preventiva da frota de empilhadeiras esta semana.', date: '04/06/2026' },
  { id: 'fb-2', from: 'Mariana Nogueira (Analista)', to: 'Juliana Silva (Gestora)', badge: 'Foco em Resultados', message: 'Juliana deu um excelente suporte no onboarding dos novos admitidos do DP, garantindo que toda documentação entrasse limpa no sistema.', date: '02/06/2026' },
  { id: 'fb-3', from: 'Arthur Souza (Engenharia)', to: 'José Costa (Montagem)', badge: 'Segurança e SSMA', message: 'José chamou a atenção sobre a conformidade no uso dos EPIs de altura na montagem do galpão, garantindo segurança total da equipe.', date: '30/05/2026' }
]

export default function RetencaoEngajamentoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'clima'
  const [activeTab, setActiveTab] = useState<string>(tabParam)

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const feedbacks = INITIAL_FEEDBACKS

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="RETENÇÃO & ENGAJAMENTO (CLIMA & ENPS)">
      <div className="space-y-6">
        
        {/* TABS CONTROLS */}
        <div className="flex border-b border-surface-border bg-surface-card p-1 overflow-x-auto gap-1">
          <button
            onClick={() => handleTabChange('clima')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'clima' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Pesquisas de Clima
          </button>
          <button
            onClick={() => handleTabChange('enps')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'enps' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Termômetro eNPS
          </button>
          <button
            onClick={() => handleTabChange('feedbacks')}
            className={`py-2 px-4 text-[11px] font-bold font-sans tracking-wider uppercase border-t-2 shrink-0 transition-all ${
              activeTab === 'feedbacks' 
                ? 'border-t-primary bg-surface text-primary' 
                : 'border-t-transparent text-slate-400 hover:text-white'
            }`}
          >
            Feedbacks Coletivos
          </button>
        </div>

        {/* --- TAB: CLIMA ORGANIZACIONAL --- */}
        {activeTab === 'clima' && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Smile}
                color="brand"
                label="ÍNDICE DE SATISFAÇÃO"
                value="4.2 / 5.0"
                sub="Média geral de engajamento"
              />
              <KpiCard
                icon={ThumbsUp}
                color="green"
                label="TAXA DE RESPOSTA CLIMA"
                value="85.4%"
                sub="Forte engajamento nas pesquisas"
              />
              <KpiCard
                icon={CheckCircle}
                color="blue"
                label="PESQUISAS CONCLUÍDAS"
                value="4 Realizadas"
                sub="Ciclo histórico anual"
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>PESQUISAS DE CLIMA ORGANIZACIONAL</CardTitle>
                <Button size="sm">CRIAR PESQUISA</Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border">
                <div className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">Pesquisa de Clima Semestral 2026 - 1º Ciclo</h4>
                    <p className="text-[10px] text-fg3 font-mono mt-0.5">FINALIZA EM: 30/06/2026 | PARTICIPANTES: 121 RESPONDIDOS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">EM ANDAMENTO</Badge>
                    <Button size="sm" variant="outline">ACOMPANHAR</Button>
                  </div>
                </div>

                <div className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">Pesquisa Rápida: Home Office vs. Híbrido</h4>
                    <p className="text-[10px] text-fg3 font-mono mt-0.5">FINALIZADA EM: 15/04/2026 | PARTICIPANTES: 142 RESPONDIDOS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">FINALIZADA</Badge>
                    <Button size="sm" variant="outline">VER RESULTADOS</Button>
                  </div>
                </div>

                <div className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-fg-on-dark uppercase text-xs">Diagnóstico de Integração de Novos Colaboradores</h4>
                    <p className="text-[10px] text-fg3 font-mono mt-0.5">MÉTRICA CONTÍNUA | AVALIAÇÃO COM 30 DIAS DE CASA</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="collaborator">RECORRENTE</Badge>
                    <Button size="sm" variant="outline">CONFIGURAR</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* --- TAB: TERMÔMETRO ENPS --- */}
        {activeTab === 'enps' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1 bg-surface-card border border-surface-border text-center py-8 flex flex-col justify-center items-center">
                <p className="text-xs font-mono font-bold text-fg3 uppercase tracking-wider">SCORE ENPS DO TIMECORPORATIVO</p>
                <p className="text-7xl font-display font-black text-primary my-4 font-sans">+62</p>
                <Badge variant="success">ZONA DE QUALIDADE</Badge>
                <p className="text-[10px] text-fg3 font-mono mt-4">Último cálculo em: 01/06/2026</p>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>SEGMENTAÇÃO DE PROMOTORES & DETRATORES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold text-success">
                      <span>PROMOTORES (Nota 9 e 10)</span>
                      <span>70.0% (99 Colaboradores)</span>
                    </div>
                    <div className="bg-surface-elevated h-3 border border-surface-border">
                      <div className="bg-green-600 h-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold text-fg2">
                      <span>NEUTROS (Nota 7 e 8)</span>
                      <span>22.0% (31 Colaboradores)</span>
                    </div>
                    <div className="bg-surface-elevated h-3 border border-surface-border">
                      <div className="bg-slate-500 h-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold text-danger">
                      <span>DETRATORES (Nota 0 a 6)</span>
                      <span>8.0% (12 Colaboradores)</span>
                    </div>
                    <div className="bg-surface-elevated h-3 border border-surface-border">
                      <div className="bg-red/80 h-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 border border-surface-border bg-surface-card font-sans text-xs text-fg2 mt-4">
                    <p className="font-bold text-fg-on-dark mb-1">Métricas Gerais de Retenção:</p>
                    <p>O score eNPS de **+62** aponta um alto grau de satisfação e engajamento da equipe VerticalParts com os processos internos. A maior parte das reclamações nos detratores diz respeito a tempo de espera no reembolso de despesas da frota, já em fase de automação.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* --- TAB: FEEDBACKS COLETIVOS --- */}
        {activeTab === 'feedbacks' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4">
                <CardTitle>MURAL DE RECONHECIMENTOS & FEEDBACKS</CardTitle>
                <Button size="sm">ENVIAR ELOGIO</Button>
              </CardHeader>
              <CardContent className="divide-y divide-surface-border font-sans">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="py-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="admin">{fb.badge.toUpperCase()}</Badge>
                        <span className="text-fg3 font-mono text-[10px]">{fb.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-fg2 italic">"{fb.message}"</p>
                    <p className="text-[10px] text-fg3 font-mono">
                      DE: <span className="font-bold text-fg-on-dark uppercase">{fb.from}</span> → PARA: <span className="font-bold text-fg-on-dark uppercase">{fb.to}</span>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Badges da VerticalParts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3 border border-surface-border bg-surface-card flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">🤝</div>
                  <div>
                    <h5 className="font-bold text-fg-on-dark">TRABALHO EM EQUIPE</h5>
                    <p className="text-[10px] text-fg3">Por ajudar os colegas e compartilhar conhecimento.</p>
                  </div>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">🎯</div>
                  <div>
                    <h5 className="font-bold text-fg-on-dark">FOCO EM RESULTADOS</h5>
                    <p className="text-[10px] text-fg3">Por atingir metas e otimizar processos de forma excelente.</p>
                  </div>
                </div>

                <div className="p-3 border border-surface-border bg-surface-card flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">🛡️</div>
                  <div>
                    <h5 className="font-bold text-fg-on-dark">SEGURANÇA E SSMA</h5>
                    <p className="text-[10px] text-fg3">Por zelar pelas normas regulamentadoras e EPIs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  )
}
