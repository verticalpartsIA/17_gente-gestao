/**
 * PERSISTÊNCIA — AVALIAÇÃO DE EXPERIÊNCIA
 * ============================================================================
 *
 * Tabelas: avaliacoes_experiencia e avaliacoes_experiencia_respostas
 * (ver docs/avaliacao-experiencia.sql).
 *
 * A ordem de gravação NÃO é arbitrária — ela é imposta pelo RLS:
 *
 *   1. cabeçalho como 'rascunho'
 *   2. as 17 respostas (a policy de insert exige que o pai esteja em rascunho)
 *   3. update do cabeçalho para 'concluida'
 *
 * Inverter isso falha: avaliação concluída não aceita resposta nova, de
 * propósito — é o que impede alterar um registro já fechado.
 */

import { supabase, isMockMode } from './supabase'
import { CATALOGO_VERSAO, type Fase, type Grupo } from '@/data/avaliacaoExperiencia'
import type { Resposta, Resultado } from './avaliacaoScore'

const db = supabase as any

export interface ColaboradorOpcao {
  id: string
  name: string
  job_title: string | null
  department: string | null
}

export interface AvaliacaoResumo {
  id: string
  colaborador_nome: string
  colaborador_cargo: string | null
  grupo: Grupo
  fase: Fase
  media_desempenho: number | null
  faixa: string | null
  criterios_na: number
  status: 'rascunho' | 'concluida'
  concluida_em: string | null
  avaliador_nome: string | null
}

/** O cliente mock de src/lib/supabase.ts não implementa insert/order. */
export function persistenciaDisponivel(): boolean {
  return !isMockMode
}

// ── Leitura ──────────────────────────────────────────────────────────────────

export async function listarColaboradores(): Promise<ColaboradorOpcao[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('profiles')
    .select('id, name, job_title, department')
    .eq('is_active', true)
    .eq('is_placeholder', false)
    .order('name')
  if (error) throw new Error(`Não foi possível carregar os colaboradores: ${error.message}`)
  return (data ?? []) as ColaboradorOpcao[]
}

/**
 * Avaliações visíveis ao usuário logado. O RLS já filtra: o RH vê todas, o
 * líder vê só as que ele mesmo aplicou.
 */
export async function listarAvaliacoes(): Promise<AvaliacaoResumo[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('avaliacoes_experiencia')
    .select(
      'id, colaborador_nome, colaborador_cargo, grupo, fase, media_desempenho, faixa, criterios_na, status, concluida_em, avaliador_nome',
    )
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar as avaliações: ${error.message}`)
  return (data ?? []) as AvaliacaoResumo[]
}

// ── Gravação ─────────────────────────────────────────────────────────────────

export interface SalvarInput {
  colaboradorId: string
  colaboradorNome: string
  colaboradorCargo: string | null
  dataAdmissao: string | null
  avaliadorId: string
  avaliadorNome: string
  grupo: Grupo
  fase: Fase
  resultado: Resultado
  termometro: number | null
  justificativa: string
  /** Todas as 17 respostas: os 15 de desempenho + PERC-01/02. */
  respostas: Resposta[]
}

function paraLinha(avaliacaoId: string, r: Resposta) {
  return {
    avaliacao_id: avaliacaoId,
    criterio_id: r.criterioId,
    nota: r.nota === 'NA' || r.nota === null ? null : r.nota,
    nao_aplica: r.nota === 'NA',
    observacao: r.observacao?.trim() ? r.observacao.trim() : null,
  }
}

export async function salvarAvaliacao(input: SalvarInput): Promise<{ id: string }> {
  if (isMockMode) {
    throw new Error(
      'Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).',
    )
  }

  // 1) Cabeçalho como rascunho — as respostas só entram enquanto ele é rascunho.
  const { data: cabecalho, error: erroCabecalho } = await db
    .from('avaliacoes_experiencia')
    .insert({
      colaborador_id: input.colaboradorId,
      colaborador_nome: input.colaboradorNome,
      colaborador_cargo: input.colaboradorCargo,
      data_admissao: input.dataAdmissao || null,
      avaliador_id: input.avaliadorId,
      avaliador_nome: input.avaliadorNome,
      grupo: input.grupo,
      fase: input.fase,
      catalogo_versao: CATALOGO_VERSAO,
      status: 'rascunho',
    })
    .select('id')
    .single()

  if (erroCabecalho) {
    // unique(colaborador_id, fase): já existe avaliação desta pessoa nesta fase
    if (erroCabecalho.code === '23505') {
      throw new Error(
        `${input.colaboradorNome} já tem uma avaliação de ${input.fase} dias registrada. Cada colaborador é avaliado uma vez por fase.`,
      )
    }
    throw new Error(`Não foi possível iniciar a gravação: ${erroCabecalho.message}`)
  }

  const id = cabecalho.id as string

  try {
    // 2) As 17 respostas. Sem .select(): o RLS bloqueia a leitura das PERC-*
    //    pelo avaliador, e um RETURNING faria a chamada inteira falhar.
    const linhas = input.respostas
      .filter(r => r.nota !== null || r.observacao?.trim())
      .map(r => paraLinha(id, r))

    if (linhas.length > 0) {
      const { error: erroRespostas } = await db
        .from('avaliacoes_experiencia_respostas')
        .insert(linhas)
      if (erroRespostas) {
        throw new Error(`Não foi possível gravar as respostas: ${erroRespostas.message}`)
      }
    }

    // 3) Fecha o registro com o resultado calculado.
    const { error: erroFechamento } = await db
      .from('avaliacoes_experiencia')
      .update({
        media_desempenho: input.resultado.media,
        soma_desempenho: input.resultado.soma,
        criterios_pontuados: input.resultado.pontuados,
        criterios_na: input.resultado.naCount,
        faixa: input.resultado.faixa,
        termometro_integracao: input.termometro,
        justificativa: input.justificativa.trim() || null,
        status: 'concluida',
        concluida_em: new Date().toISOString(),
      })
      .eq('id', id)

    if (erroFechamento) {
      // A constraint de justificativa obrigatória abaixo de 3,5 cai aqui.
      if (erroFechamento.code === '23514') {
        throw new Error(
          'Abaixo de 3,5 a justificativa do fechamento é obrigatória (mínimo 20 caracteres).',
        )
      }
      throw new Error(`Não foi possível concluir a avaliação: ${erroFechamento.message}`)
    }

    return { id }
  } catch (e) {
    // Não deixa rascunho órfão: ele bloquearia a constraint unique numa nova
    // tentativa para o mesmo colaborador e fase.
    await db.from('avaliacoes_experiencia').delete().eq('id', id)
    throw e
  }
}
