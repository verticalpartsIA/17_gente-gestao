import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { listarColaboradores, type ColaboradorOpcao } from '@/lib/avaliacaoExperienciaRepo'
import {
  agendarEntrevista,
  persistenciaDisponivel,
  ENTREVISTA_TIPO_LABEL,
  type EntrevistaTipo,
} from '@/lib/contratacaoRepo'

interface Props {
  open: boolean
  candidatoId: string | null
  candidatoNome: string
  vagaId: string | null
  criadoPor: string
  onClose: () => void
  onSalvo?: () => void
}

const TIPOS: EntrevistaTipo[] = ['triagem', 'entrevista_rh', 'entrevista_gestor']

export function NovaEntrevistaModal({ open, candidatoId, candidatoNome, vagaId, criadoPor, onClose, onSalvo }: Props) {
  const [tipo, setTipo] = useState<EntrevistaTipo>('entrevista_rh')
  const [colaboradores, setColaboradores] = useState<ColaboradorOpcao[]>([])
  const [entrevistadorId, setEntrevistadorId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [localOuLink, setLocalOuLink] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open || !persistenciaDisponivel()) return
    listarColaboradores().then(setColaboradores).catch(() => setColaboradores([]))
  }, [open])

  useEffect(() => {
    if (!open) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  function reiniciar() {
    setTipo('entrevista_rh'); setEntrevistadorId(''); setDataHora(''); setLocalOuLink('')
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar = dataHora !== '' && !salvando && !!candidatoId && !!vagaId

  async function salvar() {
    if (!candidatoId || !vagaId) return
    setSalvando(true)
    setErro(null)
    try {
      const entrevistador = colaboradores.find(c => c.id === entrevistadorId)
      await agendarEntrevista({
        candidatoId,
        vagaId,
        tipo,
        entrevistadorId: entrevistadorId || null,
        entrevistadorNome: entrevistador?.name ?? null,
        dataHora: new Date(dataHora).toISOString(),
        localOuLink: localOuLink || null,
        criadoPor,
      })
      setSalvo(true)
      onSalvo?.()
      setTimeout(fechar, 1000)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado ao gravar.')
    } finally {
      setSalvando(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agendar Entrevista"
        className="my-auto w-full max-w-md rounded-xl bg-white shadow-dark"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Agendar Entrevista</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Candidato: {candidatoNome}</p>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Tipo
            </span>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as EntrevistaTipo)}
              className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              {TIPOS.map(t => (
                <option key={t} value={t}>{ENTREVISTA_TIPO_LABEL[t]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Entrevistador
            </span>
            <select
              value={entrevistadorId}
              onChange={e => setEntrevistadorId(e.target.value)}
              className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">Selecione (opcional)</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.department ? ` — ${c.department}` : ''}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Data e hora *
            </span>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={e => setDataHora(e.target.value)}
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Local ou link
            </span>
            <input
              value={localOuLink}
              onChange={e => setLocalOuLink(e.target.value)}
              placeholder="Sala de reunião, link do Meet, etc."
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Modo simulado — esta entrevista não será gravada.</span>
            </div>
          )}
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}
          {salvo && (
            <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-xs text-green-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Entrevista agendada.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!podeSalvar || salvo}
            loading={salvando}
            leftIcon={<Save className="h-4 w-4" />}
            onClick={salvar}
          >
            {salvo ? 'Agendada' : salvando ? 'Salvando…' : 'Agendar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
