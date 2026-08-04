/**
 * PERSISTÊNCIA — TREINAMENTOS (/desempenho?tab=treinamentos)
 * ============================================================================
 *
 * Tabelas: rh_treinamentos (catálogo), rh_treinamentos_conclusoes (1 linha
 * por pessoa que concluiu — unique(treinamento_id, colaborador_id)).
 *
 * Público-alvo por nível (empresa/departamento/individual), mesmo modelo de
 * rh_metas_objetivos.nivel. Quem precisa completar e o status por pessoa
 * NUNCA são armazenados — calculados ao vivo cruzando profiles, mesmo
 * princípio de HC atual em cargosRepo.ts.
 *
 * Não tem relação nenhuma com o parceiro "VerticalParts Academy" do
 * Marketplace — aquele é dado fabricado (sem DemoDataBanner, promete
 * integração que não existe). Este é o catálogo interno real.
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type TreinamentoTipo = 'obrigatorio' | 'opcional'
export type NivelPublico = 'empresa' | 'departamento' | 'individual'
export type StatusConclusao = 'concluido' | 'pendente' | 'atrasado'

export interface Treinamento {
  id: string
  nome: string
  descricao: string | null
  tipo: TreinamentoTipo
  carga_horaria: number | null
  nivel_publico: NivelPublico
  departamento: string | null
  colaborador_id: string | null
  data_limite: string | null
  is_active: boolean
  criado_por: string | null
  created_at: string
}

export interface Conclusao {
  id: string
  treinamento_id: string
  colaborador_id: string
  concluido_em: string
  nota: number | null
  registrado_por: string | null
}

export interface TreinamentoComProgresso extends Treinamento {
  audienciaTotal: number
  concluidos: number
  progresso: number
}

export interface MembroAudiencia {
  colaboradorId: string
  nome: string
  department: string | null
  status: StatusConclusao
  concluidoEm: string | null
  nota: number | null
}

interface ProfileBasico {
  id: string
  name: string
  department: string | null
}

function publicoAlvo(t: Treinamento, profiles: ProfileBasico[]): ProfileBasico[] {
  if (t.nivel_publico === 'individual') return profiles.filter(p => p.id === t.colaborador_id)
  if (t.nivel_publico === 'departamento') return profiles.filter(p => p.department === t.departamento)
  return profiles
}

export async function listarTreinamentos(): Promise<TreinamentoComProgresso[]> {
  if (isMockMode) return []

  const [{ data: treinamentos, error }, { data: profiles }, { data: conclusoes }] = await Promise.all([
    db.from('rh_treinamentos').select('*').eq('is_active', true).order('nome'),
    db.from('profiles').select('id, name, department').eq('is_active', true),
    db.from('rh_treinamentos_conclusoes').select('treinamento_id, colaborador_id'),
  ])
  if (error) throw new Error(`Não foi possível carregar os treinamentos: ${error.message}`)

  return ((treinamentos ?? []) as Treinamento[]).map(t => {
    const audiencia = publicoAlvo(t, profiles ?? [])
    const audienciaIds = new Set(audiencia.map(p => p.id))
    const concluidos = (conclusoes ?? []).filter(
      (c: any) => c.treinamento_id === t.id && audienciaIds.has(c.colaborador_id),
    ).length
    return {
      ...t,
      audienciaTotal: audiencia.length,
      concluidos,
      progresso: audiencia.length > 0 ? Math.round((concluidos / audiencia.length) * 100) : 0,
    }
  })
}

export async function listarAudiencia(treinamentoId: string): Promise<MembroAudiencia[]> {
  if (isMockMode) return []

  const { data: treinamento, error } = await db.from('rh_treinamentos').select('*').eq('id', treinamentoId).single()
  if (error || !treinamento) throw new Error('Treinamento não encontrado.')

  const [{ data: profiles }, { data: conclusoes }] = await Promise.all([
    db.from('profiles').select('id, name, department').eq('is_active', true),
    db.from('rh_treinamentos_conclusoes').select('*').eq('treinamento_id', treinamentoId),
  ])

  const conclusaoPorPessoa = new Map<string, Conclusao>((conclusoes ?? []).map((c: Conclusao) => [c.colaborador_id, c]))
  const hoje = new Date().toISOString().slice(0, 10)
  const vencido = treinamento.data_limite && treinamento.data_limite < hoje

  return publicoAlvo(treinamento as Treinamento, profiles ?? []).map(p => {
    const c = conclusaoPorPessoa.get(p.id)
    const status: StatusConclusao = c ? 'concluido' : vencido ? 'atrasado' : 'pendente'
    return { colaboradorId: p.id, nome: p.name, department: p.department, status, concluidoEm: c?.concluido_em ?? null, nota: c?.nota ?? null }
  })
}

export interface NovoTreinamentoInput {
  nome: string
  descricao: string | null
  tipo: TreinamentoTipo
  cargaHoraria: number | null
  nivelPublico: NivelPublico
  departamento: string | null
  colaboradorId: string | null
  dataLimite: string | null
  criadoPor: string
}

export async function criarTreinamento(input: NovoTreinamentoInput): Promise<{ id: string }> {
  if (isMockMode) throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')
  const { data, error } = await db
    .from('rh_treinamentos')
    .insert({
      nome: input.nome.trim(),
      descricao: input.descricao?.trim() || null,
      tipo: input.tipo,
      carga_horaria: input.cargaHoraria,
      nivel_publico: input.nivelPublico,
      departamento: input.nivelPublico === 'departamento' ? input.departamento : null,
      colaborador_id: input.nivelPublico === 'individual' ? input.colaboradorId : null,
      data_limite: input.dataLimite,
      criado_por: input.criadoPor,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Não foi possível criar o treinamento: ${error.message}`)
  return data as { id: string }
}

export async function marcarConclusao(
  treinamentoId: string,
  colaboradorId: string,
  registradoPor: string,
  nota?: number | null,
): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db.from('rh_treinamentos_conclusoes').insert({
    treinamento_id: treinamentoId,
    colaborador_id: colaboradorId,
    registrado_por: registradoPor,
    nota: nota ?? null,
  })
  if (error) {
    if (error.code === '23505') throw new Error('Esta pessoa já está marcada como concluída neste treinamento.')
    throw new Error(`Não foi possível registrar a conclusão: ${error.message}`)
  }
}
