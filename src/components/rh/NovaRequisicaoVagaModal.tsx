import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import {
  criarVaga,
  listarDepartamentos,
  persistenciaDisponivel,
  type VagaTipo,
  type VagaRegime,
  type VagaPrioridade,
} from '@/lib/contratacaoRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
}

const TIPOS: { valor: VagaTipo; label: string }[] = [
  { valor: 'substituicao', label: 'Substituição' },
  { valor: 'aumento_quadro', label: 'Aumento de quadro' },
  { valor: 'projeto_temporario', label: 'Projeto temporário' },
]

export function NovaRequisicaoVagaModal({ open, onClose, onSalvo }: Props) {
  const { profile } = useAuth()
  const gestorPodeEscolherDepartamento = profile?.level === 'Administrador'

  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [tituloCargo, setTituloCargo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [tipoVaga, setTipoVaga] = useState<VagaTipo>('aumento_quadro')
  const [regime, setRegime] = useState<VagaRegime>('CLT')
  const [prioridade, setPrioridade] = useState<VagaPrioridade>('normal')
  const [faixaMin, setFaixaMin] = useState('')
  const [faixaMax, setFaixaMax] = useState('')
  const [prazoEsperado, setPrazoEsperado] = useState('')
  const [escopoFuncao, setEscopoFuncao] = useState('')
  const [perfilTecnico, setPerfilTecnico] = useState('')
  const [justificativa, setJustificativa] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open) return
    // Líder abre só para o próprio departamento — trava, não precisa listar.
    if (!gestorPodeEscolherDepartamento) {
      setDepartamento(profile?.department ?? '')
      return
    }
    persistenciaDisponivel() &&
      listarDepartamentos()
        .then(setDepartamentos)
        .catch(() => setDepartamentos([]))
  }, [open, gestorPodeEscolherDepartamento, profile?.department])

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
    setTituloCargo(''); setDepartamento(''); setTipoVaga('aumento_quadro')
    setRegime('CLT'); setPrioridade('normal'); setFaixaMin(''); setFaixaMax('')
    setPrazoEsperado(''); setEscopoFuncao(''); setPerfilTecnico(''); setJustificativa('')
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar =
    tituloCargo.trim() !== '' &&
    departamento.trim() !== '' &&
    justificativa.trim().length >= 20 &&
    (faixaMin === '' || faixaMax === '' || Number(faixaMin) <= Number(faixaMax)) &&
    !salvando

  async function salvar() {
    if (!profile) return
    setSalvando(true)
    setErro(null)
    try {
      await criarVaga({
        tituloCargo,
        departamento,
        gestorId: profile.id,
        gestorNome: profile.name,
        tipoVaga,
        justificativa,
        escopoFuncao: escopoFuncao || null,
        perfilTecnico: perfilTecnico || null,
        faixaMin: faixaMin === '' ? null : Number(faixaMin),
        faixaMax: faixaMax === '' ? null : Number(faixaMax),
        regime,
        prioridade,
        prazoEsperado: prazoEsperado || null,
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nova Requisição de Pessoal"
        className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-dark"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Nova Requisição de Pessoal</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Segue para aprovação executiva antes do RH iniciar o processo.
            </p>
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

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Título do cargo *
              </span>
              <input
                value={tituloCargo}
                onChange={e => setTituloCargo(e.target.value)}
                placeholder="Ex: Auxiliar de Almoxarifado"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Departamento *
              </span>
              {gestorPodeEscolherDepartamento ? (
                <select
                  value={departamento}
                  onChange={e => setDepartamento(e.target.value)}
                  className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="">Selecione o departamento</option>
                  {departamentos.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <p className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  {departamento || '—'}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Gestor solicitante
              </span>
              <p className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                {profile?.name ?? '—'}
              </p>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Tipo de vaga *
              </span>
              <select
                value={tipoVaga}
                onChange={e => setTipoVaga(e.target.value as VagaTipo)}
                className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {TIPOS.map(t => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Regime
              </span>
              <select
                value={regime}
                onChange={e => setRegime(e.target.value as VagaRegime)}
                className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Prioridade
              </span>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value as VagaPrioridade)}
                className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Prazo esperado
              </span>
              <input
                type="date"
                value={prazoEsperado}
                onChange={e => setPrazoEsperado(e.target.value)}
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Faixa salarial — mínimo
              </span>
              <input
                type="number"
                min="0"
                value={faixaMin}
                onChange={e => setFaixaMin(e.target.value)}
                placeholder="Ex: 2200"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Faixa salarial — máximo
              </span>
              <input
                type="number"
                min="0"
                value={faixaMax}
                onChange={e => setFaixaMax(e.target.value)}
                placeholder="Ex: 2800"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              {faixaMin !== '' && faixaMax !== '' && Number(faixaMin) > Number(faixaMax) && (
                <span className="mt-1 block text-[11px] text-red-600">O mínimo não pode ser maior que o máximo.</span>
              )}
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Escopo da função
              </span>
              <textarea
                value={escopoFuncao}
                onChange={e => setEscopoFuncao(e.target.value)}
                rows={2}
                placeholder="Principais responsabilidades do cargo"
                className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Perfil técnico
              </span>
              <textarea
                value={perfilTecnico}
                onChange={e => setPerfilTecnico(e.target.value)}
                rows={2}
                placeholder="Requisitos técnicos e comportamentais desejados"
                className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-red-700">
                Justificativa * (mínimo 20 caracteres)
              </span>
              <textarea
                value={justificativa}
                onChange={e => setJustificativa(e.target.value)}
                rows={3}
                placeholder="Por que essa vaga é necessária agora — o CEO decide a partir daqui"
                className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <span className="mt-1 block text-[11px] text-neutral-500">
                {justificativa.trim().length} caracteres (mínimo 20)
              </span>
            </label>
          </div>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Modo simulado — esta requisição não será gravada.</strong> O app está
                rodando sem as chaves do Supabase.
              </span>
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
              <span><strong>Requisição aberta.</strong> Enviada para aprovação executiva.</span>
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
            {salvo ? 'Enviada' : salvando ? 'Enviando…' : 'Enviar para aprovação'}
          </Button>
        </div>
      </div>
    </div>
  )
}
