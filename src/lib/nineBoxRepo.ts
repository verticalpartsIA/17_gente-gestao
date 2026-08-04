/**
 * PERSISTÊNCIA — MATRIZ 9-BOX (/desempenho?tab=9box)
 * ============================================================================
 *
 * Tabela: rh_nine_box_posicionamentos. Reaproveita rh_metas_ciclos como
 * conceito de ciclo (já genérico, não exclusivo de Metas).
 *
 * Diferente de Metas/Treinamentos, 9-Box não é dado que se deriva de outra
 * tabela — é avaliação manual do gestor (Performance x Potencial, 1-3 cada),
 * com justificativa. Não calcula Performance a partir de atingimento de
 * Metas nem de Avaliação de Desempenho (métrica diferente de avaliação de
 * performance, geraria falsa precisão) — decisão confirmada com o usuário.
 *
 * RLS deliberadamente restrita: só gestor direto de quem avalia e
 * Administrador — nem o próprio colaborador avaliado lê (dado sensível de
 * sucessão/calibração, mesmo padrão de rh_cargos_pj_compliance).
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export interface Posicionamento {
  id: string
  ciclo_id: string
  colaborador_id: string
  nota_performance: number
  nota_potencial: number
  justificativa: string | null
  avaliado_por: string | null
  created_at: string
  colaborador?: { name: string; department: string | null } | null
}

export async function listarPosicionamentos(cicloId?: string): Promise<Posicionamento[]> {
  if (isMockMode) return []
  let query = db
    .from('rh_nine_box_posicionamentos')
    .select('*, colaborador:profiles(name, department)')
    .order('created_at', { ascending: false })
  if (cicloId) query = query.eq('ciclo_id', cicloId)
  const { data, error } = await query
  if (error) throw new Error(`Não foi possível carregar a matriz 9-Box: ${error.message}`)
  return (data ?? []) as Posicionamento[]
}

export interface PosicionamentoInput {
  cicloId: string
  colaboradorId: string
  notaPerformance: number
  notaPotencial: number
  justificativa: string | null
  avaliadoPor: string
}

export async function posicionarColaborador(input: PosicionamentoInput): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')
  const { error } = await db.from('rh_nine_box_posicionamentos').upsert(
    {
      ciclo_id: input.cicloId,
      colaborador_id: input.colaboradorId,
      nota_performance: input.notaPerformance,
      nota_potencial: input.notaPotencial,
      justificativa: input.justificativa?.trim() || null,
      avaliado_por: input.avaliadoPor,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'ciclo_id,colaborador_id' },
  )
  if (error) throw new Error(`Não foi possível salvar o posicionamento: ${error.message}`)
}

export interface Celula {
  label: string
  cor: string
}

const CELULAS: Record<string, Celula> = {
  '3-3': { label: 'Estrela', cor: 'bg-green-50 border-green-300' },
  '3-2': { label: 'Forte Desempenho', cor: 'bg-green-50 border-green-200' },
  '3-1': { label: 'Especialista', cor: 'bg-blue-50 border-blue-200' },
  '2-3': { label: 'Alto Potencial', cor: 'bg-blue-50 border-blue-300' },
  '2-2': { label: 'Mantenedor Sólido', cor: 'bg-yellow-50 border-yellow-200' },
  '2-1': { label: 'Eficaz', cor: 'bg-yellow-50 border-yellow-200' },
  '1-3': { label: 'Enigma', cor: 'bg-orange-50 border-orange-200' },
  '1-2': { label: 'Dilema', cor: 'bg-orange-50 border-orange-200' },
  '1-1': { label: 'Risco', cor: 'bg-red-50 border-red-300' },
}

/** perf e pot vão de 1 (baixo) a 3 (alto). */
export function getCelula(perf: number, pot: number): Celula {
  return CELULAS[`${perf}-${pot}`] ?? { label: '—', cor: 'bg-neutral-50 border-neutral-200' }
}
