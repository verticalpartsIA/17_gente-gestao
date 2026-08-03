/**
 * MOTOR DE PONTUAÇÃO — AVALIAÇÃO DE EXPERIÊNCIA
 * ============================================================================
 *
 * Regras acordadas com a VerticalParts:
 *
 *  • Escala por critério: 0,0 → 5,0 em passos de 0,5 (11 níveis), ou "N/A".
 *      0,0  = avaliado e não atende (crítico)
 *      N/A  = não se aplica à função — não pontua e sai do divisor
 *  • Média = soma das notas pontuadas ÷ quantidade de critérios pontuados.
 *    Máximo 5,0. Gabaritar os 15 → 75 ÷ 15 = 5,0.
 *  • Teto de 3 N/A. Acima disso o grupo escolhido provavelmente está errado.
 *  • Os 2 critérios de percepção (bloco 'percepcao') NÃO entram na média do
 *    colaborador — eles compõem o Termômetro de Integração, indicador de RH.
 *    Isso é deliberado: se a nota do superior imediato entrasse na média, o
 *    colaborador seria penalizado por criticar a liderança.
 *  • Protocolo de fechamento ancorado em 3,5 (régua definida pela diretoria).
 */

import {
  type Criterio,
  type Eixo,
  type Fase,
  EIXOS,
} from '@/data/avaliacaoExperiencia'

// ── Escala ───────────────────────────────────────────────────────────────────

/** Os 11 níveis válidos de nota. */
export const NOTAS: number[] = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export const NOTA_MAXIMA = 5
export const MAX_NA = 3
/** Nota a partir da qual o colaborador é parabenizado. */
export const CORTE_PARABENS = 3.5

/** Nota de um critério: número da escala, 'NA' (não se aplica) ou null (não respondido). */
export type Nota = number | 'NA' | null

export interface Resposta {
  criterioId: string
  nota: Nota
  observacao?: string
}

// ── Resultado ────────────────────────────────────────────────────────────────

export type Faixa = 'destaque' | 'aprovado' | 'atencao' | 'critico'

export interface ResultadoEixo {
  eixo: Eixo
  label: string
  media: number | null
  pontuados: number
}

export interface Resultado {
  /** Soma das notas pontuadas (máx. 75 com os 15 critérios em 5,0). */
  soma: number
  /** Quantidade de critérios que entraram na média (o divisor real). */
  pontuados: number
  /** Quantidade marcada como N/A. */
  naCount: number
  /** Quantidade ainda sem resposta. */
  pendentes: number
  /** Total de critérios de desempenho do questionário (sempre 15). */
  total: number
  /** Média final 0–5, ou null se nada foi pontuado ainda. */
  media: number | null
  /** true quando todos os 15 critérios têm nota ou N/A. */
  completo: boolean
  /** true quando o número de N/A passou do teto permitido. */
  excedeuNA: boolean
  /** Faixa do protocolo de fechamento — null enquanto não há média. */
  faixa: Faixa | null
  /** Médias por eixo, para o radar comparativo 45 × 90. */
  porEixo: ResultadoEixo[]
}

// ── Cálculo ──────────────────────────────────────────────────────────────────

function isNotaValida(n: Nota): n is number {
  return typeof n === 'number' && NOTAS.includes(n)
}

function media(notas: number[]): number | null {
  if (notas.length === 0) return null
  const soma = notas.reduce((a, b) => a + b, 0)
  return Math.round((soma / notas.length) * 100) / 100
}

/**
 * Calcula o resultado de desempenho a partir das respostas.
 * `criterios` deve conter APENAS os 15 critérios de desempenho — os de
 * percepção são calculados separadamente por `calcularTermometro`.
 */
export function calcularResultado(criterios: Criterio[], respostas: Resposta[]): Resultado {
  const porId = new Map(respostas.map(r => [r.criterioId, r]))

  const notasValidas: number[] = []
  let naCount = 0
  let pendentes = 0

  for (const criterio of criterios) {
    const nota = porId.get(criterio.id)?.nota ?? null
    if (nota === 'NA') naCount++
    else if (isNotaValida(nota)) notasValidas.push(nota)
    else pendentes++
  }

  const soma = notasValidas.reduce((a, b) => a + b, 0)
  const mediaFinal = media(notasValidas)

  const porEixo: ResultadoEixo[] = EIXOS.map(({ valor, label }) => {
    const doEixo = criterios
      .filter(c => c.eixo === valor)
      .map(c => porId.get(c.id)?.nota ?? null)
      .filter(isNotaValida)
    return { eixo: valor, label, media: media(doEixo), pontuados: doEixo.length }
  })

  return {
    soma: Math.round(soma * 100) / 100,
    pontuados: notasValidas.length,
    naCount,
    pendentes,
    total: criterios.length,
    media: mediaFinal,
    completo: pendentes === 0,
    excedeuNA: naCount > MAX_NA,
    faixa: mediaFinal === null ? null : faixaDaMedia(mediaFinal),
    porEixo,
  }
}

export function faixaDaMedia(media: number): Faixa {
  if (media >= 4.5) return 'destaque'
  if (media >= CORTE_PARABENS) return 'aprovado'
  if (media >= 2.5) return 'atencao'
  return 'critico'
}

/**
 * Termômetro de Integração — média das 2 perguntas de percepção.
 * NUNCA compõe a nota do colaborador: mede a empresa e a liderança.
 */
export function calcularTermometro(criterios: Criterio[], respostas: Resposta[]): number | null {
  const porId = new Map(respostas.map(r => [r.criterioId, r]))
  const notas = criterios
    .map(c => porId.get(c.id)?.nota ?? null)
    .filter(isNotaValida)
  return media(notas)
}

// ── Protocolo de fechamento ──────────────────────────────────────────────────

export interface Protocolo {
  faixa: Faixa
  /** Chamada principal exibida ao avaliador no fechamento. */
  titulo: string
  /** Decisão recomendada para a fase. */
  decisao: string
  /** Passos que o avaliador deve executar. */
  acoes: string[]
  /** true quando o fechamento exige justificativa escrita (média < 3,5). */
  exigeJustificativa: boolean
  tom: 'positivo' | 'alerta' | 'critico'
}

const PROTOCOLO: Record<Fase, Record<Faixa, Protocolo>> = {
  45: {
    destaque: {
      faixa: 'destaque', tom: 'positivo', exigeJustificativa: false,
      titulo: 'Dê os parabéns ao colaborador — destaque de integração',
      decisao: 'Prorrogar o contrato de experiência',
      acoes: [
        'Parabenize pessoalmente e registre os três pontos mais fortes observados.',
        'Combine metas claras para os próximos 45 dias — ele tem margem para mais.',
        'Sinalize ao RH como candidato a acompanhamento de potencial.',
      ],
    },
    aprovado: {
      faixa: 'aprovado', tom: 'positivo', exigeJustificativa: false,
      titulo: 'Dê os parabéns ao colaborador',
      decisao: 'Prorrogar o contrato de experiência',
      acoes: [
        'Parabenize e diga com clareza o que ele está fazendo bem.',
        'Aponte 1 a 2 pontos de atenção a acompanhar até o dia 90.',
        'Registre esses pontos: eles serão reavaliados no critério "Evolução Pós-Feedback".',
      ],
    },
    atencao: {
      faixa: 'atencao', tom: 'alerta', exigeJustificativa: true,
      titulo: 'Vale repensar se prorroga ou sai',
      decisao: 'Prorrogação condicionada a plano de ação escrito',
      acoes: [
        'Conversa formal de feedback, com os pontos críticos ditos sem rodeio.',
        'Se optar por prorrogar, registre plano de ação com o que precisa mudar até o dia 90.',
        'Notifique o RH — este caso precisa de acompanhamento próximo.',
      ],
    },
    critico: {
      faixa: 'critico', tom: 'critico', exigeJustificativa: true,
      titulo: 'Vale repensar se prorroga ou sai',
      decisao: 'Recomendação de NÃO prorrogar',
      acoes: [
        'Escale a RH e ao gestor imediato ANTES do dia 45 — a decisão precisa caber no contrato.',
        'Justifique por escrito com fatos observados, não impressões.',
        'Se houver decisão de prorrogar contra a recomendação, registre o motivo.',
      ],
    },
  },
  90: {
    destaque: {
      faixa: 'destaque', tom: 'positivo', exigeJustificativa: false,
      titulo: 'Dê os parabéns ao colaborador — destaque de efetivação',
      decisao: 'Efetivar',
      acoes: [
        'Parabenize formalmente e comunique a efetivação.',
        'Monte trilha de desenvolvimento — este perfil merece plano de carreira.',
        'Indique ao RH para a matriz 9-Box e para eventual PDI acelerado.',
      ],
    },
    aprovado: {
      faixa: 'aprovado', tom: 'positivo', exigeJustificativa: false,
      titulo: 'Dê os parabéns ao colaborador',
      decisao: 'Efetivar',
      acoes: [
        'Parabenize e comunique a efetivação.',
        'Defina os dois focos de desenvolvimento do primeiro semestre efetivado.',
        'Encaminhe ao RH para inclusão no ciclo regular de avaliação.',
      ],
    },
    atencao: {
      faixa: 'atencao', tom: 'alerta', exigeJustificativa: true,
      titulo: 'Vale repensar se efetiva ou sai — zona crítica',
      decisao: 'Decisão conjunta entre gestor e RH',
      acoes: [
        'Não decida sozinho: leve o caso ao RH com os critérios de nota baixa em mão.',
        'Verifique se os pontos do dia 45 evoluíram — se não evoluíram, o prognóstico é ruim.',
        'Se efetivar, é obrigatório plano de ação com prazo e reavaliação em 60 dias.',
      ],
    },
    critico: {
      faixa: 'critico', tom: 'critico', exigeJustificativa: true,
      titulo: 'Vale repensar se efetiva ou sai',
      decisao: 'Recomendação de NÃO efetivar',
      acoes: [
        'Acione o RH imediatamente — o contrato de experiência tem prazo fatal.',
        'Justifique por escrito com fatos e datas; é o documento que sustenta a decisão.',
        'Confirme se houve feedback formal no dia 45: sem isso, a empresa falhou também.',
      ],
    },
  },
}

export function getProtocolo(fase: Fase, faixa: Faixa): Protocolo {
  return PROTOCOLO[fase][faixa]
}

// ── Comparativo 45 × 90 ──────────────────────────────────────────────────────

export interface ComparativoEixo {
  eixo: Eixo
  label: string
  media45: number | null
  media90: number | null
  delta: number | null
}

export interface Comparativo {
  media45: number | null
  media90: number | null
  delta: number | null
  /** true quando a média caiu entre as duas fases — dispara alerta de regressão. */
  regressao: boolean
  porEixo: ComparativoEixo[]
}

/**
 * Cruza os resultados das duas fases. Os questionários de 45 e 90 dias medem
 * coisas diferentes por design, então a comparação NÃO é feita pergunta a
 * pergunta — apenas por eixo e pela média geral, que são comparáveis.
 */
export function compararFases(res45: Resultado | null, res90: Resultado | null): Comparativo {
  const media45 = res45?.media ?? null
  const media90 = res90?.media ?? null
  const delta = media45 !== null && media90 !== null
    ? Math.round((media90 - media45) * 100) / 100
    : null

  const porEixo: ComparativoEixo[] = EIXOS.map(({ valor, label }) => {
    const m45 = res45?.porEixo.find(e => e.eixo === valor)?.media ?? null
    const m90 = res90?.porEixo.find(e => e.eixo === valor)?.media ?? null
    return {
      eixo: valor,
      label,
      media45: m45,
      media90: m90,
      delta: m45 !== null && m90 !== null ? Math.round((m90 - m45) * 100) / 100 : null,
    }
  })

  return { media45, media90, delta, regressao: delta !== null && delta < 0, porEixo }
}

// ── Prazos do contrato de experiência ────────────────────────────────────────

/**
 * Janela recomendada para aplicar a avaliação, contada da admissão.
 * A avaliação de 90 dias precisa ser concluída ANTES do dia 90: se a decisão
 * de desligamento sair no vencimento, não há tempo de comunicá-la dentro do
 * contrato de experiência.
 */
export function janelaRecomendada(fase: Fase): { de: number; ate: number; limite: number } {
  return fase === 45
    ? { de: 35, ate: 40, limite: 45 }
    : { de: 78, ate: 82, limite: 90 }
}

/** Dias corridos entre a admissão e a data de referência. */
export function diasDeCasa(admissao: string, referencia: Date = new Date()): number | null {
  const inicio = new Date(`${admissao}T00:00:00`)
  if (Number.isNaN(inicio.getTime())) return null
  const ms = referencia.getTime() - inicio.getTime()
  return Math.floor(ms / 86_400_000)
}

export type AlertaPrazo = { nivel: 'ok' | 'atencao' | 'vencido'; mensagem: string }

export function alertaPrazo(fase: Fase, admissao: string, referencia?: Date): AlertaPrazo | null {
  const dias = diasDeCasa(admissao, referencia)
  if (dias === null) return null
  const { de, limite } = janelaRecomendada(fase)

  if (dias > limite) {
    return {
      nivel: 'vencido',
      mensagem: `Dia ${dias} de casa — o prazo de ${fase} dias já venceu. Acione o RH: a decisão pode não caber mais no contrato de experiência.`,
    }
  }
  if (dias >= de) {
    return {
      nivel: 'atencao',
      mensagem: `Dia ${dias} de casa — restam ${limite - dias} dias para o limite de ${fase} dias. Conclua a avaliação agora.`,
    }
  }
  return {
    nivel: 'ok',
    mensagem: `Dia ${dias} de casa — janela recomendada a partir do dia ${de}.`,
  }
}
