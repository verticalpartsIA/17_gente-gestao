import { useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { NAV_ITEMS } from '../DashboardPage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { 
  UserCheck, 
  Users, 
  Clock, 
  TrendingUp, 
  HelpCircle,
  FileText
} from 'lucide-react'

export default function ProfilerPage() {
  const [activeTab, setActiveTab] = useState<'empresa' | 'individual'>('empresa')

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="VERTICALPARTS PROFILER — MAPEAMENTO COMPORTAMENTAL">
      <div className="space-y-6">
        
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard
                icon={Users}
                color="brand"
                label="COLABORADORES MAPEADOS"
                value="47 / 47"
                sub="100% de adesão corporativa"
              />
              <KpiCard
                icon={Clock}
                color="green"
                label="TEMPO MÉDIO DE PERMANÊNCIA"
                value="832.8 Dias"
                sub="Alto índice de retenção"
              />
              <KpiCard
                icon={TrendingUp}
                color="blue"
                label="PERFIL MÉDIO CORPORATIVO"
                value="PEC"
                sub="Planejador · Executor · Comunicador"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>COMPOSIÇÃO COMPORTAMENTAL DA EQUIPE</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-primary">PLANEJADOR (P)</span>
                        <span>26.45%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-elevated h-3">
                          <div className="bg-primary h-full" style={{ width: '26.45%' }}></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-fg3 font-sans mt-1">Perfil focado em ritmo constante, estabilidade, processos claros e temperamento calmo.</p>
                    </div>

                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-danger">EXECUTOR (E)</span>
                        <span>25.69%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-elevated h-3">
                          <div className="bg-red/80 h-full" style={{ width: '25.69%' }}></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-fg3 font-sans mt-1">Perfil focado em resultados rápidos, competitividade, desafios práticos e liderança ativa.</p>
                    </div>

                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-purple-600">COMUNICADOR (C)</span>
                        <span>25.35%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-elevated h-3">
                          <div className="bg-purple-600/80 h-full" style={{ width: '25.35%' }}></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-fg3 font-sans mt-1">Perfil focado em conexões interpessoais, oratória, carisma, influência e trabalho colaborativo.</p>
                    </div>

                    <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-blue-500">ANALISTA (A)</span>
                        <span>22.51%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-elevated h-3">
                          <div className="bg-blue-500/80 h-full" style={{ width: '22.51%' }}></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-fg3 font-sans mt-1">Perfil focado em conformidade, precisão técnica, atenção extrema a detalhes e qualidade rigorosa.</p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>INSIGHTS DO GESTOR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs font-sans text-fg2">
                  <p>
                    A equipe da **VerticalParts** possui uma distribuição muito equilibrada dos quatro perfis básicos, com leve predominância do perfil **Planejador (P)** e do **Executor (E)**.
                  </p>
                  <p>
                    Essa combinação (PEC) é ideal para empresas industriais e automotivas, onde a segurança e a precisão do planejamento técnico precisam estar perfeitamente integradas à agilidade operacional e eficiência comercial.
                  </p>
                  <div className="p-3 bg-surface-card border border-surface-border font-mono text-[10px] text-fg3">
                    <p className="font-bold text-fg-on-dark mb-1">RECOMENDAÇÃO DE CONTRATAÇÃO:</p>
                    <p>Focar novas admissões de engenharia em perfis dominantes em Analista (A) para manter o rigor de qualidade das peças da frota.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    <h3 className="text-xl font-display font-bold text-fg-on-dark uppercase">JULIANA SILVA (GESTORA)</h3>
                    <p className="text-xs text-fg3 font-mono">ÚLTIMO PROFILER RESPONDIDO EM: 15/01/2026</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="admin">PERFIL PRINCIPAL: PLANEJADOR / COMUNICADOR</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                    <span className="text-[10px] text-fg3 font-mono">ENERGIA DE TRABALHO</span>
                    <p className="text-lg font-bold font-mono text-fg-on-dark">78%</p>
                    <p className="text-[9px] text-fg3">Capacidade produtiva sustentada.</p>
                  </div>
                  <div className="p-3 bg-surface-card border border-surface-border space-y-1">
                    <span className="text-[10px] text-fg3 font-mono">ÍNDICE DE FLEXIBILIDADE</span>
                    <p className="text-lg font-bold font-mono text-fg-on-dark">Alta</p>
                    <p className="text-[9px] text-fg3">Adaptabilidade a novos fluxos de DP.</p>
                  </div>
                </div>

                <div className="border-t border-surface-border pt-4 space-y-4">
                  <h4 className="font-bold text-xs text-fg-on-dark uppercase">DESCRIÇÃO DO SEU PERFIL</h4>
                  <p className="text-xs text-fg2">
                    Juliana apresenta perfil colaborativo e processual. Facilidade em lidar com tarefas de planejamento, documentações minuciosas de departamento pessoal e liderança com escuta ativa. Busca manter o clima do ambiente ameno enquanto orienta as regras e regulamentos de conformidade da empresa.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AÇÕES RÁPIDAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  RESPONDER PROFILER NOVAMENTE →
                </Button>
                <Button variant="outline" className="w-full" rightIcon={<FileText className="h-4 w-4" />}>
                  EXPORTAR LAUDO PDF
                </Button>
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
