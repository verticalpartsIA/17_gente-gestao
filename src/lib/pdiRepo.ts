/**
 * PERSISTÊNCIA — PDI (Plano de Desenvolvimento Individual)
 * ============================================================================
 *
 * Tabela: rh_pdi_acoes. Acessado tanto em /desempenho?tab=pdi quanto pelo
 * atalho "Meu PDI" do Meu Espaço (mesma rota, sem tela separada).
 *
 * Uma ação pode opcionalmente referenciar um rh_treinamentos — quando
 * vinculada, o progresso NUNCA vem da coluna `progresso` da própria ação,
 * é derivado ao vivo de rh_treinamentos_conclusoes (mesmo princípio de
 * "nada de coluna calculada armazenada" já seguido em Cargos/Metas/
 * Treinamentos). Ações sem vínculo (mentoria, projeto, leitura) usam o
 * progresso manual digitado pelo dono ou gestor.
 *
 * RLS segue o padrão de rh_metas_objetivos (dono + gestor direto +
 * Administrador) — diferente da Matriz 9-Box, aqui o dono vê e participa
 * do próprio plano.
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type PdiTipo = 'curso' | 'mentoria' | 'projeto' | 'leitura' | 'outro'
export type PdiStatus = 'nao_iniciado' | 'em_andamento' | 'concluido'

export interface AcaoPDI {
  id: string
  colaborador_id: string
  titulo: string
  descricao: string | null
  tipo: PdiTipo
  treinamento_id: string | null
  prazo: string | null
  progresso: number
  status: PdiStatus
  criado_por: string | null
  created_at: string
  colaborador?: { name: string } | null
  treinamento?: { nome: string } | null
}

export async function listarAcoes(colaboradorId?: string): Promise<AcaoPDI[]> {
  if (isMockMode) return []
  let query = db
    .from('rh_pdi_acoes')
    .select('*, colaborador:profiles!rh_pdi_acoes_colaborador_id_fkey(name), treinamento:rh_treinamentos(nome)')
    .order('created_at', { ascending: false })
  if (colaboradorId) query = query.eq('colaborador_id', colaboradorId)
  const { data, error } = await query
  if (error) throw new Error(`Não foi possível carregar o PDI: ${error.message}`)
  return (data ?? []) as AcaoPDI[]
}

/**
 * Progresso real de uma ação — se vinculada a treinamento, deriva de
 * rh_treinamentos_conclusoes (0 ou 100, nunca parcial); senão usa o campo
 * manual da própria ação.
 */
export async function progressoAcao(acao: AcaoPDI): Promise<number> {
  if (!acao.treinamento_id) return acao.progresso
  if (isMockMode) return 0
  const { data } = await db
    .from('rh_treinamentos_conclusoes')
    .select('id')
    .eq('treinamento_id', acao.treinamento_id)
    .eq('colaborador_id', acao.colaborador_id)
    .maybeSingle()
  return data ? 100 : 0
}

export interface NovaAcaoInput {
  colaboradorId: string
  titulo: string
  descricao: string | null
  tipo: PdiTipo
  treinamentoId: string | null
  prazo: string | null
  progresso: number
  criadoPor: string
}

export async function criarAcao(input: NovaAcaoInput): Promise<{ id: string }> {
  if (isMockMode) throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')
  const { data, error } = await db
    .from('rh_pdi_acoes')
    .insert({
      colaborador_id: input.colaboradorId,
      titulo: input.titulo.trim(),
      descricao: input.descricao?.trim() || null,
      tipo: input.tipo,
      treinamento_id: input.treinamentoId,
      prazo: input.prazo,
      progresso: input.treinamentoId ? 0 : input.progresso,
      criado_por: input.criadoPor,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Não foi possível criar a ação de PDI: ${error.message}`)
  return data as { id: string }
}

export async function atualizarProgresso(acaoId: string, progresso: number, status: PdiStatus): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db.from('rh_pdi_acoes').update({ progresso, status }).eq('id', acaoId)
  if (error) throw new Error(`Não foi possível atualizar o progresso: ${error.message}`)
}
