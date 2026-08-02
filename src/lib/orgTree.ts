// Lógica pura de montagem da árvore hierárquica do Organograma (/organograma).
// Extraída da página para ser testável sem React e reutilizável por quem
// mais precisar da estrutura de gestão (ver cabeçalho de OrganogramaPage.tsx
// para o mapa de rotas precedentes/dependentes).

export interface ProfileRow {
  id: string
  name: string
  department: string
  is_department_lead: boolean
  avatar_url: string | null
  manager_id: string | null
  job_title?: string | null
  unit?: string | null
}

export interface OrgNode extends ProfileRow {
  reports: OrgNode[]
}

export interface OrgForestResult {
  /** Raiz principal exibida (CEO, ou quem estiver mais perto disso). Null se não houver dados. */
  root: OrgNode | null
  /**
   * Pessoas que NÃO entraram na árvore da raiz principal: outras raízes
   * declaradas (sem manager_id ou com manager_id fora do conjunto
   * carregado) e qualquer nó cortado por detecção de ciclo. Nunca são
   * descartadas silenciosamente — a página deve avisar sobre elas.
   */
  unpositioned: ProfileRow[]
}

/**
 * Monta a árvore a partir de manager_id. Trata explicitamente os casos que
 * antes quebravam silenciosamente:
 * - múltiplas pessoas sem manager_id (múltiplas raízes): só uma vira a raiz
 *   exibida, as demais entram em `unpositioned` em vez de sobrescrever a raiz;
 * - manager_id apontando para alguém fora do conjunto carregado (ex.: gestor
 *   inativo/filtrado): a pessoa também vira uma raiz "órfã" em `unpositioned`;
 * - ciclos (A gerencia B, B gerencia A): a segunda ocorrência de um id já
 *   visitado é cortada durante a montagem, então a recursão de render nunca
 *   entra em loop infinito; os nós presos no ciclo aparecem em `unpositioned`.
 */
export function buildOrgForest(rows: ProfileRow[]): OrgForestResult {
  if (rows.length === 0) return { root: null, unpositioned: [] }

  const byId = new Map<string, ProfileRow>(rows.map(r => [r.id, r]))
  const nodeOf = new Map<string, OrgNode>(rows.map(r => [r.id, { ...r, reports: [] }]))

  const childrenByManager = new Map<string, ProfileRow[]>()
  for (const r of rows) {
    if (r.manager_id && r.manager_id !== r.id && byId.has(r.manager_id)) {
      if (!childrenByManager.has(r.manager_id)) childrenByManager.set(r.manager_id, [])
      childrenByManager.get(r.manager_id)!.push(r)
    }
  }

  // Raiz "de verdade": sem manager_id algum. Se houver mais de uma,
  // prioriza quem está no departamento CEO; senão pega a primeira por nome
  // (determinístico) e as outras vão para unpositioned.
  const trueRoots = rows
    .filter(r => !r.manager_id)
    .sort((a, b) => a.name.localeCompare(b.name))
  const primary =
    trueRoots.find(r => r.department === 'CEO') ??
    trueRoots[0] ??
    // Sem nenhuma raiz "de verdade" (todo mundo tem manager_id, possivelmente
    // todos apontando pra fora do conjunto ou em ciclo): usa como raiz
    // provisória quem tem mais liderados diretos, só para não deixar a tela
    // em branco.
    [...rows].sort(
      (a, b) => (childrenByManager.get(b.id)?.length ?? 0) - (childrenByManager.get(a.id)?.length ?? 0)
    )[0]

  if (!primary) return { root: null, unpositioned: rows }

  const visited = new Set<string>()
  function attach(id: string): void {
    if (visited.has(id)) return
    visited.add(id)
    const node = nodeOf.get(id)!
    const children = (childrenByManager.get(id) ?? []).filter(c => !visited.has(c.id))
    node.reports = children.map(c => {
      attach(c.id)
      return nodeOf.get(c.id)!
    })
  }
  attach(primary.id)

  const unpositioned = rows.filter(r => r.id !== primary.id && !visited.has(r.id))

  return { root: nodeOf.get(primary.id)!, unpositioned }
}

export function treeDepth(node: OrgNode): number {
  if (node.reports.length === 0) return 1
  return 1 + Math.max(...node.reports.map(treeDepth))
}

export function allIds(node: OrgNode): Set<string> {
  const ids = new Set<string>([node.id])
  for (const child of node.reports) {
    for (const id of allIds(child)) ids.add(id)
  }
  return ids
}

/**
 * IDs visíveis para um filtro de departamento: quem está NESSE departamento
 * em qualquer profundidade da árvore, mais toda a cadeia de ancestrais até a
 * raiz (pra manter o caminho visível). Corrige o bug do filtro antigo, que só
 * olhava os subordinados diretos da raiz e escondia gente em níveis mais
 * profundos de outro departamento no meio do caminho.
 */
export function deptVisibleIds(root: OrgNode, dept: string): Set<string> {
  if (dept === 'Todos') return allIds(root)
  const visible = new Set<string>()
  function walk(node: OrgNode, ancestors: OrgNode[]) {
    const path = [...ancestors, node]
    if (node.department === dept) {
      for (const n of path) visible.add(n.id)
    }
    for (const child of node.reports) walk(child, path)
  }
  walk(root, [])
  return visible
}
