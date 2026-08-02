import { describe, it, expect } from 'vitest'
import { buildOrgForest, treeDepth, deptVisibleIds, type ProfileRow } from './orgTree'

function row(id: string, name: string, department: string, manager_id: string | null, opts: Partial<ProfileRow> = {}): ProfileRow {
  return { id, name, department, manager_id, is_department_lead: false, avatar_url: null, ...opts }
}

describe('buildOrgForest', () => {
  it('monta múltiplos níveis a partir de manager_id', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('a', 'Gestor A', 'Vendas', 'ceo'),
      row('b', 'Analista B', 'Vendas', 'a'),
      row('c', 'Estagiário C', 'Vendas', 'b'),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(root?.reports[0].id).toBe('a')
    expect(root?.reports[0].reports[0].id).toBe('b')
    expect(root?.reports[0].reports[0].reports[0].id).toBe('c')
    expect(unpositioned).toHaveLength(0)
    expect(treeDepth(root!)).toBe(4)
  })

  it('colaborador sem gestor vira raiz isolada quando não é a raiz principal', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('solto', 'Sem Gestor', 'Financeiro', null),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(unpositioned.map(r => r.id)).toEqual(['solto'])
  })

  it('gestor sem subordinados tem reports vazio', () => {
    const rows = [row('ceo', 'CEO', 'CEO', null)]
    const { root } = buildOrgForest(rows)
    expect(root?.reports).toEqual([])
  })

  it('manager_id inválido (fora do conjunto carregado) vira órfão, não quebra a raiz', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('a', 'Gestor A', 'Vendas', 'ceo'),
      row('orfao', 'Orfao', 'Vendas', 'gestor-inativo-nao-carregado'),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(root?.reports.map(r => r.id)).toEqual(['a'])
    expect(unpositioned.map(r => r.id)).toEqual(['orfao'])
  })

  it('múltiplas raízes: escolhe a raiz principal (dept CEO) e reporta as demais como unpositioned', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('diretor-solto', 'Diretor Solto', 'Jurídico', null),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(unpositioned.map(r => r.id)).toEqual(['diretor-solto'])
  })

  it('ciclo hierárquico (A gerencia B, B gerencia A) não trava e não aparece pendurado na raiz', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('a', 'A', 'TI', 'b'),
      row('b', 'B', 'TI', 'a'),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(root?.reports).toEqual([])
    expect(unpositioned.map(r => r.id).sort()).toEqual(['a', 'b'])
  })

  it('auto-referência (manager_id === id) não causa loop e vira órfão', () => {
    const rows = [
      row('ceo', 'CEO', 'CEO', null),
      row('a', 'A', 'TI', 'a'),
    ]
    const { root, unpositioned } = buildOrgForest(rows)
    expect(root?.id).toBe('ceo')
    expect(unpositioned.map(r => r.id)).toEqual(['a'])
  })

  it('lista vazia retorna root null sem lançar erro', () => {
    expect(buildOrgForest([])).toEqual({ root: null, unpositioned: [] })
  })
})

describe('deptVisibleIds', () => {
  const rows = [
    row('ceo', 'CEO', 'CEO', null),
    row('a', 'Gestor A', 'Vendas', 'ceo'),
    row('b', 'Analista B (Financeiro, nível profundo)', 'Financeiro', 'a'),
    row('c', 'Estagiário C', 'Financeiro', 'b'),
    row('d', 'Outro time', 'Vendas', 'a'),
  ]
  const { root } = buildOrgForest(rows)

  it('"Todos" retorna todo mundo', () => {
    expect(deptVisibleIds(root!, 'Todos').size).toBe(5)
  })

  it('filtra por departamento em nível profundo mantendo a cadeia de ancestrais visível', () => {
    const visible = deptVisibleIds(root!, 'Financeiro')
    // b e c sao do Financeiro; a e ceo precisam ficar visiveis so pra manter o caminho ate a raiz
    expect(visible).toEqual(new Set(['ceo', 'a', 'b', 'c']))
    // d (Vendas, sem descendente Financeiro) fica de fora
    expect(visible.has('d')).toBe(false)
  })
})
