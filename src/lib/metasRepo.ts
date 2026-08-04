/**
 * PERSISTÊNCIA — GESTÃO DE METAS (OKR) (/desempenho?tab=metas)
 * ============================================================================
 *
 * Tabelas: rh_metas_ciclos, rh_metas_objetivos, rh_metas_resultados_chave,
 * rh_metas_checkins.
 *
 * Modelo único: OKR. Um Objetivo (qualitativo) tem N Key Results
 * (quantitativos) — uma meta SMART simples é, na prática, um Objetivo com 1
 * único Key Result. Cascateamento corporativa → área → individual via
 * objetivo_pai_id (self-FK), mesma ideia de manager_id/orgTree.ts.
 *
 * Peso somando 100%: validado aqui (getSomaPesoAtivo), não em constraint de
 * banco — um ciclo em montagem passa por estados com soma ≠ 100% antes de
 * fechar, travar isso no schema bloquearia trabalho legítimo em andamento.
 *
 * Regime CLT/PJ da pessoa é inferido pelo cargo dela (profiles.job_title +
 * department cruzado com rh_cargos.regime) — mesmo soft-match e mesma
 * ressalva de cargosRepo.ts, sem FK travada nesta etapa.
 *
 * RLS: dono do objetivo e gestor direto (profiles.manager_id) veem os
 * próprios; objetivos de nível "área"/"corporativa" (sem colaborador_id) são
 * visíveis a qualquer autenticado; Administrador vê tudo. Visão multi-nível
 * completa de cascateamento fica reservada a Administrador nesta etapa.
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type CicloTipo = 'trimestral' | 'semestral' | 'anual'
export type CicloStatus = 'planejamento' | 'ativo' | 'encerrado'
export type ObjetivoNivel = 'corporativa' | 'area' | 'individual'
export type TipoIndicador = 'financeiro' | 'operacional' | 'qualidade' | 'projetos'
export type ObjetivoStatus = 'nao_iniciado' | 'em_andamento' | 'atrasado' | 'concluido'
export type UnidadeMedida = 'reais' | 'percentual' | 'unidades' | 'horas'

export interface Ciclo {
  id: string
  nome: string
  tipo: CicloTipo
  data_inicio: string
  data_fim: string
  status: CicloStatus
}

export interface ResultadoChave {
  id: string
  objetivo_id: string
  titulo: string
  unidade_medida: UnidadeMedida
  linha_base: number
  meta_alvo: number
  valor_atual: number
}

export interface Checkin {
  id: string
  resultado_chave_id: string
  valor_anterior: number
  valor_novo: number
  comentario: string | null
  autor_id: string | null
  criado_em: string
}

export interface Objetivo {
  id: string
  ciclo_id: string
  titulo: string
  descricao: string | null
  tipo_indicador: TipoIndicador
  nivel: ObjetivoNivel
  departamento: string | null
  colaborador_id: string | null
  objetivo_pai_id: string | null
  peso: number
  status: ObjetivoStatus
  criado_por: string | null
  created_at: string
  updated_at: string
  colaborador?: { name: string; department: string | null; job_title: string | null } | null
  resultadosChave: ResultadoChave[]
}

/** Progresso 0-100 de um Key Result — clampado, e 0 se meta_alvo == linha_base (evita divisão por zero). */
export function progressoResultadoChave(r: ResultadoChave): number {
  if (r.meta_alvo === r.linha_base) return r.valor_atual >= r.meta_alvo ? 100 : 0
  const pct = ((r.valor_atual - r.linha_base) / (r.meta_alvo - r.linha_base)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

/** Progresso agregado do objetivo — média dos KRs. */
export function progressoObjetivo(o: Objetivo): number {
  if (o.resultadosChave.length === 0) return 0
  const soma = o.resultadosChave.reduce((s, r) => s + progressoResultadoChave(r), 0)
  return Math.round(soma / o.resultadosChave.length)
}

export async function listarCiclos(): Promise<Ciclo[]> {
  if (isMockMode) return []
  const { data, error } = await db.from('rh_metas_ciclos').select('*').order('data_inicio', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar os ciclos: ${error.message}`)
  return (data ?? []) as Ciclo[]
}

export interface FiltrosObjetivos {
  cicloId?: string
  departamento?: string
  colaboradorId?: string
  regime?: 'CLT' | 'PJ'
}

export async function listarObjetivos(filtros: FiltrosObjetivos = {}): Promise<Objetivo[]> {
  if (isMockMode) return []

  let query = db
    .from('rh_metas_objetivos')
    .select('*, colaborador:profiles(name, department, job_title), resultadosChave:rh_metas_resultados_chave(*)')
    .order('created_at', { ascending: false })

  if (filtros.cicloId) query = query.eq('ciclo_id', filtros.cicloId)
  if (filtros.departamento) query = query.eq('departamento', filtros.departamento)
  if (filtros.colaboradorId) query = query.eq('colaborador_id', filtros.colaboradorId)

  const { data, error } = await query
  if (error) throw new Error(`Não foi possível carregar os objetivos: ${error.message}`)

  let objetivos = ((data ?? []) as any[]).map(o => ({
    ...o,
    resultadosChave: o.resultadosChave ?? [],
  })) as Objetivo[]

  if (filtros.regime) {
    const { data: cargos } = await db.from('rh_cargos').select('nome, departamento, regime')
    const regimeDoCargo = new Map<string, string>((cargos ?? []).map((c: any) => [`${c.nome}::${c.departamento}`, c.regime]))
    objetivos = objetivos.filter(o => {
      if (!o.colaborador?.job_title || !o.colaborador?.department) return false
      const regime = regimeDoCargo.get(`${o.colaborador.job_title}::${o.colaborador.department}`)
      return regime === filtros.regime
    })
  }

  return objetivos
}

/** Soma de peso dos objetivos ativos (não concluídos) de um colaborador num ciclo — pro aviso de "deveria somar 100%". */
export async function getSomaPesoAtivo(colaboradorId: string, cicloId: string): Promise<number> {
  if (isMockMode) return 0
  const { data, error } = await db
    .from('rh_metas_objetivos')
    .select('peso')
    .eq('colaborador_id', colaboradorId)
    .eq('ciclo_id', cicloId)
  if (error) throw new Error(`Não foi possível calcular o peso: ${error.message}`)
  return (data ?? []).reduce((s: number, o: { peso: number }) => s + o.peso, 0)
}

export interface NovoResultadoChaveInput {
  titulo: string
  unidadeMedida: UnidadeMedida
  linhaBase: number
  metaAlvo: number
}

export interface NovoObjetivoInput {
  cicloId: string
  titulo: string
  descricao: string | null
  tipoIndicador: TipoIndicador
  nivel: ObjetivoNivel
  departamento: string | null
  colaboradorId: string | null
  objetivoPaiId: string | null
  peso: number
  criadoPor: string
  resultadosChave: NovoResultadoChaveInput[]
}

export async function criarObjetivo(input: NovoObjetivoInput): Promise<{ id: string }> {
  if (isMockMode) throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')

  const { data: objetivo, error } = await db
    .from('rh_metas_objetivos')
    .insert({
      ciclo_id: input.cicloId,
      titulo: input.titulo.trim(),
      descricao: input.descricao?.trim() || null,
      tipo_indicador: input.tipoIndicador,
      nivel: input.nivel,
      departamento: input.departamento,
      colaborador_id: input.colaboradorId,
      objetivo_pai_id: input.objetivoPaiId,
      peso: input.peso,
      criado_por: input.criadoPor,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Não foi possível criar o objetivo: ${error.message}`)

  if (input.resultadosChave.length > 0) {
    const { error: krErr } = await db.from('rh_metas_resultados_chave').insert(
      input.resultadosChave.map(r => ({
        objetivo_id: objetivo.id,
        titulo: r.titulo.trim(),
        unidade_medida: r.unidadeMedida,
        linha_base: r.linhaBase,
        meta_alvo: r.metaAlvo,
        valor_atual: r.linhaBase,
      })),
    )
    if (krErr) throw new Error(`Objetivo criado, mas não foi possível salvar os resultados-chave: ${krErr.message}`)
  }

  return objetivo as { id: string }
}

export async function listarCheckins(resultadoChaveId: string): Promise<Checkin[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('rh_metas_checkins')
    .select('*')
    .eq('resultado_chave_id', resultadoChaveId)
    .order('criado_em', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar o histórico: ${error.message}`)
  return (data ?? []) as Checkin[]
}

export async function registrarCheckin(
  resultadoChaveId: string,
  valorNovo: number,
  comentario: string | null,
  autorId: string,
): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')

  const { data: resultado, error: leituraErr } = await db
    .from('rh_metas_resultados_chave')
    .select('valor_atual')
    .eq('id', resultadoChaveId)
    .single()
  if (leituraErr || !resultado) throw new Error('Resultado-chave não encontrado.')

  const { error: checkinErr } = await db.from('rh_metas_checkins').insert({
    resultado_chave_id: resultadoChaveId,
    valor_anterior: resultado.valor_atual,
    valor_novo: valorNovo,
    comentario: comentario?.trim() || null,
    autor_id: autorId,
  })
  if (checkinErr) throw new Error(`Não foi possível registrar o check-in: ${checkinErr.message}`)

  const { error: updateErr } = await db
    .from('rh_metas_resultados_chave')
    .update({ valor_atual: valorNovo })
    .eq('id', resultadoChaveId)
  if (updateErr) throw new Error(`Check-in registrado, mas não foi possível atualizar o valor atual: ${updateErr.message}`)
}

export interface KpisMetas {
  ativas: number
  noPrazo: number
  atrasadas: number
  concluidasPct: number
}

/** KPIs agregados — usados no topo de PerformancePage e no card "Metas Atingidas" do Dashboard. */
export async function calcularKpis(cicloId?: string): Promise<KpisMetas> {
  if (isMockMode) return { ativas: 0, noPrazo: 0, atrasadas: 0, concluidasPct: 0 }
  let query = db.from('rh_metas_objetivos').select('status')
  if (cicloId) query = query.eq('ciclo_id', cicloId)
  const { data, error } = await query
  if (error) throw new Error(`Não foi possível calcular os KPIs de metas: ${error.message}`)

  const objetivos = (data ?? []) as { status: ObjetivoStatus }[]
  const total = objetivos.length
  const concluidas = objetivos.filter(o => o.status === 'concluido').length
  const atrasadas = objetivos.filter(o => o.status === 'atrasado').length
  const ativas = objetivos.filter(o => o.status === 'em_andamento' || o.status === 'nao_iniciado').length

  return {
    ativas,
    noPrazo: total - atrasadas - concluidas,
    atrasadas,
    concluidasPct: total > 0 ? Math.round((concluidas / total) * 100) : 0,
  }
}
