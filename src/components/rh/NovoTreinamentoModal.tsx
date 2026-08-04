import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { listarDepartamentos } from '@/lib/cargosRepo'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import { criarTreinamento, type NivelPublico, type TreinamentoTipo } from '@/lib/treinamentosRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
}

const NIVEIS: { valor: NivelPublico; label: string }[] = [
  { valor: 'empresa', label: 'Empresa toda' },
  { valor: 'departamento', label: 'Departamento' },
  { valor: 'individual', label: 'Pessoa específica' },
]

const inputClass =
  'w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

interface Colaborador {
  id: string
  name: string
  department: string | null
}

export function NovoTreinamentoModal({ open, onClose, onSalvo }: Props) {
  const { profile } = useAuth()
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TreinamentoTipo>('obrigatorio')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [nivelPublico, setNivelPublico] = useState<NivelPublico>('empresa')
  const [departamento, setDepartamento] = useState('')
  const [colaboradorId, setColaboradorId] = useState('')
  const [dataLimite, setDataLimite] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open || !persistenciaDisponivel()) return
    listarDepartamentos().then(setDepartamentos).catch(() => setDepartamentos([]))
    ;(supabase as any)
      .from('profiles')
      .select('id, name, department')
      .eq('is_active', true)
      .eq('is_placeholder', false)
      .order('name')
      .then(({ data }: any) => setColaboradores(data ?? []))
  }, [open])

  function reiniciar() {
    setNome(''); setDescricao(''); setTipo('obrigatorio'); setCargaHoraria('')
    setNivelPublico('empresa'); setDepartamento(''); setColaboradorId(''); setDataLimite('')
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar =
    !!profile &&
    nome.trim() !== '' &&
    (nivelPublico !== 'departamento' || departamento !== '') &&
    (nivelPublico !== 'individual' || colaboradorId !== '') &&
    !salvando

  async function salvar() {
    if (!profile) return
    setSalvando(true)
    setErro(null)
    try {
      await criarTreinamento({
        nome,
        descricao: descricao || null,
        tipo,
        cargaHoraria: cargaHoraria === '' ? null : Number(cargaHoraria),
        nivelPublico,
        departamento: nivelPublico === 'departamento' ? departamento : null,
        colaboradorId: nivelPublico === 'individual' ? colaboradorId : null,
        dataLimite: dataLimite || null,
        criadoPor: profile.id,
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Novo Treinamento" className="my-auto w-full max-w-lg rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-bold text-neutral-900">Novo Treinamento</h2>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nome *</span>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: NR-35 Trabalho em Altura" className={inputClass} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Descrição</span>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Tipo *</span>
              <select value={tipo} onChange={e => setTipo(e.target.value as TreinamentoTipo)} className={`${inputClass} bg-white`}>
                <option value="obrigatorio">Obrigatório</option>
                <option value="opcional">Opcional</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Carga horária (h)</span>
              <input type="number" min="0" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Público-alvo *</span>
            <select value={nivelPublico} onChange={e => setNivelPublico(e.target.value as NivelPublico)} className={`${inputClass} bg-white`}>
              {NIVEIS.map(n => <option key={n.valor} value={n.valor}>{n.label}</option>)}
            </select>
          </label>

          {nivelPublico === 'departamento' && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento *</span>
              <select value={departamento} onChange={e => setDepartamento(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Selecione</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          )}

          {nivelPublico === 'individual' && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador *</span>
              <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Selecione</option>
                {colaboradores.map(c => <option key={c.id} value={c.id}>{c.name}{c.department ? ` — ${c.department}` : ''}</option>)}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Prazo (opcional)</span>
            <input type="date" value={dataLimite} onChange={e => setDataLimite(e.target.value)} className={inputClass} />
          </label>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Modo simulado — este treinamento não será gravado.</strong></span>
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
              <span><strong>Treinamento criado.</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button size="sm" disabled={!podeSalvar || salvo} loading={salvando} leftIcon={<Save className="h-4 w-4" />} onClick={salvar}>
            {salvo ? 'Criado' : salvando ? 'Salvando…' : 'Criar Treinamento'}
          </Button>
        </div>
      </div>
    </div>
  )
}
