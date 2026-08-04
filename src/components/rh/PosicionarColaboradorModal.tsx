import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import { listarCiclos, type Ciclo } from '@/lib/metasRepo'
import { posicionarColaborador } from '@/lib/nineBoxRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
}

const NOTAS = [
  { valor: 1, label: 'Baixa(o)' },
  { valor: 2, label: 'Média(o)' },
  { valor: 3, label: 'Alta(o)' },
]

const inputClass =
  'w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

interface Colaborador {
  id: string
  name: string
  department: string | null
}

export function PosicionarColaboradorModal({ open, onClose, onSalvo }: Props) {
  const { profile } = useAuth()
  const souAdministrador = profile?.level === 'Administrador'
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])

  const [colaboradorId, setColaboradorId] = useState('')
  const [cicloId, setCicloId] = useState('')
  const [notaPerformance, setNotaPerformance] = useState(2)
  const [notaPotencial, setNotaPotencial] = useState(2)
  const [justificativa, setJustificativa] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open || !profile || !persistenciaDisponivel()) return
    listarCiclos().then(setCiclos).catch(() => setCiclos([]))
    const query = (supabase as any)
      .from('profiles')
      .select('id, name, department')
      .eq('is_active', true)
      .eq('is_placeholder', false)
      .order('name')
    const filtrada = souAdministrador ? query : query.eq('manager_id', profile.id)
    filtrada.then(({ data }: any) => setColaboradores(data ?? []))
  }, [open, profile, souAdministrador])

  function reiniciar() {
    setColaboradorId(''); setCicloId(''); setNotaPerformance(2); setNotaPotencial(2); setJustificativa('')
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar = !!profile && colaboradorId !== '' && cicloId !== '' && !salvando

  async function salvar() {
    if (!profile) return
    setSalvando(true)
    setErro(null)
    try {
      await posicionarColaborador({
        cicloId,
        colaboradorId,
        notaPerformance,
        notaPotencial,
        justificativa: justificativa || null,
        avaliadoPor: profile.id,
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
      <div role="dialog" aria-modal="true" aria-label="Posicionar Colaborador" className="my-auto w-full max-w-lg rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Posicionar na Matriz 9-Box</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Visível só para você (gestor direto) e Administradores.</p>
          </div>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Colaborador *</span>
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">Selecione</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.name}{c.department ? ` — ${c.department}` : ''}</option>)}
            </select>
            {colaboradores.length === 0 && (
              <span className="mt-1 block text-[11px] text-neutral-400">
                {souAdministrador ? 'Nenhum colaborador ativo encontrado.' : 'Você não tem subordinados diretos cadastrados.'}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ciclo *</span>
            <select value={cicloId} onChange={e => setCicloId(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">Selecione o ciclo</option>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Performance *</span>
              <select value={notaPerformance} onChange={e => setNotaPerformance(Number(e.target.value))} className={`${inputClass} bg-white`}>
                {NOTAS.map(n => <option key={n.valor} value={n.valor}>{n.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Potencial *</span>
              <select value={notaPotencial} onChange={e => setNotaPotencial(Number(e.target.value))} className={`${inputClass} bg-white`}>
                {NOTAS.map(n => <option key={n.valor} value={n.valor}>{n.label}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Justificativa</span>
            <textarea
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              rows={3}
              placeholder="O que embasa essa avaliação — fica registrado pra calibração futura"
              className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Modo simulado — este posicionamento não será gravado.</strong></span>
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
              <span><strong>Posicionamento salvo.</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button size="sm" disabled={!podeSalvar || salvo} loading={salvando} leftIcon={<Save className="h-4 w-4" />} onClick={salvar}>
            {salvo ? 'Salvo' : salvando ? 'Salvando…' : 'Salvar Posicionamento'}
          </Button>
        </div>
      </div>
    </div>
  )
}
