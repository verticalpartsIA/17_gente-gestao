import { useCallback, useEffect, useState } from 'react'
import { Plus, ClipboardList, Info, Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NovaAvaliacaoExperienciaModal } from './NovaAvaliacaoExperienciaModal'
import { FASES, GRUPOS, grupoLabel } from '@/data/avaliacaoExperiencia'
import { CORTE_PARABENS, MAX_NA } from '@/lib/avaliacaoScore'
import {
  listarAvaliacoes,
  persistenciaDisponivel,
  type AvaliacaoResumo,
} from '@/lib/avaliacaoExperienciaRepo'

function faixaBadge(faixa: string | null) {
  if (faixa === 'destaque')  return <Badge variant="success">Destaque</Badge>
  if (faixa === 'aprovado')  return <Badge variant="info">Parabenizar</Badge>
  if (faixa === 'atencao')   return <Badge variant="warning">Repensar</Badge>
  if (faixa === 'critico')   return <Badge variant="danger">Repensar</Badge>
  return <Badge variant="default">—</Badge>
}

function mediaColor(media: number | null) {
  if (media === null) return 'text-neutral-400'
  if (media >= 4.5) return 'text-green-600'
  if (media >= 3.5) return 'text-blue-600'
  if (media >= 2.5) return 'text-amber-600'
  return 'text-red-600'
}

/**
 * Tab "Avaliação de Experiência" — período de experiência (45 e 90 dias).
 *
 * Não exibe lista de colaboradores porque nada é persistido ainda: inventar
 * nomes aqui daria a impressão de que há avaliações registradas.
 */
export function AvaliacaoExperienciaTab() {
  const [modalAberto, setModalAberto] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoResumo[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    if (!persistenciaDisponivel()) return
    setCarregando(true)
    setErro(null)
    listarAvaliacoes()
      .then(setAvaliacoes)
      .catch(e => setErro(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(carregar, [carregar])

  return (
    <>
      <div className="space-y-4">
        <Card theme="light" noPadding>
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 px-5 pt-5 pb-4">
            <div>
              <CardTitle>Avaliação de Experiência — 45 e 90 dias</CardTitle>
              <p className="mt-1 text-xs text-neutral-500">
                Seis questionários: 3 grupos de função × 2 fases. Cada um com 15 critérios
                pontuados + 2 perguntas de percepção.
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setModalAberto(true)}
            >
              Nova Avaliação
            </Button>
          </CardHeader>

          <CardContent className="px-5 py-5">
            {/* Como funciona */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Grupos de função
                </h4>
                <ul className="space-y-1.5">
                  {GRUPOS.map(g => (
                    <li key={g.valor} className="text-xs">
                      <span className="font-bold text-neutral-800">{g.label}</span>
                      <span className="text-neutral-500"> — {g.descricao}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Fases
                </h4>
                <ul className="space-y-1.5">
                  {FASES.map(f => (
                    <li key={f.valor} className="text-xs">
                      <span className="font-bold text-neutral-800">
                        {f.label} · {f.foco}
                      </span>
                      <span className="text-neutral-500"> — {f.decisao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regras de pontuação */}
            <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                <Info className="h-3.5 w-3.5" /> Como a nota é calculada
              </h4>
              <ul className="space-y-1 text-xs text-neutral-600">
                <li>
                  • Escala de <strong>0 a 5</strong>, de meio em meio ponto (11 níveis), ou{' '}
                  <strong>N/A</strong> quando o critério não se aplica à função.
                </li>
                <li>
                  • Média = soma das notas ÷ critérios pontuados. Gabaritar os 15 → 75 ÷ 15 ={' '}
                  <strong>5,00</strong>, o máximo possível.
                </li>
                <li>
                  • Teto de <strong>{MAX_NA} N/A</strong>: acima disso o grupo escolhido
                  provavelmente está errado.
                </li>
                <li>
                  • Média <strong>≥ {CORTE_PARABENS.toString().replace('.', ',')}</strong> → parabenizar o
                  colaborador. Abaixo → vale repensar se prorroga ou sai.
                </li>
                <li>
                  • As 2 perguntas de percepção (sobre a empresa e sobre o superior imediato){' '}
                  <strong>não pontuam o colaborador</strong> — compõem o Termômetro de Integração,
                  indicador de RH.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Avaliações registradas */}
        <Card theme="light" noPadding>
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
            <CardTitle>Avaliações registradas</CardTitle>
            {carregando && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
          </CardHeader>
          <CardContent className="p-0">
            {erro && (
              <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {!persistenciaDisponivel() ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="mb-3 h-10 w-10 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-700">Modo simulado</p>
                <p className="mt-1 max-w-md text-xs text-neutral-500">
                  O app está rodando sem as chaves do Supabase, então não há como listar nem gravar
                  avaliações. O questionário funciona e calcula o resultado normalmente.
                </p>
              </div>
            ) : avaliacoes.length === 0 && !carregando ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="mb-3 h-10 w-10 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-700">
                  Nenhuma avaliação registrada ainda
                </p>
                <p className="mt-1 max-w-md text-xs text-neutral-500">
                  Aplique a primeira avaliação de experiência para começar o histórico.
                </p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setModalAberto(true)}
                  >
                    Nova Avaliação
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Grupo</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Fase</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">Média</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Protocolo</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">Avaliador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {avaliacoes.map(a => (
                      <tr key={a.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-neutral-900">{a.colaborador_nome}</span>
                          {a.colaborador_cargo && (
                            <span className="block text-xs text-neutral-500">{a.colaborador_cargo}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{grupoLabel(a.grupo)}</td>
                        <td className="px-4 py-3 text-center text-neutral-600">{a.fase}d</td>
                        <td className={`px-4 py-3 text-center text-lg font-bold ${mediaColor(a.media_desempenho)}`}>
                          {a.media_desempenho !== null
                            ? Number(a.media_desempenho).toFixed(2).replace('.', ',')
                            : '—'}
                          {a.criterios_na > 0 && (
                            <span className="block text-[10px] font-normal text-neutral-400">
                              {a.criterios_na} N/A
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{faixaBadge(a.faixa)}</td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{a.avaliador_nome ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NovaAvaliacaoExperienciaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvo={carregar}
      />
    </>
  )
}
