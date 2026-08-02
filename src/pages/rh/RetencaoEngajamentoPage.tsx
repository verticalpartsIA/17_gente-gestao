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
  Heart,
  Users,
  ThumbsUp,
  ThumbsDown,
  Plus
} from 'lucide-react'

// ── Data from HTML prototype ──────────────────────────────────────────────────

const ENPS_EVOLUCAO = [
  { mes: 'Jan', valor: 28 },
  { mes: 'Fev', valor: 31 },
  { mes: 'Mar', valor: 35 },
  { mes: 'Abr', valor: 38 },
  { mes: 'Mai', valor: 40 },
  { mes: 'Jun', valor: 42 },
]

const ENPS_COMENTARIOS = [
  { autor: 'Colaborador Anônimo', texto: 'A empresa tem crescido muito e as oportunidades de desenvolvimento aumentaram bastante nos últimos meses.', tipo: 'positivo' },
  { autor: 'Colaborador Anônimo', texto: 'Gostaria que houvesse mais flexibilidade de horários. O ambiente é ótimo, mas a rigidez nos horários é desafiadora.', tipo: 'neutro' },
  { autor: 'Colaborador Anônimo', texto: 'A liderança direta é excelente, mas sinto falta de mais comunicação vinda da alta gestão sobre os rumos da empresa.', tipo: 'neutro' },
  { autor: 'Colaborador Anônimo', texto: 'Minha remuneração está abaixo do mercado para a minha função. Isso me preocupa e está me fazendo avaliar outras oportunidades.', tipo: 'negativo' },
]

const CLIMA_DIMENSOES = [
  { dimensao: 'Infraestrutura',        empresa: 88, mercado: 75 },
  { dimensao: 'Liderança',             empresa: 87, mercado: 70 },
  { dimensao: 'Cultura',               empresa: 82, mercado: 72 },
  { dimensao: 'Equilíbrio Vida/Trab.', empresa: 78, mercado: 68 },
  { dimensao: 'Crescimento',           empresa: 71, mercado: 65 },
  { dimensao: 'Comunicação',           empresa: 74, mercado: 67 },
  { dimensao: 'Remuneração',           empresa: 65, mercado: 60 },
]

const FEEDBACKS = [
  { de: 'Carlos Mendes',   para: 'Ana Paula Rocha',  tipo: 'Positivo',    msg: 'Excelente liderança na apresentação para o cliente XYZ. Sua preparação e confiança foram fundamentais para fecharmos o contrato.' },
  { de: 'Gelson Simões',   para: 'Mariana Costa',    tipo: 'Positivo',    msg: 'Parabéns pela entrega do projeto de consultoria dentro do prazo e com qualidade acima da esperada. Continue assim!' },
  { de: 'Mariana Costa',   para: 'Felipe Santos',    tipo: 'Construtivo', msg: 'Para o próximo trimestre, sugiro que você foque em melhorar a comunicação proativa sobre os status das entregas de logística.' },
  { de: 'Roberto Faria',   para: 'Beatriz Nunes',    tipo: 'Positivo',    msg: 'Sua adaptação ao sistema financeiro foi muito rápida. Obrigado pelo empenho nas primeiras semanas de trabalho.' },
  { de: 'Ana Paula Rocha', para: 'Bruno Almeida',    tipo: 'Construtivo', msg: 'Você tem muito potencial! Minha sugestão é investir mais em prospecção ativa. Posso te ajudar a estruturar um funil de vendas.' },
  { de: 'Felipe Santos',   para: 'João Figueiredo',  tipo: 'Positivo',    msg: 'Ótima integração na equipe de logística! Sua organização nas rotas de entrega já está gerando ganhos de tempo perceptíveis.' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

const TAB_BY_QUERY: Record<string, number> = { enps: 0, clima: 1, feedbacks: 2 }

export default function RetencaoEngajamentoPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const q = searchParams.get('tab')
    if (q && q in TAB_BY_QUERY) setActiveTab(TAB_BY_QUERY[q])
  }, [searchParams])

  const TABS = ['eNPS', 'Pesquisa de Clima', 'Feedbacks 360°']

  return (
    <AppShell navItems={NAV_ITEMS} pageTitle="RETENÇÃO E ENGAJAMENTO">
      <div className="space-y-6">
        <DemoDataBanner />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Heart}     color="brand"  label="ENPS"            value="42"  sub='Categoria "Bom" (≥ 40)' />
          <KpiCard icon={Users}     color="blue"   label="RESPONDENTES"    value="20"  sub="De 22 colaboradores" />
          <KpiCard icon={ThumbsUp}  color="green"  label="PROMOTORES"      value="11"  sub="Nota 9–10 na pesquisa" />
          <KpiCard icon={ThumbsDown}color="red"    label="DETRATORES"      value="3"   sub="Nota 0–6 na pesquisa" />
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Score + barra */}
            <Card theme="light" className="lg:col-span-1">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle>Score eNPS — Junho 2026</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-6">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-5xl font-black text-black">
                    42
                  </div>
                  <p className="mt-3 text-sm font-bold text-neutral-700">Categoria: <span className="text-green-600">BOM</span></p>
                  <p className="mt-1 text-xs text-neutral-500">Referência: acima de 40 = Bom</p>
                </div>

                {/* Barra de distribuição */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-right font-bold text-green-600">11 Prom.</span>
                    <div className="flex-1 h-4 rounded bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-green-500 rounded" style={{ width: '55%' }} />
                    </div>
                    <span className="text-neutral-500">55%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-right font-bold text-neutral-500">6 Neutros</span>
                    <div className="flex-1 h-4 rounded bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-neutral-300 rounded" style={{ width: '30%' }} />
                    </div>
                    <span className="text-neutral-500">30%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-right font-bold text-red-600">3 Detr.</span>
                    <div className="flex-1 h-4 rounded bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-red-500 rounded" style={{ width: '15%' }} />
                    </div>
                    <span className="text-neutral-500">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evolução */}
            <Card theme="light" className="lg:col-span-2">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle>Evolução do eNPS — Jan a Jun 2026</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bar chart */}
                <div className="flex items-end gap-3 h-40 mt-4">
                  {ENPS_EVOLUCAO.map((item) => (
                    <div key={item.mes} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-neutral-700">{item.valor}</span>
                      <div
                        className="w-full rounded-t bg-primary opacity-80 transition-all"
                        style={{ height: `${(item.valor / 50) * 100}%` }}
                      />
                      <span className="text-[11px] text-neutral-500">{item.mes}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-neutral-400">
                  Crescimento de +14 pontos no semestre (+50%)
                </p>
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card theme="light" noPadding className="lg:col-span-3">
              <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
                <CardTitle>Comentários Anônimos da Pesquisa</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-neutral-100 px-5">
                {ENPS_COMENTARIOS.map((c, i) => (
                  <div key={i} className="py-4 flex gap-4">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      c.tipo === 'positivo' ? 'bg-green-100 text-green-600' :
                      c.tipo === 'negativo' ? 'bg-red-100 text-red-600' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {c.tipo === 'positivo' ? '↑' : c.tipo === 'negativo' ? '↓' : '–'}
                    </span>
                    <div>
                      <p className="text-sm text-neutral-700 italic">"{c.texto}"</p>
                      <p className="mt-1 text-xs text-neutral-400">{c.autor}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 1 — Pesquisa de Clima */}
        {activeTab === 1 && (
          <Card theme="light">
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <CardTitle>Pesquisa de Clima Organizacional</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Resultados de Junho 2026 — 20 de 22 respondentes</p>
              </div>
              <Badge variant="info">Ciclo Jun/2026</Badge>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {CLIMA_DIMENSOES.map((d, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">{d.dimensao}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-neutral-500">Mercado: <strong>{d.mercado}%</strong></span>
                      <span className={`font-bold ${d.empresa >= 80 ? 'text-green-600' : d.empresa >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        Empresa: {d.empresa}%
                      </span>
                    </div>
                  </div>
                  {/* Empresa bar */}
                  <div className="relative h-4 w-full rounded bg-neutral-100 overflow-hidden">
                    {/* Mercado marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-neutral-400 z-10"
                      style={{ left: `${d.mercado}%` }}
                    />
                    <div
                      className={`h-full rounded transition-all ${
                        d.empresa >= 80 ? 'bg-green-500' :
                        d.empresa >= 70 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${d.empresa}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {d.empresa > d.mercado
                      ? `+${d.empresa - d.mercado}p acima do mercado`
                      : d.empresa === d.mercado
                      ? 'Na média do mercado'
                      : `${d.mercado - d.empresa}p abaixo do mercado`}
                  </p>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-4 text-xs text-neutral-500 border-t border-neutral-100">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-neutral-400" /> Linha do mercado (benchmark)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-green-500" /> ≥ 80% — Excelente
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-yellow-400" /> 70–79% — Bom
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-red-400" /> &lt; 70% — Atenção
                </span>
              </div>
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
            <CardContent className="divide-y divide-neutral-100 px-5">
              {FEEDBACKS.map((fb, i) => (
                <div key={i} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-neutral-900">{fb.de}</span>
                      <span className="text-neutral-400">→</span>
                      <span className="font-semibold text-neutral-900">{fb.para}</span>
                    </div>
                    <Badge variant={fb.tipo === 'Positivo' ? 'success' : 'warning'}>{fb.tipo}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600 italic">"{fb.msg}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  )
}
