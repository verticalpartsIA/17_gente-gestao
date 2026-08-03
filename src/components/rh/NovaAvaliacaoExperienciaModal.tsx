import { useEffect, useMemo, useState } from 'react'
import {
  X,
  HelpCircle,
  Target,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  AlertTriangle,
  ShieldAlert,
  Info,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { cn } from '@/lib/utils'
import {
  CATALOGO_VERSAO,
  CRITERIOS_PERCEPCAO,
  FASES,
  GRUPOS,
  agruparPorEixo,
  getCriteriosDesempenho,
  grupoLabel,
  type Criterio,
  type Fase,
  type Grupo,
} from '@/data/avaliacaoExperiencia'
import {
  MAX_NA,
  NOTAS,
  alertaPrazo,
  calcularResultado,
  calcularTermometro,
  getProtocolo,
  janelaRecomendada,
  type Nota,
  type Resposta,
} from '@/lib/avaliacaoScore'

type Etapa = 'identificacao' | 'questionario' | 'resultado'

interface Props {
  open: boolean
  onClose: () => void
}

// ── Escala de nota (0 a 5, passos de 0,5) + N/A ───────────────────────────────

function corDaNota(n: number): string {
  if (n >= 4.5) return 'bg-green-600 text-white border-green-600'
  if (n >= 3.5) return 'bg-blue-600 text-white border-blue-600'
  if (n >= 2.5) return 'bg-amber-500 text-white border-amber-500'
  return 'bg-red-600 text-white border-red-600'
}

function EscalaNota({
  valor,
  onChange,
  nomeGrupo,
}: {
  valor: Nota
  onChange: (n: Nota) => void
  nomeGrupo: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label={nomeGrupo}>
      {NOTAS.map(n => {
        const ativo = valor === n
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(ativo ? null : n)}
            className={cn(
              'h-8 min-w-[2.25rem] rounded border px-1 text-xs font-bold transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              ativo
                ? corDaNota(n)
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50',
            )}
          >
            {n.toString().replace('.', ',')}
          </button>
        )
      })}
      <button
        type="button"
        role="radio"
        aria-checked={valor === 'NA'}
        onClick={() => onChange(valor === 'NA' ? null : 'NA')}
        title="Não se aplica a esta função — sai do cálculo da média"
        className={cn(
          'ml-1 h-8 rounded border px-2.5 text-xs font-bold transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          valor === 'NA'
            ? 'border-neutral-700 bg-neutral-700 text-white'
            : 'border-dashed border-neutral-300 bg-white text-neutral-500 hover:border-neutral-500',
        )}
      >
        N/A
      </button>
    </div>
  )
}

// ── Uma pergunta ─────────────────────────────────────────────────────────────

function LinhaCriterio({
  criterio,
  resposta,
  onNota,
  onObservacao,
}: {
  criterio: Criterio
  resposta: Resposta | undefined
  onNota: (n: Nota) => void
  onObservacao: (t: string) => void
}) {
  const percepcao = criterio.bloco === 'percepcao'

  return (
    <div className="border-t border-neutral-100 py-4 first:border-t-0">
      <div className="mb-2 flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-100 text-[10px] font-bold text-neutral-600">
          {criterio.ordem}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-neutral-900">{criterio.titulo}</span>
            <InfoTooltip
              titulo="Entenda o critério"
              variant="guia"
              ariaLabel={`Entenda o critério: ${criterio.titulo}`}
              icone={<HelpCircle className="h-4 w-4" />}
            >
              {criterio.guia}
            </InfoTooltip>
            <InfoTooltip
              titulo={percepcao ? 'Como interpretar' : 'O que caracteriza nota 5'}
              variant="nota5"
              ariaLabel={`O que caracteriza nota 5: ${criterio.titulo}`}
              icone={<Target className="h-4 w-4" />}
            >
              {criterio.referenciaNota5}
            </InfoTooltip>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{criterio.pergunta}</p>
        </div>
      </div>

      <div className="ml-7 space-y-2">
        <EscalaNota
          valor={resposta?.nota ?? null}
          onChange={onNota}
          nomeGrupo={criterio.titulo}
        />
        <textarea
          value={resposta?.observacao ?? ''}
          onChange={e => onObservacao(e.target.value)}
          rows={percepcao ? 3 : 2}
          placeholder={
            percepcao
              ? 'Registre a resposta do colaborador com as palavras dele (o texto vale mais que a nota)'
              : 'Observação do avaliador (opcional)'
          }
          className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

export function NovaAvaliacaoExperienciaModal({ open, onClose }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('identificacao')
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [admissao, setAdmissao] = useState('')
  const [avaliador, setAvaliador] = useState('')
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [fase, setFase] = useState<Fase | null>(null)
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})
  const [justificativa, setJustificativa] = useState('')
  const [copiado, setCopiado] = useState(false)

  // Bloqueia o scroll do fundo e fecha no Esc
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

  const criteriosDesempenho = useMemo(
    () => (grupo && fase ? getCriteriosDesempenho(grupo, fase) : []),
    [grupo, fase],
  )

  const resultado = useMemo(
    () => calcularResultado(criteriosDesempenho, Object.values(respostas)),
    [criteriosDesempenho, respostas],
  )

  const termometro = useMemo(
    () => calcularTermometro(CRITERIOS_PERCEPCAO, Object.values(respostas)),
    [respostas],
  )

  const protocolo = fase && resultado.faixa ? getProtocolo(fase, resultado.faixa) : null
  const prazo = fase && admissao ? alertaPrazo(fase, admissao) : null

  const podeAvancar = nome.trim() !== '' && grupo !== null && fase !== null
  const exigeJustificativa = protocolo?.exigeJustificativa ?? false
  const podeConcluir =
    resultado.completo && (!exigeJustificativa || justificativa.trim().length >= 20)

  function setNota(criterioId: string, nota: Nota) {
    setRespostas(r => ({ ...r, [criterioId]: { ...r[criterioId], criterioId, nota } }))
  }

  function setObservacao(criterioId: string, observacao: string) {
    setRespostas(r => ({
      ...r,
      [criterioId]: { criterioId, nota: r[criterioId]?.nota ?? null, observacao },
    }))
  }

  function reiniciar() {
    setEtapa('identificacao')
    setNome(''); setCargo(''); setAdmissao(''); setAvaliador('')
    setGrupo(null); setFase(null)
    setRespostas({}); setJustificativa(''); setCopiado(false)
  }

  function fechar() {
    reiniciar()
    onClose()
  }

  function relatorioTexto(): string {
    const linhas: string[] = [
      'AVALIAÇÃO DE EXPERIÊNCIA — VERTICALPARTS',
      '='.repeat(52),
      `Colaborador: ${nome}${cargo ? ` — ${cargo}` : ''}`,
      admissao ? `Admissão: ${admissao}` : '',
      `Avaliador: ${avaliador || '—'}`,
      `Grupo: ${grupo ? grupoLabel(grupo) : '—'} | Fase: ${fase} dias`,
      `Catálogo versão: ${CATALOGO_VERSAO}`,
      '',
      `RESULTADO: ${resultado.media?.toFixed(2).replace('.', ',')} de 5,00`,
      `Soma ${resultado.soma.toString().replace('.', ',')} ÷ ${resultado.pontuados} critérios pontuados` +
        (resultado.naCount > 0 ? ` (${resultado.naCount} N/A)` : ''),
      protocolo ? `Protocolo: ${protocolo.titulo}` : '',
      protocolo ? `Decisão recomendada: ${protocolo.decisao}` : '',
      '',
      'MÉDIAS POR EIXO',
      ...resultado.porEixo.map(
        e => `  ${e.label}: ${e.media !== null ? e.media.toFixed(2).replace('.', ',') : '—'}`,
      ),
      '',
      'CRITÉRIOS',
      ...criteriosDesempenho.map(c => {
        const r = respostas[c.id]
        const nota = r?.nota === 'NA' ? 'N/A' : typeof r?.nota === 'number' ? r.nota.toString().replace('.', ',') : '—'
        return `  ${c.ordem}. ${c.titulo}: ${nota}` + (r?.observacao ? `\n     obs: ${r.observacao}` : '')
      }),
      '',
      `TERMÔMETRO DE INTEGRAÇÃO (indicador de RH, não pontua o colaborador): ${
        termometro !== null ? termometro.toFixed(2).replace('.', ',') : '—'
      }`,
      ...CRITERIOS_PERCEPCAO.map(c => {
        const r = respostas[c.id]
        const nota = r?.nota === 'NA' ? 'N/A' : typeof r?.nota === 'number' ? r.nota.toString().replace('.', ',') : '—'
        return `  ${c.titulo}: ${nota}` + (r?.observacao ? `\n     "${r.observacao}"` : '')
      }),
      justificativa.trim() ? `\nJUSTIFICATIVA DO FECHAMENTO\n${justificativa.trim()}` : '',
    ]
    return linhas.filter(l => l !== '').join('\n')
  }

  async function copiarRelatorio() {
    try {
      await navigator.clipboard.writeText(relatorioTexto())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  if (!open) return null

  const grupos = agruparPorEixo(criteriosDesempenho)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nova Avaliação de Experiência"
        className="my-auto w-full max-w-4xl rounded-xl bg-white shadow-dark"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Nova Avaliação de Experiência</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {etapa === 'identificacao' && 'Etapa 1 de 3 — Colaborador, grupo e fase'}
              {etapa === 'questionario' &&
                `Etapa 2 de 3 — ${grupo ? grupoLabel(grupo) : ''} · ${fase} dias · 17 perguntas`}
              {etapa === 'resultado' && 'Etapa 3 de 3 — Resultado e protocolo de fechamento'}
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

        {/* ── ETAPA 1 — Identificação ───────────────────────────────────── */}
        {etapa === 'identificacao' && (
          <div className="space-y-6 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Colaborador avaliado *
                </span>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Cargo
                </span>
                <input
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  placeholder="Ex: Assistente de Expedição"
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Data de admissão
                </span>
                <input
                  type="date"
                  value={admissao}
                  onChange={e => setAdmissao(e.target.value)}
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Avaliador
                </span>
                <input
                  value={avaliador}
                  onChange={e => setAvaliador(e.target.value)}
                  placeholder="Quem está aplicando a avaliação"
                  className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </label>
            </div>

            {/* Grupo */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Grupo de avaliação *
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {GRUPOS.map(g => (
                  <button
                    key={g.valor}
                    type="button"
                    onClick={() => setGrupo(g.valor)}
                    className={cn(
                      'rounded-lg border-2 p-3 text-left transition-all',
                      grupo === g.valor
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-200 hover:border-neutral-400',
                    )}
                  >
                    <span className="block text-sm font-bold text-neutral-900">{g.label}</span>
                    <span className="mt-1 block text-[11px] leading-snug text-neutral-500">
                      {g.descricao}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fase */}
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Fase da avaliação *
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {FASES.map(f => (
                  <button
                    key={f.valor}
                    type="button"
                    onClick={() => setFase(f.valor)}
                    className={cn(
                      'rounded-lg border-2 p-3 text-left transition-all',
                      fase === f.valor
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-200 hover:border-neutral-400',
                    )}
                  >
                    <span className="block text-sm font-bold text-neutral-900">
                      {f.label} <span className="font-medium text-neutral-500">· {f.foco}</span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-neutral-500">
                      {f.decisao}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alerta de prazo */}
            {prazo && fase && (
              <div
                className={cn(
                  'flex items-start gap-2 rounded-lg border p-3 text-xs',
                  prazo.nivel === 'vencido' && 'border-red-200 bg-red-50 text-red-800',
                  prazo.nivel === 'atencao' && 'border-amber-200 bg-amber-50 text-amber-800',
                  prazo.nivel === 'ok' && 'border-blue-200 bg-blue-50 text-blue-800',
                )}
              >
                {prazo.nivel === 'ok' ? (
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>
                  {prazo.mensagem}
                  {prazo.nivel !== 'vencido' && (
                    <>
                      {' '}
                      Janela recomendada: dia {janelaRecomendada(fase).de} ao {janelaRecomendada(fase).ate}.
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── ETAPA 2 — Questionário ────────────────────────────────────── */}
        {etapa === 'questionario' && grupo && fase && (
          <div className="px-5 py-4">
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <span>
                Passe o mouse (ou toque) nos ícones{' '}
                <HelpCircle className="inline h-3.5 w-3.5 text-blue-600" /> e{' '}
                <Target className="inline h-3.5 w-3.5 text-primary-dark" /> de cada critério: o
                primeiro explica o que a pergunta realmente mede, o segundo mostra o que caracteriza
                a nota máxima. Escala de <strong>0 a 5</strong>, de meio em meio ponto.
              </span>
            </div>

            {grupos.map(g => (
              <section key={g.eixo} className="mb-5">
                <h3 className="mb-1 border-b-2 border-primary pb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  {g.label}
                </h3>
                {g.criterios.map(c => (
                  <LinhaCriterio
                    key={c.id}
                    criterio={c}
                    resposta={respostas[c.id]}
                    onNota={n => setNota(c.id, n)}
                    onObservacao={t => setObservacao(c.id, t)}
                  />
                ))}
              </section>
            ))}

            {/* Bloco de percepção — não pontua o colaborador */}
            <section className="mt-6 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/40 p-4">
              <div className="mb-3 flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Estas duas perguntas não geram nota para o colaborador.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-800">
                    Elas medem como a VerticalParts e a liderança são percebidas por quem acabou de
                    chegar, e compõem o <strong>Termômetro de Integração</strong> — indicador de RH.
                    Responda com sinceridade: não há qualquer impacto na avaliação de desempenho.
                  </p>
                </div>
              </div>
              {CRITERIOS_PERCEPCAO.map(c => (
                <LinhaCriterio
                  key={c.id}
                  criterio={c}
                  resposta={respostas[c.id]}
                  onNota={n => setNota(c.id, n)}
                  onObservacao={t => setObservacao(c.id, t)}
                />
              ))}
            </section>

            {/* Rodapé fixo com média parcial */}
            <div className="sticky bottom-0 -mx-5 mt-4 border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="font-bold text-neutral-900">
                    Média parcial:{' '}
                    <span className="text-base">
                      {resultado.media !== null
                        ? resultado.media.toFixed(2).replace('.', ',')
                        : '—'}
                    </span>
                    <span className="font-normal text-neutral-400"> / 5,00</span>
                  </span>
                  <span className="text-neutral-500">
                    {resultado.pontuados + resultado.naCount}/{resultado.total} respondidas
                  </span>
                  {resultado.naCount > 0 && (
                    <span className="text-neutral-500">{resultado.naCount} N/A</span>
                  )}
                  {resultado.pendentes > 0 && (
                    <span className="text-amber-600">
                      {resultado.pendentes} pendente{resultado.pendentes > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {resultado.excedeuNA && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Mais de {MAX_NA} N/A — revise o grupo escolhido
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ETAPA 3 — Resultado ───────────────────────────────────────── */}
        {etapa === 'resultado' && protocolo && fase && (
          <div className="space-y-5 px-5 py-5">
            {/* Bloco do protocolo */}
            <div
              className={cn(
                'rounded-xl border-2 p-5',
                protocolo.tom === 'positivo' && 'border-green-300 bg-green-50',
                protocolo.tom === 'alerta' && 'border-amber-300 bg-amber-50',
                protocolo.tom === 'critico' && 'border-red-300 bg-red-50',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {protocolo.tom === 'positivo' && (
                    <PartyPopper className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                  )}
                  {protocolo.tom === 'alerta' && (
                    <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                  )}
                  {protocolo.tom === 'critico' && (
                    <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                  )}
                  <div>
                    <p
                      className={cn(
                        'text-lg font-black leading-tight',
                        protocolo.tom === 'positivo' && 'text-green-900',
                        protocolo.tom === 'alerta' && 'text-amber-900',
                        protocolo.tom === 'critico' && 'text-red-900',
                      )}
                    >
                      {protocolo.titulo}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-700">
                      {protocolo.decisao}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black leading-none text-neutral-900">
                    {resultado.media?.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    de 5,00
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-black/10 pt-3">
                {protocolo.acoes.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-700">
                    <span className="font-bold text-neutral-400">{i + 1}.</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparência do cálculo */}
            <p className="text-xs text-neutral-500">
              Soma <strong>{resultado.soma.toString().replace('.', ',')}</strong> ÷{' '}
              <strong>{resultado.pontuados}</strong> critérios pontuados
              {resultado.naCount > 0 && <> · {resultado.naCount} marcado(s) como N/A</>} · catálogo
              v{CATALOGO_VERSAO}
            </p>

            {/* Médias por eixo */}
            <div>
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Médias por eixo — base do comparativo 45 × 90 dias
              </h4>
              <div className="space-y-2">
                {resultado.porEixo.map(e => (
                  <div key={e.eixo} className="flex items-center gap-3">
                    <span className="w-48 shrink-0 text-xs text-neutral-600">{e.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded bg-neutral-100">
                      <div
                        className={cn(
                          'h-full rounded transition-all',
                          e.media === null ? '' :
                          e.media >= 4.5 ? 'bg-green-500' :
                          e.media >= 3.5 ? 'bg-blue-500' :
                          e.media >= 2.5 ? 'bg-amber-400' : 'bg-red-500',
                        )}
                        style={{ width: `${((e.media ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-bold text-neutral-700">
                      {e.media !== null ? e.media.toFixed(2).replace('.', ',') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Termômetro de Integração */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-blue-900">Termômetro de Integração</p>
                  <p className="mt-0.5 text-xs text-blue-800">
                    Percepção do colaborador sobre a empresa e a liderança. Indicador de RH — não
                    compõe a nota acima.
                  </p>
                </div>
                <p className="text-2xl font-black text-blue-900">
                  {termometro !== null ? termometro.toFixed(2).replace('.', ',') : '—'}
                </p>
              </div>
            </div>

            {/* Justificativa obrigatória abaixo de 3,5 */}
            {exigeJustificativa && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-red-700">
                  Justificativa do fechamento * (obrigatória abaixo de 3,5)
                </span>
                <textarea
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  rows={4}
                  placeholder="Descreva com fatos observados — datas, situações concretas — o que sustenta esta avaliação. É o documento que embasa a decisão de prorrogar ou desligar."
                  className="w-full resize-y rounded border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-300"
                />
                <span className="mt-1 block text-[11px] text-neutral-500">
                  {justificativa.trim().length} caracteres (mínimo 20)
                </span>
              </label>
            )}

            {/* Persistência ainda não implantada */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Esta avaliação ainda não é gravada.</strong> As tabelas já existem no banco
                (ver{' '}
                <code className="rounded bg-amber-100 px-1">docs/avaliacao-experiencia.sql</code>),
                mas a gravação pela tela ainda não foi ligada. Copie o relatório abaixo antes de
                fechar, ou ele será perdido.
              </span>
            </div>
          </div>
        )}

        {/* Rodapé de navegação */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-4">
          <div>
            {etapa === 'questionario' && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => setEtapa('identificacao')}
              >
                Voltar
              </Button>
            )}
            {etapa === 'resultado' && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => setEtapa('questionario')}
              >
                Revisar respostas
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {etapa === 'identificacao' && (
              <>
                <Button variant="ghost" size="sm" onClick={fechar}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!podeAvancar}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => setEtapa('questionario')}
                >
                  Abrir questionário
                </Button>
              </>
            )}

            {etapa === 'questionario' && (
              <>
                {!resultado.completo && (
                  <span className="text-xs text-neutral-500">
                    Responda os {resultado.total} critérios de desempenho para concluir
                  </span>
                )}
                <Button
                  size="sm"
                  disabled={!resultado.completo}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => setEtapa('resultado')}
                >
                  Ver resultado
                </Button>
              </>
            )}

            {etapa === 'resultado' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  onClick={copiarRelatorio}
                >
                  {copiado ? 'Copiado' : 'Copiar relatório'}
                </Button>
                <Button size="sm" disabled={!podeConcluir} onClick={fechar}>
                  Concluir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
