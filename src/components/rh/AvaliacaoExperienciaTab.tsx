import { useState } from 'react'
import { Plus, ClipboardList, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NovaAvaliacaoExperienciaModal } from './NovaAvaliacaoExperienciaModal'
import { FASES, GRUPOS } from '@/data/avaliacaoExperiencia'
import { CORTE_PARABENS, MAX_NA } from '@/lib/avaliacaoScore'

/**
 * Tab "Avaliação de Experiência" — período de experiência (45 e 90 dias).
 *
 * Não exibe lista de colaboradores porque nada é persistido ainda: inventar
 * nomes aqui daria a impressão de que há avaliações registradas.
 */
export function AvaliacaoExperienciaTab() {
  const [modalAberto, setModalAberto] = useState(false)

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

        {/* Estado vazio */}
        <Card theme="light">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <ClipboardList className="mb-3 h-10 w-10 text-neutral-300" />
            <p className="text-sm font-semibold text-neutral-700">
              Nenhuma avaliação de experiência registrada
            </p>
            <p className="mt-1 max-w-md text-xs text-neutral-500">
              O questionário já funciona de ponta a ponta e calcula o resultado. As tabelas também
              já existem no banco — falta ligar a gravação pela tela.
            </p>
            <div className="mt-3">
              <Badge variant="warning">Gravação não ligada</Badge>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setModalAberto(true)}
              >
                Nova Avaliação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <NovaAvaliacaoExperienciaModal open={modalAberto} onClose={() => setModalAberto(false)} />
    </>
  )
}
