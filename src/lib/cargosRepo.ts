/**
 * PERSISTÊNCIA — CARGOS E SALÁRIOS (/gestao-talentos?tab=cargos)
 * ============================================================================
 *
 * Tabelas: rh_cargos, rh_cargos_faixa_clt, rh_cargos_pj_compliance.
 *
 * CLT e PJ exclusivo são modelos de remuneração diferentes de propósito —
 * PJ nunca tem "faixa salarial mensal" aqui (isso é o próprio risco de
 * pejotização irregular que o documento de referência descreve). PJ tem um
 * valor de referência por entrega/hora/marco + uma trilha de compliance
 * documentada (rh_cargos_pj_compliance) — NÃO é validação jurídica
 * automática, é registro de auditoria pro RH ter isso documentado.
 *
 * RLS: rh_cargos (nome/depto/nível/regime, sem valor) é legível por
 * qualquer colaborador autenticado; rh_cargos_faixa_clt e
 * rh_cargos_pj_compliance (dado sensível: salário, justificativa jurídica)
 * só Administrador lê e escreve — mesmo gate que contratacao_vagas.faixa_min/max
 * já usa. Por isso listarCargos() pode devolver faixaClt/pjCompliance como
 * null pra quem não é admin, mesmo cargo tendo esse registro.
 *
 * HC atual e Vagas em aberto NUNCA são colunas armazenadas — calculados ao
 * vivo cruzando com profiles.job_title/department e
 * contratacao_vagas.titulo_cargo/departamento (soft-match por nome, não FK;
 * profiles.job_title e contratacao_vagas.titulo_cargo continuam texto
 * livre nesta etapa).
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type CargoRegime = 'CLT' | 'PJ'
export type ModeloRemuneracaoPJ = 'entrega' | 'hora_tecnica' | 'marco_projeto'

export interface Cargo {
  id: string
  nome: string
  departamento: string
  regime: CargoRegime
  nivel: string | null
  cbo: string | null
  hc_aprovado: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CargoFaixaClt {
  cargo_id: string
  faixa_min: number
  faixa_max: number
  inclui_insalubridade: boolean
  inclui_periculosidade: boolean
  elegivel_plr: boolean
}

export interface CargoPjCompliance {
  cargo_id: string
  modelo_remuneracao: ModeloRemuneracaoPJ
  valor_referencia: number
  observacao_valor: string | null
  exclusividade: boolean
  justificativa_exclusividade: string | null
  subordinacao_hierarquica: boolean
  controle_ponto: boolean
  ferramentas_proprias: boolean
  revisado_em: string | null
  revisado_por: string | null
}

export interface CargoComContagem extends Cargo {
  faixaClt: CargoFaixaClt | null
  pjCompliance: CargoPjCompliance | null
  hcAtual: number
  vagasAbertas: number
}

const VAGA_STATUS_FECHADA = ['concluida', 'cancelada', 'recusada']

export async function listarCargos(): Promise<CargoComContagem[]> {
  if (isMockMode) return []

  const [{ data: cargos, error }, { data: profiles }, { data: vagas }] = await Promise.all([
    db
      .from('rh_cargos')
      .select('*, faixaClt:rh_cargos_faixa_clt(*), pjCompliance:rh_cargos_pj_compliance(*)')
      .eq('is_active', true)
      .order('nome'),
    db.from('profiles').select('job_title, department').eq('is_active', true),
    db.from('contratacao_vagas').select('titulo_cargo, departamento, status'),
  ])
  if (error) throw new Error(`Não foi possível carregar os cargos: ${error.message}`)

  return ((cargos ?? []) as any[]).map(c => {
    const hcAtual = (profiles ?? []).filter(
      (p: any) => p.job_title === c.nome && p.department === c.departamento,
    ).length
    const vagasAbertas = (vagas ?? []).filter(
      (v: any) => v.titulo_cargo === c.nome && v.departamento === c.departamento && !VAGA_STATUS_FECHADA.includes(v.status),
    ).length
    return {
      ...c,
      faixaClt: Array.isArray(c.faixaClt) ? c.faixaClt[0] ?? null : c.faixaClt,
      pjCompliance: Array.isArray(c.pjCompliance) ? c.pjCompliance[0] ?? null : c.pjCompliance,
      hcAtual,
      vagasAbertas,
    } as CargoComContagem
  })
}

/** Estrutura salarial por nível — só cargos CLT, PJ não tem "faixa" nesse sentido. */
export interface FaixaPorNivel {
  nivel: string
  min: number
  max: number
  med: number
}

export async function listarEstruturaSalarial(): Promise<FaixaPorNivel[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('rh_cargos')
    .select('nivel, faixa:rh_cargos_faixa_clt(faixa_min, faixa_max)')
    .eq('regime', 'CLT')
    .eq('is_active', true)
    .not('nivel', 'is', null)
  if (error) throw new Error(`Não foi possível carregar a estrutura salarial: ${error.message}`)

  const porNivel = new Map<string, { min: number; max: number }[]>()
  for (const c of (data ?? []) as any[]) {
    const faixa = Array.isArray(c.faixa) ? c.faixa[0] : c.faixa
    if (!c.nivel || !faixa) continue
    if (!porNivel.has(c.nivel)) porNivel.set(c.nivel, [])
    porNivel.get(c.nivel)!.push({ min: faixa.faixa_min, max: faixa.faixa_max })
  }

  return Array.from(porNivel.entries()).map(([nivel, faixas]) => {
    const min = Math.min(...faixas.map(f => f.min))
    const max = Math.max(...faixas.map(f => f.max))
    const med = faixas.reduce((s, f) => s + (f.min + f.max) / 2, 0) / faixas.length
    return { nivel, min, max, med }
  })
}

export async function listarDepartamentos(): Promise<string[]> {
  if (isMockMode) return []
  const { data, error } = await db.from('profiles').select('department').not('department', 'is', null)
  if (error) throw new Error(`Não foi possível carregar os departamentos: ${error.message}`)
  const unicos = new Set<string>((data ?? []).map((d: { department: string }) => d.department))
  return Array.from(unicos).sort()
}

export interface NovoCargoInput {
  nome: string
  departamento: string
  regime: CargoRegime
  nivel: string | null
  cbo: string | null
  hcAprovado: number
  // CLT
  faixaMin?: number
  faixaMax?: number
  incluiInsalubridade?: boolean
  incluiPericulosidade?: boolean
  elegivelPlr?: boolean
  // PJ
  modeloRemuneracao?: ModeloRemuneracaoPJ
  valorReferencia?: number
  observacaoValor?: string | null
  exclusividade?: boolean
  justificativaExclusividade?: string | null
  subordinacaoHierarquica?: boolean
  controlePonto?: boolean
  ferramentasProprias?: boolean
}

export async function criarCargo(input: NovoCargoInput): Promise<{ id: string }> {
  if (isMockMode) throw new Error('Gravação indisponível: o app está rodando sem as chaves do Supabase (modo simulado).')

  const { data: cargo, error } = await db
    .from('rh_cargos')
    .insert({
      nome: input.nome.trim(),
      departamento: input.departamento,
      regime: input.regime,
      nivel: input.nivel,
      cbo: input.cbo?.trim() || null,
      hc_aprovado: input.hcAprovado,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Não foi possível criar o cargo: ${error.message}`)

  if (input.regime === 'CLT') {
    const { error: faixaErr } = await db.from('rh_cargos_faixa_clt').insert({
      cargo_id: cargo.id,
      faixa_min: input.faixaMin,
      faixa_max: input.faixaMax,
      inclui_insalubridade: input.incluiInsalubridade ?? false,
      inclui_periculosidade: input.incluiPericulosidade ?? false,
      elegivel_plr: input.elegivelPlr ?? false,
    })
    if (faixaErr) throw new Error(`Cargo criado, mas não foi possível salvar a faixa salarial: ${faixaErr.message}`)
  } else {
    const { error: pjErr } = await db.from('rh_cargos_pj_compliance').insert({
      cargo_id: cargo.id,
      modelo_remuneracao: input.modeloRemuneracao,
      valor_referencia: input.valorReferencia,
      observacao_valor: input.observacaoValor?.trim() || null,
      exclusividade: input.exclusividade ?? false,
      justificativa_exclusividade: input.exclusividade ? input.justificativaExclusividade?.trim() || null : null,
      subordinacao_hierarquica: input.subordinacaoHierarquica ?? false,
      controle_ponto: input.controlePonto ?? false,
      ferramentas_proprias: input.ferramentasProprias ?? true,
    })
    if (pjErr) throw new Error(`Cargo criado, mas não foi possível salvar os dados de compliance PJ: ${pjErr.message}`)
  }

  return cargo as { id: string }
}
