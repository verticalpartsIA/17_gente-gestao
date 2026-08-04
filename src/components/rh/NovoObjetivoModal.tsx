import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { listarDepartamentos } from '@/lib/cargosRepo'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import {
  criarObjetivo,
  getSomaPesoAtivo,
  listarCiclos,
  listarObjetivos,
  type Ciclo,
  type Objetivo,
  type ObjetivoNivel,
  type TipoIndicador,
  type UnidadeMedida,
  type NovoResultadoChaveInput,
} from '@/lib/metasRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
}

const NIVEIS: { valor: ObjetivoNivel; label: string }[] = [
  { valor: 'corporativa', label: 'Corporativa' },
  { valor: 'area', label: 'Área' },
  { valor: 'individual', label: 'Individual' },
]

const TIPOS_INDICADOR: { valor: TipoIndicador; label: string }[] = [
  { valor: 'financeiro', label: 'Financeiro' },
  { valor: 'operacional', label: 'Operacional' },
  { valor: 'qualidade', label: 'Qualidade' },
  { valor: 'projetos', label: 'Projetos' },
]

const UNIDADES: { valor: UnidadeMedida; label: string }[] = [
  { valor: 'reais', label: 'R$' },
  { valor: 'percentual', label: '%' },
  { valor: 'unidades', label: 'Unidades' },
  { valor: 'horas', label: 'Horas' },
]

const inputClass =
  'w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

interface Colaborador {
  id: string
  name: string
  department: string | null
}

export function NovoObjetivoModal({ open, onClose, onSalvo }: Props) {
  const { profile } = useAuth()
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [objetivosDoCiclo, setObjetivosDoCiclo] = useState<Objetivo[]>([])

  const [cicloId, setCicloId] = useState('')
  const [nivel, setNivel] = useState<ObjetivoNivel>('individual')
  const [departamento, setDepartamento] = useState('')
  const [colaboradorId, setColaboradorId] = useState('')
  const [objetivoPaiId, setObjetivoPaiId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipoIndicador, setTipoIndicador] = useState<TipoIndicador>('operacional')
  const [peso, setPeso] = useState('20')
  const [somaPesoAtual, setSomaPesoAtual] = useState<number | null>(null)

  const [resultadosChave, setResultadosChave] = useState<NovoResultadoChaveInput[]>([
    { titulo: '', unidadeMedida: 'percentual', linhaBase: 0, metaAlvo: 100 },
  ])

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open || !persistenciaDisponivel()) return
    listarCiclos().then(setCiclos).catch(() => setCiclos([]))
    listarDepartamentos().then(setDepartamentos).catch(() => setDepartamentos([]))
    ;(supabase as any)
      .from('profiles')
      .select('id, name, department')
      .eq('is_active', true)
      .eq('is_placeholder', false)
      .order('name')
      .then(({ data }: any) => setColaboradores(data ?? []))
  }, [open])

  useEffect(() => {
    if (!open || !cicloId || !persistenciaDisponivel()) { setObjetivosDoCiclo([]); return }
    listarObjetivos({ cicloId }).then(setObjetivosDoCiclo).catch(() => setObjetivosDoCiclo([]))
  }, [open, cicloId])

  useEffect(() => {
    if (!colaboradorId || !cicloId || !persistenciaDisponivel()) { setSomaPesoAtual(null); return }
    getSomaPesoAtivo(colaboradorId, cicloId).then(setSomaPesoAtual).catch(() => setSomaPesoAtual(null))
  }, [colaboradorId, cicloId])

  function reiniciar() {
    setCicloId(''); setNivel('individual'); setDepartamento(''); setColaboradorId(''); setObjetivoPaiId('')
    setTitulo(''); setDescricao(''); setTipoIndicador('operacional'); setPeso('20'); setSomaPesoAtual(null)
    setResultadosChave([{ titulo: '', unidadeMedida: 'percentual', linhaBase: 0, metaAlvo: 100 }])
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  function atualizarKr(index: number, patch: Partial<NovoResultadoChaveInput>) {
    setResultadosChave(krs => krs.map((kr, i) => (i === index ? { ...kr, ...patch } : kr)))
  }

  const podeSalvar =
    !!profile &&
    cicloId !== '' &&
    titulo.trim() !== '' &&
    (nivel !== 'area' || departamento !== '') &&
    (nivel !== 'individual' || colaboradorId !== '') &&
    resultadosChave.length > 0 &&
    resultadosChave.every(kr => kr.titulo.trim() !== '' && kr.metaAlvo !== kr.linhaBase) &&
    !salvando

  async function salvar() {
    if (!profile) return
    setSalvando(true)
    setErro(null)
    try {
      await criarObjetivo({
        cicloId,
        titulo,
        descricao: descricao || null,
        tipoIndicador,
        nivel,
        departamento: nivel === 'individual' ? colaboradores.find(c => c.id === colaboradorId)?.department ?? null : nivel === 'area' ? departamento : null,
        colaboradorId: nivel === 'individual' ? colaboradorId : null,
        objetivoPaiId: objetivoPaiId || null,
        peso: Number(peso) || 0,
        criadoPor: profile.id,
        resultadosChave,
      })
      setSalvo(true)
      onSalvo?.()
      setTimeout(fechar, 1200)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado ao gravar.')
    } finally {
      setSalvando(false)
    }
  }

  if (!open) return null

  const somaComEsta = (somaPesoAtual ?? 0) + (Number(peso) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Novo Objetivo" className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Novo Objetivo (OKR)</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Uma meta SMART simples é um Objetivo com 1 único Resultado-Chave.</p>
          </div>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ciclo *</span>
              <select value={cicloId} onChange={e => setCicloId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Selecione o ciclo</option>
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nível *</span>
              <select value={nivel} onChange={e => setNivel(e.target.value as ObjetivoNivel)} className={`${inputClass} bg-white`}>
                {NIVEIS.map(n => <option key={n.valor} value={n.valor}>{n.label}</option>)}
              </select>
            </label>

            {nivel === 'area' && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento *</span>
                <select value={departamento} onChange={e => setDepartamento(e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Selecione</option>
                  {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            )}

            {nivel === 'individual' && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador *</span>
                <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Selecione</option>
                  {colaboradores.map(c => <option key={c.id} value={c.id}>{c.name}{c.department ? ` — ${c.department}` : ''}</option>)}
                </select>
              </label>
            )}

            {objetivosDoCiclo.length > 0 && (
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Cascateado de (opcional)</span>
                <select value={objetivoPaiId} onChange={e => setObjetivoPaiId(e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Nenhum — objetivo independente</option>
                  {objetivosDoCiclo.map(o => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                </select>
              </label>
            )}

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Título do objetivo *</span>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Reduzir custo de frete em 15%" className={inputClass} />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Descrição</span>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Tipo de indicador *</span>
              <select value={tipoIndicador} onChange={e => setTipoIndicador(e.target.value as TipoIndicador)} className={`${inputClass} bg-white`}>
                {TIPOS_INDICADOR.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Peso (%) *</span>
              <input type="number" min="0" max="100" value={peso} onChange={e => setPeso(e.target.value)} className={inputClass} />
              {somaPesoAtual !== null && (
                <span className={`mt-1 block text-[11px] ${somaComEsta > 100 ? 'text-red-600' : 'text-neutral-500'}`}>
                  Soma de peso do colaborador no ciclo: {somaPesoAtual}% + este = {somaComEsta}% {somaComEsta > 100 && '(passou de 100%)'}
                </span>
              )}
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Resultados-Chave (Key Results) *</span>
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setResultadosChave(krs => [...krs, { titulo: '', unidadeMedida: 'percentual', linhaBase: 0, metaAlvo: 100 }])}>
                Adicionar
              </Button>
            </div>
            {resultadosChave.map((kr, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-end rounded border border-neutral-200 p-3">
                <input
                  placeholder="Título do resultado-chave"
                  value={kr.titulo}
                  onChange={e => atualizarKr(i, { titulo: e.target.value })}
                  className={`${inputClass} sm:col-span-5`}
                />
                <select value={kr.unidadeMedida} onChange={e => atualizarKr(i, { unidadeMedida: e.target.value as UnidadeMedida })} className={`${inputClass} bg-white sm:col-span-2`}>
                  {UNIDADES.map(u => <option key={u.valor} value={u.valor}>{u.label}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Linha base"
                  value={kr.linhaBase}
                  onChange={e => atualizarKr(i, { linhaBase: Number(e.target.value) })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <input
                  type="number"
                  placeholder="Meta alvo"
                  value={kr.metaAlvo}
                  onChange={e => atualizarKr(i, { metaAlvo: Number(e.target.value) })}
                  className={`${inputClass} sm:col-span-2`}
                />
                <button
                  type="button"
                  className="sm:col-span-1 flex items-center justify-center text-neutral-400 hover:text-red-600"
                  onClick={() => setResultadosChave(krs => krs.filter((_, j) => j !== i))}
                  disabled={resultadosChave.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Modo simulado — este objetivo não será gravado.</strong> O app está rodando sem as chaves do Supabase.</span>
            </div>
          )}
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Não foi possível gravar.</strong> {erro}</span>
            </div>
          )}
          {salvo && (
            <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-xs text-green-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Objetivo criado.</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button size="sm" disabled={!podeSalvar || salvo} loading={salvando} leftIcon={<Save className="h-4 w-4" />} onClick={salvar}>
            {salvo ? 'Criado' : salvando ? 'Salvando…' : 'Criar Objetivo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
