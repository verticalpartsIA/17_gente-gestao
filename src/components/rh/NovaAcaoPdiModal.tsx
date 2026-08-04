import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'
import { listarTreinamentos, type TreinamentoComProgresso } from '@/lib/treinamentosRepo'
import { criarAcao, type PdiTipo } from '@/lib/pdiRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
  /** Colaborador dono do plano — normalmente o próprio usuário logado, ou um subordinado se for gestor/admin criando pra ele. */
  colaboradorPadraoId: string
}

const TIPOS: { valor: PdiTipo; label: string }[] = [
  { valor: 'curso', label: 'Curso/Treinamento' },
  { valor: 'mentoria', label: 'Mentoria' },
  { valor: 'projeto', label: 'Projeto prático' },
  { valor: 'leitura', label: 'Leitura' },
  { valor: 'outro', label: 'Outro' },
]

const inputClass =
  'w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

export function NovaAcaoPdiModal({ open, onClose, onSalvo, colaboradorPadraoId }: Props) {
  const { profile } = useAuth()
  const [treinamentos, setTreinamentos] = useState<TreinamentoComProgresso[]>([])

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<PdiTipo>('curso')
  const [treinamentoId, setTreinamentoId] = useState('')
  const [prazo, setPrazo] = useState('')
  const [progresso, setProgresso] = useState('0')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open || !persistenciaDisponivel()) return
    listarTreinamentos().then(setTreinamentos).catch(() => setTreinamentos([]))
  }, [open])

  function reiniciar() {
    setTitulo(''); setDescricao(''); setTipo('curso'); setTreinamentoId(''); setPrazo(''); setProgresso('0')
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar = !!profile && titulo.trim() !== '' && !salvando

  async function salvar() {
    if (!profile) return
    setSalvando(true)
    setErro(null)
    try {
      await criarAcao({
        colaboradorId: colaboradorPadraoId,
        titulo,
        descricao: descricao || null,
        tipo,
        treinamentoId: tipo === 'curso' && treinamentoId ? treinamentoId : null,
        prazo: prazo || null,
        progresso: Number(progresso) || 0,
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

  const vinculadoATreinamento = tipo === 'curso' && treinamentoId !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Nova Ação de PDI" className="my-auto w-full max-w-lg rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-bold text-neutral-900">Nova Ação de Desenvolvimento</h2>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Título *</span>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Certificação em Excel Avançado" className={inputClass} />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Descrição</span>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Tipo *</span>
              <select value={tipo} onChange={e => { setTipo(e.target.value as PdiTipo); setTreinamentoId('') }} className={`${inputClass} bg-white`}>
                {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Prazo</span>
              <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} className={inputClass} />
            </label>
          </div>

          {tipo === 'curso' && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Vincular a um treinamento cadastrado (opcional)</span>
              <select value={treinamentoId} onChange={e => setTreinamentoId(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Nenhum — treinamento externo</option>
                {treinamentos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              {vinculadoATreinamento && (
                <span className="mt-1 block text-[11px] text-neutral-500">
                  O progresso desta ação vai acompanhar automaticamente a conclusão do treinamento — sem campo manual.
                </span>
              )}
            </label>
          )}

          {!vinculadoATreinamento && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Progresso inicial (%)</span>
              <input type="number" min="0" max="100" value={progresso} onChange={e => setProgresso(e.target.value)} className={inputClass} />
            </label>
          )}

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Modo simulado — esta ação não será gravada.</strong></span>
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
              <span><strong>Ação criada.</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button size="sm" disabled={!podeSalvar || salvo} loading={salvando} leftIcon={<Save className="h-4 w-4" />} onClick={salvar}>
            {salvo ? 'Criada' : salvando ? 'Salvando…' : 'Criar Ação'}
          </Button>
        </div>
      </div>
    </div>
  )
}
