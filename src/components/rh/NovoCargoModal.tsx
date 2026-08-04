import { useEffect, useState } from 'react'
import { X, Save, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  criarCargo,
  listarDepartamentos,
  type CargoRegime,
  type ModeloRemuneracaoPJ,
} from '@/lib/cargosRepo'
import { persistenciaDisponivel } from '@/lib/contratacaoRepo'

interface Props {
  open: boolean
  onClose: () => void
  onSalvo?: () => void
}

const NIVEIS = ['Júnior', 'Pleno', 'Sênior', 'Especialista', 'Coordenador', 'Supervisão', 'Gerência', 'Diretor']

const MODELOS_PJ: { valor: ModeloRemuneracaoPJ; label: string }[] = [
  { valor: 'entrega', label: 'Por entrega' },
  { valor: 'hora_tecnica', label: 'Hora técnica' },
  { valor: 'marco_projeto', label: 'Marco de projeto' },
]

const inputClass =
  'w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

export function NovoCargoModal({ open, onClose, onSalvo }: Props) {
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [nome, setNome] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [regime, setRegime] = useState<CargoRegime>('CLT')
  const [nivel, setNivel] = useState('')
  const [cbo, setCbo] = useState('')
  const [hcAprovado, setHcAprovado] = useState('1')

  // CLT
  const [faixaMin, setFaixaMin] = useState('')
  const [faixaMax, setFaixaMax] = useState('')
  const [incluiInsalubridade, setIncluiInsalubridade] = useState(false)
  const [incluiPericulosidade, setIncluiPericulosidade] = useState(false)
  const [elegivelPlr, setElegivelPlr] = useState(false)

  // PJ
  const [modeloRemuneracao, setModeloRemuneracao] = useState<ModeloRemuneracaoPJ>('hora_tecnica')
  const [valorReferencia, setValorReferencia] = useState('')
  const [observacaoValor, setObservacaoValor] = useState('')
  const [exclusividade, setExclusividade] = useState(false)
  const [justificativaExclusividade, setJustificativaExclusividade] = useState('')
  const [controlePonto, setControlePonto] = useState(false)
  const [ferramentasProprias, setFerramentasProprias] = useState(true)

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!open) return
    persistenciaDisponivel() && listarDepartamentos().then(setDepartamentos).catch(() => setDepartamentos([]))
  }, [open])

  function reiniciar() {
    setNome(''); setDepartamento(''); setRegime('CLT'); setNivel(''); setCbo(''); setHcAprovado('1')
    setFaixaMin(''); setFaixaMax(''); setIncluiInsalubridade(false); setIncluiPericulosidade(false); setElegivelPlr(false)
    setModeloRemuneracao('hora_tecnica'); setValorReferencia(''); setObservacaoValor('')
    setExclusividade(false); setJustificativaExclusividade(''); setControlePonto(false); setFerramentasProprias(true)
    setSalvando(false); setErro(null); setSalvo(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  const podeSalvar =
    nome.trim() !== '' &&
    departamento.trim() !== '' &&
    (regime === 'CLT'
      ? faixaMin !== '' && faixaMax !== '' && Number(faixaMin) <= Number(faixaMax)
      : valorReferencia !== '' && (!exclusividade || justificativaExclusividade.trim().length >= 20)) &&
    !salvando

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      await criarCargo({
        nome, departamento, regime, nivel: nivel || null, cbo: cbo || null, hcAprovado: Number(hcAprovado) || 0,
        faixaMin: regime === 'CLT' ? Number(faixaMin) : undefined,
        faixaMax: regime === 'CLT' ? Number(faixaMax) : undefined,
        incluiInsalubridade, incluiPericulosidade, elegivelPlr,
        modeloRemuneracao: regime === 'PJ' ? modeloRemuneracao : undefined,
        valorReferencia: regime === 'PJ' ? Number(valorReferencia) : undefined,
        observacaoValor: observacaoValor || null,
        exclusividade, justificativaExclusividade: justificativaExclusividade || null,
        subordinacaoHierarquica: false,
        controlePonto, ferramentasProprias,
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
      <div role="dialog" aria-modal="true" aria-label="Novo Cargo" className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Novo Cargo</h2>
            <p className="mt-0.5 text-xs text-neutral-500">CLT usa faixa salarial. PJ usa valor de referência + trilha de compliance.</p>
          </div>
          <button type="button" onClick={fechar} aria-label="Fechar" className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* Toggle de regime */}
          <div className="flex rounded border border-neutral-200 p-1">
            {(['CLT', 'PJ'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRegime(r)}
                className={`flex-1 rounded py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  regime === r ? 'bg-primary text-black' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nome do cargo *</span>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Analista de Almoxarifado" className={inputClass} />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Departamento *</span>
              <select value={departamento} onChange={e => setDepartamento(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Selecione o departamento</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Nível</span>
              <select value={nivel} onChange={e => setNivel(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">—</option>
                {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            {regime === 'CLT' && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">CBO</span>
                <input value={cbo} onChange={e => setCbo(e.target.value)} placeholder="Ex: 4110-05" className={inputClass} />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Headcount aprovado</span>
              <input type="number" min="0" value={hcAprovado} onChange={e => setHcAprovado(e.target.value)} className={inputClass} />
            </label>

            {regime === 'CLT' ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Faixa salarial — mínimo *</span>
                  <input type="number" min="0" value={faixaMin} onChange={e => setFaixaMin(e.target.value)} placeholder="Ex: 2200" className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Faixa salarial — máximo *</span>
                  <input type="number" min="0" value={faixaMax} onChange={e => setFaixaMax(e.target.value)} placeholder="Ex: 2800" className={inputClass} />
                  {faixaMin !== '' && faixaMax !== '' && Number(faixaMin) > Number(faixaMax) && (
                    <span className="mt-1 block text-[11px] text-red-600">O mínimo não pode ser maior que o máximo.</span>
                  )}
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={incluiInsalubridade} onChange={e => setIncluiInsalubridade(e.target.checked)} /> Insalubridade
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={incluiPericulosidade} onChange={e => setIncluiPericulosidade(e.target.checked)} /> Periculosidade
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={elegivelPlr} onChange={e => setElegivelPlr(e.target.checked)} /> Elegível a PLR/bônus
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Modelo de remuneração *</span>
                  <select value={modeloRemuneracao} onChange={e => setModeloRemuneracao(e.target.value as ModeloRemuneracaoPJ)} className={`${inputClass} bg-white`}>
                    {MODELOS_PJ.map(m => <option key={m.valor} value={m.valor}>{m.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Valor de referência (R$) *</span>
                  <input type="number" min="0" value={valorReferencia} onChange={e => setValorReferencia(e.target.value)} placeholder="Ex: 180" className={inputClass} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Observação do valor</span>
                  <input value={observacaoValor} onChange={e => setObservacaoValor(e.target.value)} placeholder="Ex: por hora técnica faturada, variável conforme demanda do mês" className={inputClass} />
                </label>

                <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Trilha de compliance PJ — documentação, não validação jurídica
                  </p>
                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input type="checkbox" checked={exclusividade} onChange={e => setExclusividade(e.target.checked)} /> Exclusividade contratual
                  </label>
                  {exclusividade && (
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-red-700">
                        Justificativa técnica da exclusividade * (mínimo 20 caracteres)
                      </span>
                      <textarea
                        value={justificativaExclusividade}
                        onChange={e => setJustificativaExclusividade(e.target.value)}
                        rows={2}
                        placeholder="Ex: sigilo industrial extremo, propriedade intelectual sensível"
                        className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                      <span className="mt-1 block text-[11px] text-neutral-500">{justificativaExclusividade.trim().length} caracteres (mínimo 20)</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input type="checkbox" checked={controlePonto} onChange={e => setControlePonto(e.target.checked)} /> Sujeito a controle de ponto (evitar marcar)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input type="checkbox" checked={ferramentasProprias} onChange={e => setFerramentasProprias(e.target.checked)} /> Usa ferramentas/equipamentos próprios
                  </label>
                </div>
              </>
            )}
          </div>

          {!persistenciaDisponivel() && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Modo simulado — este cargo não será gravado.</strong> O app está rodando sem as chaves do Supabase.</span>
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
              <span><strong>Cargo criado.</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={fechar}>Cancelar</Button>
          <Button size="sm" disabled={!podeSalvar || salvo} loading={salvando} leftIcon={<Save className="h-4 w-4" />} onClick={salvar}>
            {salvo ? 'Criado' : salvando ? 'Salvando…' : 'Criar Cargo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
