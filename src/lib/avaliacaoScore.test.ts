import { describe, it, expect } from 'vitest'
import {
  CRITERIOS_PERCEPCAO,
  EIXOS,
  FASES,
  GRUPOS,
  getCriteriosDesempenho,
  getQuestionario,
  type Fase,
  type Grupo,
} from '@/data/avaliacaoExperiencia'
import {
  MAX_NA,
  NOTAS,
  alertaPrazo,
  calcularResultado,
  calcularTermometro,
  compararFases,
  faixaDaMedia,
  getProtocolo,
  type Resposta,
} from './avaliacaoScore'

const TODOS_OS_GRUPOS: Grupo[] = GRUPOS.map(g => g.valor)
const TODAS_AS_FASES: Fase[] = FASES.map(f => f.valor)

/** Responde todos os critérios com a mesma nota. */
function responderTudo(grupo: Grupo, fase: Fase, nota: number | 'NA'): Resposta[] {
  return getCriteriosDesempenho(grupo, fase).map(c => ({ criterioId: c.id, nota }))
}

// ── Catálogo ─────────────────────────────────────────────────────────────────

describe('catálogo', () => {
  it('tem 6 questionários com 15 critérios de desempenho + 2 de percepção', () => {
    for (const grupo of TODOS_OS_GRUPOS) {
      for (const fase of TODAS_AS_FASES) {
        expect(getCriteriosDesempenho(grupo, fase)).toHaveLength(15)
        expect(getQuestionario(grupo, fase).criterios).toHaveLength(17)
      }
    }
  })

  it('totaliza 92 critérios únicos (90 de desempenho + 2 de percepção)', () => {
    const ids = new Set<string>()
    for (const grupo of TODOS_OS_GRUPOS) {
      for (const fase of TODAS_AS_FASES) {
        getCriteriosDesempenho(grupo, fase).forEach(c => ids.add(c.id))
      }
    }
    expect(ids.size).toBe(90)
    expect(CRITERIOS_PERCEPCAO).toHaveLength(2)
  })

  it('não repete id e preenche os dois tooltips em todos os critérios', () => {
    const vistos = new Set<string>()
    for (const grupo of TODOS_OS_GRUPOS) {
      for (const fase of TODAS_AS_FASES) {
        for (const c of getQuestionario(grupo, fase).criterios) {
          if (c.bloco === 'desempenho') {
            expect(vistos.has(c.id), `id duplicado: ${c.id}`).toBe(false)
            vistos.add(c.id)
          }
          expect(c.guia.length, `guia vazio em ${c.id}`).toBeGreaterThan(20)
          expect(c.referenciaNota5.length, `referenciaNota5 vazio em ${c.id}`).toBeGreaterThan(20)
          expect(c.pergunta.trim().endsWith('?'), `pergunta sem "?" em ${c.id}`).toBe(true)
        }
      }
    }
  })

  it('cobre os 5 eixos em todos os 6 questionários, para o radar 45 × 90 ser comparável', () => {
    for (const grupo of TODOS_OS_GRUPOS) {
      for (const fase of TODAS_AS_FASES) {
        const presentes = new Set(getCriteriosDesempenho(grupo, fase).map(c => c.eixo))
        for (const { valor } of EIXOS) {
          expect(presentes.has(valor), `${grupo}/${fase} sem o eixo ${valor}`).toBe(true)
        }
      }
    }
  })

  it('numera os critérios de desempenho de 1 a 15 e a percepção em 16 e 17', () => {
    for (const grupo of TODOS_OS_GRUPOS) {
      for (const fase of TODAS_AS_FASES) {
        const ordens = getCriteriosDesempenho(grupo, fase).map(c => c.ordem)
        expect(ordens).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
      }
    }
    expect(CRITERIOS_PERCEPCAO.map(c => c.ordem)).toEqual([16, 17])
  })
})

// ── Escala ───────────────────────────────────────────────────────────────────

describe('escala', () => {
  it('tem 11 níveis, de 0 a 5, em passos de 0,5', () => {
    expect(NOTAS).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5])
  })
})

// ── Cálculo da média ─────────────────────────────────────────────────────────

describe('calcularResultado', () => {
  const criterios = getCriteriosDesempenho('administrativo', 45)

  it('gabaritar os 15 dá soma 75 e média 5,00 — o máximo possível', () => {
    const r = calcularResultado(criterios, responderTudo('administrativo', 45, 5))
    expect(r.soma).toBe(75)
    expect(r.pontuados).toBe(15)
    expect(r.media).toBe(5)
    expect(r.completo).toBe(true)
    expect(r.faixa).toBe('destaque')
  })

  it('zerar os 15 dá média 0 — o piso da escala', () => {
    const r = calcularResultado(criterios, responderTudo('administrativo', 45, 0))
    expect(r.soma).toBe(0)
    expect(r.media).toBe(0)
    expect(r.completo).toBe(true)
    expect(r.faixa).toBe('critico')
  })

  it('N/A sai do divisor em vez de contar como zero', () => {
    const respostas: Resposta[] = criterios.map((c, i) => ({
      criterioId: c.id,
      nota: i < 3 ? 'NA' : 4,
    }))
    const r = calcularResultado(criterios, respostas)
    expect(r.naCount).toBe(3)
    expect(r.pontuados).toBe(12)
    expect(r.soma).toBe(48)
    expect(r.media).toBe(4) // 48 / 12, e não 48 / 15
    expect(r.completo).toBe(true)
    expect(r.excedeuNA).toBe(false)
  })

  it('sinaliza quando o número de N/A passa do teto', () => {
    const respostas: Resposta[] = criterios.map((c, i) => ({
      criterioId: c.id,
      nota: i <= MAX_NA ? 'NA' : 3,
    }))
    expect(calcularResultado(criterios, respostas).excedeuNA).toBe(true)
  })

  it('conta pendentes e não fica completo até os 15 terem resposta', () => {
    const respostas: Resposta[] = criterios.slice(0, 10).map(c => ({ criterioId: c.id, nota: 3 }))
    const r = calcularResultado(criterios, respostas)
    expect(r.pontuados).toBe(10)
    expect(r.pendentes).toBe(5)
    expect(r.completo).toBe(false)
  })

  it('média é null quando nada foi pontuado', () => {
    const r = calcularResultado(criterios, [])
    expect(r.media).toBeNull()
    expect(r.faixa).toBeNull()
    expect(r.pendentes).toBe(15)
  })

  it('arredonda a média em duas casas', () => {
    // 14 notas 5 + 1 nota 0,5 → 70,5 / 15 = 4,7
    const respostas: Resposta[] = criterios.map((c, i) => ({
      criterioId: c.id,
      nota: i === 0 ? 0.5 : 5,
    }))
    expect(calcularResultado(criterios, respostas).media).toBe(4.7)
  })

  it('ignora nota fora da escala', () => {
    const respostas: Resposta[] = [
      { criterioId: criterios[0].id, nota: 4.3 }, // não é passo de 0,5
      { criterioId: criterios[1].id, nota: 4 },
    ]
    const r = calcularResultado(criterios, respostas)
    expect(r.pontuados).toBe(1)
    expect(r.media).toBe(4)
  })

  it('as perguntas de percepção não entram na média do colaborador', () => {
    // Nota mínima nas duas perguntas de percepção, máxima nos 15 de desempenho.
    const respostas: Resposta[] = [
      ...responderTudo('administrativo', 45, 5),
      ...CRITERIOS_PERCEPCAO.map(c => ({ criterioId: c.id, nota: 0 as const })),
    ]
    const r = calcularResultado(criterios, respostas)
    expect(r.media).toBe(5) // criticar a liderança não derruba a nota dele
    expect(r.pontuados).toBe(15)
    expect(calcularTermometro(CRITERIOS_PERCEPCAO, respostas)).toBe(0)
  })

  it('calcula média por eixo', () => {
    const r = calcularResultado(criterios, responderTudo('administrativo', 45, 4))
    expect(r.porEixo).toHaveLength(5)
    for (const e of r.porEixo) {
      expect(e.media).toBe(4)
      expect(e.pontuados).toBeGreaterThan(0)
    }
  })
})

// ── Faixas e protocolo ───────────────────────────────────────────────────────

describe('faixaDaMedia', () => {
  it('usa 3,5 como corte entre parabenizar e repensar', () => {
    expect(faixaDaMedia(3.5)).toBe('aprovado')
    expect(faixaDaMedia(3.49)).toBe('atencao')
  })

  it('mapeia as quatro faixas', () => {
    expect(faixaDaMedia(5)).toBe('destaque')
    expect(faixaDaMedia(4.5)).toBe('destaque')
    expect(faixaDaMedia(4.49)).toBe('aprovado')
    expect(faixaDaMedia(2.5)).toBe('atencao')
    expect(faixaDaMedia(2.49)).toBe('critico')
    expect(faixaDaMedia(0)).toBe('critico')
  })
})

describe('getProtocolo', () => {
  it('parabeniza a partir de 3,5 e não exige justificativa', () => {
    for (const fase of TODAS_AS_FASES) {
      for (const faixa of ['aprovado', 'destaque'] as const) {
        const p = getProtocolo(fase, faixa)
        expect(p.titulo.toLowerCase()).toContain('parabéns')
        expect(p.exigeJustificativa).toBe(false)
        expect(p.tom).toBe('positivo')
      }
    }
  })

  it('abaixo de 3,5 manda repensar e exige justificativa', () => {
    for (const fase of TODAS_AS_FASES) {
      for (const faixa of ['atencao', 'critico'] as const) {
        const p = getProtocolo(fase, faixa)
        expect(p.titulo.toLowerCase()).toContain('repensar')
        expect(p.exigeJustificativa).toBe(true)
        expect(p.acoes.length).toBeGreaterThan(0)
      }
    }
  })

  it('fala de prorrogação nos 45 dias e de efetivação nos 90', () => {
    expect(getProtocolo(45, 'aprovado').decisao.toLowerCase()).toContain('prorrogar')
    expect(getProtocolo(90, 'aprovado').decisao.toLowerCase()).toContain('efetivar')
  })
})

// ── Comparativo 45 × 90 ──────────────────────────────────────────────────────

describe('compararFases', () => {
  it('detecta regressão quando a média cai do dia 45 para o dia 90', () => {
    const r45 = calcularResultado(getCriteriosDesempenho('administrativo', 45), responderTudo('administrativo', 45, 4))
    const r90 = calcularResultado(getCriteriosDesempenho('administrativo', 90), responderTudo('administrativo', 90, 3))
    const c = compararFases(r45, r90)
    expect(c.media45).toBe(4)
    expect(c.media90).toBe(3)
    expect(c.delta).toBe(-1)
    expect(c.regressao).toBe(true)
  })

  it('não acusa regressão quando evolui', () => {
    const r45 = calcularResultado(getCriteriosDesempenho('administrativo', 45), responderTudo('administrativo', 45, 3))
    const r90 = calcularResultado(getCriteriosDesempenho('administrativo', 90), responderTudo('administrativo', 90, 4.5))
    const c = compararFases(r45, r90)
    expect(c.delta).toBe(1.5)
    expect(c.regressao).toBe(false)
  })

  it('compara os 5 eixos, e não pergunta a pergunta', () => {
    const r45 = calcularResultado(getCriteriosDesempenho('operacional_externo', 45), responderTudo('operacional_externo', 45, 3))
    const r90 = calcularResultado(getCriteriosDesempenho('operacional_externo', 90), responderTudo('operacional_externo', 90, 4))
    const c = compararFases(r45, r90)
    expect(c.porEixo).toHaveLength(5)
    for (const e of c.porEixo) {
      expect(e.media45).toBe(3)
      expect(e.media90).toBe(4)
      expect(e.delta).toBe(1)
    }
  })

  it('tolera fase ausente', () => {
    const c = compararFases(null, null)
    expect(c.delta).toBeNull()
    expect(c.regressao).toBe(false)
  })
})

// ── Prazos do contrato de experiência ────────────────────────────────────────

describe('alertaPrazo', () => {
  const admissao = '2026-01-01'

  it('libera sem urgência no início do período', () => {
    expect(alertaPrazo(45, admissao, new Date('2026-01-20T12:00:00'))?.nivel).toBe('ok')
  })

  it('alerta ao entrar na janela recomendada', () => {
    // dia 36 de casa
    expect(alertaPrazo(45, admissao, new Date('2026-02-06T12:00:00'))?.nivel).toBe('atencao')
  })

  it('acusa vencimento depois do limite legal', () => {
    const a = alertaPrazo(45, admissao, new Date('2026-02-20T12:00:00'))
    expect(a?.nivel).toBe('vencido')
    expect(a?.mensagem).toContain('RH')
  })

  it('usa janela mais tardia para a fase de 90 dias', () => {
    // dia 50: já vencido para 45 dias, ainda tranquilo para 90
    const ref = new Date('2026-02-20T12:00:00')
    expect(alertaPrazo(45, admissao, ref)?.nivel).toBe('vencido')
    expect(alertaPrazo(90, admissao, ref)?.nivel).toBe('ok')
  })

  it('devolve null para data inválida', () => {
    expect(alertaPrazo(45, 'não é data')).toBeNull()
  })
})
