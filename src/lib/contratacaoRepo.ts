/**
 * PERSISTÊNCIA — REQUISIÇÃO DE PESSOAL (Fluxo de Contratação)
 * ============================================================================
 *
 * Tabelas: contratacao_vagas, contratacao_aprovacoes, contratacao_auditoria
 * (ver migração create_contratacao_vagas no projeto Supabase).
 *
 * Fluxo: gestor abre a vaga (aguardando_aprovacao) → aprovação executiva
 * (hoje só quem tem profiles.department = 'CEO') → aprovada, RH assume o
 * sourcing pelas etapas em_triagem / em_pipeline / concluida.
 *
 * Recusada: o CEO grava justificativa + data de reabertura; o próprio
 * gestor reenvia (incrementa "edicao", volta a aguardando_aprovacao) — o
 * histórico de recusas anteriores fica em contratacao_aprovacoes, uma
 * linha por edição, nunca é sobrescrito.
 *
 * Não confundir com o VP Requisições (sistema de compras — projeto
 * Supabase diferente, domínio diferente).
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type VagaTipo = 'substituicao' | 'aumento_quadro' | 'projeto_temporario'
export type VagaRegime = 'CLT' | 'PJ'
export type VagaPrioridade = 'normal' | 'alta' | 'critica'
export type VagaStatus =
  | 'aguardando_aprovacao'
  | 'recusada'
  | 'aprovada'
  | 'em_triagem'
  | 'em_pipeline'
  | 'concluida'
  | 'cancelada'
export type VagaDecisao = 'pendente' | 'aprovada' | 'recusada'

export interface Vaga {
  id: string
  ticket_number: string
  titulo_cargo: string
  departamento: string
  gestor_id: string
  gestor_nome: string
  tipo_vaga: VagaTipo
  justificativa: string
  escopo_funcao: string | null
  perfil_tecnico: string | null
  faixa_min: number | null
  faixa_max: number | null
  regime: VagaRegime
  prioridade: VagaPrioridade
  prazo_esperado: string | null
  status: VagaStatus
  edicao: number
  created_at: string
  updated_at: string
}

export interface Aprovacao {
  id: string
  vaga_id: string
  edicao: number
  decisao: VagaDecisao
  aprovador_id: string | null
  aprovador_nome: string | null
  justificativa_recusa: string | null
  pode_reabrir_em: string | null
  decidido_em: string | null
  created_at: string
}

/** O cliente mock de src/lib/supabase.ts não implementa insert/update/order. */
export function persistenciaDisponivel(): boolean {
  return !isMockMode
}

/**
 * Só quem tem profiles.department = 'CEO' vê os botões de aprovar/recusar
 * na tela — é uma conveniência de UI, não a barreira de segurança: quem
 * garante isso de verdade é a policy de RLS (public.eh_aprovador_executivo()).
 */
export function ehAprovadorExecutivo(departamento: string | null | undefined): boolean {
  return departamento === 'CEO'
}

// ── Leitura ──────────────────────────────────────────────────────────────────

/** RLS já filtra: gestor vê as próprias, CEO e RH (Administrador) veem todas. */
export async function listarVagas(): Promise<Vaga[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('contratacao_vagas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar as requisições: ${error.message}`)
  return (data ?? []) as Vaga[]
}

/** Histórico de decisões de uma vaga — todas as edições, inclusive recusas anteriores. */
export async function listarAprovacoes(vagaId: string): Promise<Aprovacao[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('contratacao_aprovacoes')
    .select('*')
    .eq('vaga_id', vagaId)
    .order('edicao', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar o histórico de aprovação: ${error.message}`)
  return (data ?? []) as Aprovacao[]
}

export async function listarDepartamentos(): Promise<string[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('profiles')
    .select('department')
    .not('department', 'is', null)
  if (error) throw new Error(`Não foi possível carregar os departamentos: ${error.message}`)
  const unicos = new Set<string>((data ?? []).map((d: { department: string }) => d.department))
  return Array.from(unicos).sort()
}

// ── Gravação — Etapa 1: abrir requisição ────────────────────────────────────

export interface NovaVagaInput {
  tituloCargo: string
  departamento: string
  gestorId: string
  gestorNome: string
  tipoVaga: VagaTipo
  justificativa: string
  escopoFuncao: string | null
  perfilTecnico: string | null
  faixaMin: number | null
  faixaMax: number | null
  regime: VagaRegime
  prioridade: VagaPrioridade
  prazoEsperado: string | null
}

export async function criarVaga(input: NovaVagaInput): Promise<{ id: string; ticket_number: string }> {
  if (isMockMode) {
    throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')
  }
  const { data, error } = await db
    .from('contratacao_vagas')
    .insert({
      titulo_cargo: input.tituloCargo.trim(),
      departamento: input.departamento,
      gestor_id: input.gestorId,
      gestor_nome: input.gestorNome,
      tipo_vaga: input.tipoVaga,
      justificativa: input.justificativa.trim(),
      escopo_funcao: input.escopoFuncao?.trim() || null,
      perfil_tecnico: input.perfilTecnico?.trim() || null,
      faixa_min: input.faixaMin,
      faixa_max: input.faixaMax,
      regime: input.regime,
      prioridade: input.prioridade,
      prazo_esperado: input.prazoEsperado || null,
    })
    .select('id, ticket_number')
    .single()

  if (error) {
    if (error.code === '23514') {
      throw new Error('A justificativa precisa ter pelo menos 20 caracteres.')
    }
    throw new Error(`Não foi possível abrir a requisição: ${error.message}`)
  }
  return data as { id: string; ticket_number: string }
}

// ── Etapa 2: aprovação executiva ────────────────────────────────────────────

export async function aprovarVaga(
  vagaId: string,
  edicao: number,
  aprovadorId: string,
  aprovadorNome: string,
): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db.from('contratacao_aprovacoes').insert({
    vaga_id: vagaId,
    edicao,
    decisao: 'aprovada',
    aprovador_id: aprovadorId,
    aprovador_nome: aprovadorNome,
  })
  if (error) throw new Error(`Não foi possível aprovar a requisição: ${error.message}`)
}

export async function recusarVaga(
  vagaId: string,
  edicao: number,
  aprovadorId: string,
  aprovadorNome: string,
  justificativaRecusa: string,
  podeReabrirEm: string | null,
): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db.from('contratacao_aprovacoes').insert({
    vaga_id: vagaId,
    edicao,
    decisao: 'recusada',
    aprovador_id: aprovadorId,
    aprovador_nome: aprovadorNome,
    justificativa_recusa: justificativaRecusa.trim(),
    pode_reabrir_em: podeReabrirEm,
  })
  if (error) {
    if (error.code === '23514') {
      throw new Error('A justificativa da recusa precisa ter pelo menos 20 caracteres.')
    }
    throw new Error(`Não foi possível registrar a recusa: ${error.message}`)
  }
}

// ── Reenvio pelo gestor, depois de uma recusa ───────────────────────────────

export interface ReenvioInput {
  tituloCargo?: string
  justificativa?: string
  escopoFuncao?: string | null
  perfilTecnico?: string | null
  faixaMin?: number | null
  faixaMax?: number | null
  prazoEsperado?: string | null
}

export async function reenviarVaga(vaga: Vaga, ajustes: ReenvioInput): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db
    .from('contratacao_vagas')
    .update({
      status: 'aguardando_aprovacao',
      edicao: vaga.edicao + 1,
      ...(ajustes.tituloCargo !== undefined ? { titulo_cargo: ajustes.tituloCargo.trim() } : {}),
      ...(ajustes.justificativa !== undefined ? { justificativa: ajustes.justificativa.trim() } : {}),
      ...(ajustes.escopoFuncao !== undefined ? { escopo_funcao: ajustes.escopoFuncao?.trim() || null } : {}),
      ...(ajustes.perfilTecnico !== undefined ? { perfil_tecnico: ajustes.perfilTecnico?.trim() || null } : {}),
      ...(ajustes.faixaMin !== undefined ? { faixa_min: ajustes.faixaMin } : {}),
      ...(ajustes.faixaMax !== undefined ? { faixa_max: ajustes.faixaMax } : {}),
      ...(ajustes.prazoEsperado !== undefined ? { prazo_esperado: ajustes.prazoEsperado || null } : {}),
    })
    .eq('id', vaga.id)
  if (error) throw new Error(`Não foi possível reenviar a requisição: ${error.message}`)
}

// ── Etapa 3: RH conduz o processo ───────────────────────────────────────────

export async function avancarStatus(vagaId: string, novoStatus: VagaStatus): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db.from('contratacao_vagas').update({ status: novoStatus }).eq('id', vagaId)
  if (error) throw new Error(`Não foi possível atualizar a etapa: ${error.message}`)
}
