import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { criarCandidato, persistenciaDisponivel } from '@/lib/contratacaoRepo'

interface Props {
  open: boolean
  vagaId: string | null
  criadoPor: string
  onClose: () => void
  onSalvo?: () => void
}

const FONTES = ['LinkedIn', 'Indeed', 'Gupy', 'Indicação Interna', 'Site da empresa', 'Outro']

export function NovoCandidatoModal({ open, vagaId, criadoPor, onClose, onSalvo }: Props) {
  const [nome, setNome] = useState('')
  const [fonte, setFonte] = useState('LinkedIn')
  const [score, setScore] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

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
    setNome(''); setFonte('LinkedIn'); setScore(''); setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const scoreInvalido = score !== '' && (Number(score) < 0 || Number(score) > 100)
  const podeSalvar = nome.trim() !== '' && !scoreInvalido && !salvando && !!vagaId

  async function salvar() {
    if (!vagaId) return
    setSalvando(true)
    setErro(null)
    try {
      await criarCandidato({
        vagaId,
        nome,
        fonte: fonte || null,
        score: score === '' ? null : Number(score),
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
        aria-label="Adicionar Candidato"
        className="my-auto w-full max-w-md rounded-xl bg-white shadow-dark"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-bold text-neutral-900">Adicionar Candidato</h2>
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
              Nome *
            </span>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome completo do candidato"
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Fonte
            </span>
            <select
              value={fonte}
              onChange={e => setFonte(e.target.value)}
              className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              {FONTES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Score (0-100, opcional)
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="Ex: 85"
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            {scoreInvalido && <span className="mt-1 block text-[11px] text-red-600">Score deve ficar entre 0 e 100.</span>}
          </label>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Modo simulado — este candidato não será gravado.</span>
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
              <span>Candidato adicionado.</span>
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
            {salvo ? 'Adicionado' : salvando ? 'Salvando…' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
