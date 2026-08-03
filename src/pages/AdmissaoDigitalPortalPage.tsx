import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, isMockMode } from '@/lib/supabase'
import { PASSOS_LABEL, documentosDoPasso } from '@/data/admissaoDigitalDocumentos'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Loader2, AlertTriangle, UploadCloud, Check } from 'lucide-react'

// Portal público de Admissão Digital (Fase 1 — issue 17_gente-gestao).
// Página sem AppShell/sidebar de propósito: quem abre aqui não tem conta no
// sistema — é um candidato acessando via link com token (?/admissao/:token),
// autenticado só pela Edge Function admissao-portal (ver seu cabeçalho).
// Passos 6 (compliance/saúde) e 7 (assinatura) ficam para a Fase 2.

interface Documento {
  id: string
  nome: string
  status: 'pendente' | 'aprovado' | 'recusado'
  nome_arquivo: string | null
  motivo_recusa: string | null
}

interface Estado {
  status: 'pendente_preenchimento' | 'em_analise' | 'aprovado'
  passoAtual: number
  candidatoNome: string | null
  vagaTitulo: string | null
  dadosPessoais: Record<string, any> | null
  endereco: Record<string, any> | null
  dependentes: Record<string, any>[]
  dadosTrabalhistas: Record<string, any> | null
  dadosBancarios: Record<string, any> | null
  documentos: Documento[]
}

const inputClass =
  'w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</span>
      {children}
    </label>
  )
}

async function chamarPortal(token: string, action: string, payload?: unknown) {
  const { data, error } = await supabase.functions.invoke('admissao-portal', {
    body: { token, action, payload },
  })
  if (error) {
    // FunctionsHttpError não expõe o corpo JSON da resposta em `error.message`
    // (sempre "Edge Function returned a non-2xx status code") — a mensagem de
    // verdade (ex.: "Link inválido ou expirado.") vem em error.context, que é
    // a Response crua devolvida pela função.
    const corpo = await (error as any)?.context?.json?.().catch(() => null)
    throw new Error(corpo?.error ?? error.message ?? 'Erro ao comunicar com o servidor.')
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export default function AdmissaoDigitalPortalPage() {
  const { token } = useParams<{ token: string }>()
  const [estado, setEstado] = useState<Estado | null>(null)
  const [passo, setPasso] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const [form, setForm] = useState<Record<string, any>>({})
  const [dependentes, setDependentes] = useState<Record<string, any>[]>([])
  const [uploadEmAndamento, setUploadEmAndamento] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (isMockMode) {
      setErroCarga('Ambiente sem conexão real com o banco — este portal só funciona com Supabase configurado.')
      setCarregando(false)
      return
    }
    chamarPortal(token, 'get_estado')
      .then((data: Estado) => {
        setEstado(data)
        setPasso(Math.min(5, Math.max(1, data.passoAtual)))
        setDependentes(data.dependentes ?? [])
        const passoInicial = { ...data.dadosPessoais, ...data.endereco, ...data.dadosTrabalhistas, ...data.dadosBancarios }
        setForm(passoInicial ?? {})
      })
      .catch(e => setErroCarga(e.message))
      .finally(() => setCarregando(false))
  }, [token])

  function set(campo: string, valor: string | boolean) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function avancar() {
    if (!token || !estado) return
    setSalvando(true)
    setErroSalvar(null)
    try {
      const dados =
        passo === 1
          ? pick(form, ['nome_completo', 'nome_social', 'cpf', 'rg', 'rg_orgao_emissor', 'rg_data_emissao', 'data_nascimento', 'nacionalidade', 'naturalidade', 'nome_mae', 'nome_pai', 'genero', 'raca_cor', 'email', 'telefone'])
          : passo === 2
          ? pick(form, ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'contato_emergencia_nome', 'contato_emergencia_parentesco', 'contato_emergencia_telefone'])
          : passo === 4
          ? pick(form, ['ctps_numero', 'ctps_serie', 'ctps_digital', 'pis_pasep', 'titulo_eleitor_numero', 'titulo_eleitor_zona', 'titulo_eleitor_secao', 'certificado_reservista', 'escolaridade', 'registro_conselho_classe'])
          : passo === 5
          ? pick(form, ['banco', 'tipo_conta', 'agencia', 'conta'])
          : {}

      const payload = passo === 3 ? { passo, dependentes } : { passo, dados }
      const resp = await chamarPortal(token, 'salvar_passo', payload)
      setEstado(e => (e ? { ...e, passoAtual: resp.passoAtual, status: resp.status } : e))
      if (passo < 5) setPasso(passo + 1)
      else setPasso(6) // 6 = tela de conclusão desta fase
    } catch (e) {
      setErroSalvar(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function enviarArquivo(documentoId: string, arquivo: File) {
    if (!token) return
    setUploadEmAndamento(documentoId)
    try {
      const { signedUrl } = await chamarPortal(token, 'gerar_upload_url', { documentoId })
      const resp = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': arquivo.type || 'application/octet-stream' },
        body: arquivo,
      })
      if (!resp.ok) throw new Error('Falha ao enviar o arquivo. Tente novamente.')
      await chamarPortal(token, 'confirmar_upload', { documentoId, nomeArquivo: arquivo.name })
      setEstado(e =>
        e
          ? {
              ...e,
              documentos: e.documentos.map(d =>
                d.id === documentoId ? { ...d, status: 'pendente', nome_arquivo: arquivo.name, motivo_recusa: null } : d,
              ),
            }
          : e,
      )
    } catch (e) {
      setErroSalvar(e instanceof Error ? e.message : 'Erro ao enviar arquivo.')
    } finally {
      setUploadEmAndamento(null)
    }
  }

  if (carregando) {
    return (
      <Centro>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Centro>
    )
  }

  if (erroCarga || !estado) {
    return (
      <Centro>
        <Card theme="light" className="max-w-md">
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-neutral-600">{erroCarga ?? 'Link inválido.'}</p>
          </CardContent>
        </Card>
      </Centro>
    )
  }

  if (estado.status === 'aprovado') {
    return (
      <Centro>
        <TelaFinal
          icone={<CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />}
          titulo="Admissão aprovada!"
          texto="Seus dados foram conferidos e aprovados pelo Departamento Pessoal. Em breve você receberá as próximas orientações."
        />
      </Centro>
    )
  }

  if (passo === 6 || estado.status === 'em_analise') {
    return (
      <Centro>
        <TelaFinal
          icone={<CheckCircle2 className="h-10 w-10 text-primary mx-auto" />}
          titulo="Documentação enviada com sucesso!"
          texto="Seus dados foram enviados para análise do Departamento Pessoal. Em breve entraremos em contato."
        />
      </Centro>
    )
  }

  const docsDoPasso = documentosDoPasso(passo, estado.documentos.map(d => d.nome))

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-display font-bold uppercase tracking-wider text-neutral-900">Admissão Digital — VerticalParts</h1>
          <p className="text-sm text-neutral-500">
            {estado.candidatoNome} · {estado.vagaTitulo}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(p => (
            <div key={p} className={`h-1.5 w-10 rounded-full ${p <= passo ? 'bg-primary' : 'bg-neutral-300'}`} />
          ))}
        </div>

        <Card theme="light">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle>Passo {passo} de 5 — {PASSOS_LABEL[passo]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {erroSalvar && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroSalvar}</span>
              </div>
            )}

            {passo === 1 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nome completo *"><input className={inputClass} value={form.nome_completo ?? ''} onChange={e => set('nome_completo', e.target.value)} /></Field>
                <Field label="Nome social"><input className={inputClass} value={form.nome_social ?? ''} onChange={e => set('nome_social', e.target.value)} /></Field>
                <Field label="CPF *"><input className={inputClass} value={form.cpf ?? ''} onChange={e => set('cpf', e.target.value)} /></Field>
                <Field label="RG *"><input className={inputClass} value={form.rg ?? ''} onChange={e => set('rg', e.target.value)} /></Field>
                <Field label="Órgão emissor"><input className={inputClass} value={form.rg_orgao_emissor ?? ''} onChange={e => set('rg_orgao_emissor', e.target.value)} /></Field>
                <Field label="Data de emissão do RG"><input type="date" className={inputClass} value={form.rg_data_emissao ?? ''} onChange={e => set('rg_data_emissao', e.target.value)} /></Field>
                <Field label="Data de nascimento *"><input type="date" className={inputClass} value={form.data_nascimento ?? ''} onChange={e => set('data_nascimento', e.target.value)} /></Field>
                <Field label="Nacionalidade"><input className={inputClass} value={form.nacionalidade ?? ''} onChange={e => set('nacionalidade', e.target.value)} /></Field>
                <Field label="Naturalidade"><input className={inputClass} value={form.naturalidade ?? ''} onChange={e => set('naturalidade', e.target.value)} /></Field>
                <Field label="Nome da mãe"><input className={inputClass} value={form.nome_mae ?? ''} onChange={e => set('nome_mae', e.target.value)} /></Field>
                <Field label="Nome do pai"><input className={inputClass} value={form.nome_pai ?? ''} onChange={e => set('nome_pai', e.target.value)} /></Field>
                <Field label="Gênero"><input className={inputClass} value={form.genero ?? ''} onChange={e => set('genero', e.target.value)} /></Field>
                <Field label="Raça/Cor"><input className={inputClass} value={form.raca_cor ?? ''} onChange={e => set('raca_cor', e.target.value)} /></Field>
                <Field label="E-mail *"><input type="email" className={inputClass} value={form.email ?? ''} onChange={e => set('email', e.target.value)} /></Field>
                <Field label="Celular/WhatsApp *"><input className={inputClass} value={form.telefone ?? ''} onChange={e => set('telefone', e.target.value)} /></Field>
              </div>
            )}

            {passo === 2 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="CEP *"><input className={inputClass} value={form.cep ?? ''} onChange={e => set('cep', e.target.value)} /></Field>
                <Field label="Logradouro *"><input className={inputClass} value={form.logradouro ?? ''} onChange={e => set('logradouro', e.target.value)} /></Field>
                <Field label="Número"><input className={inputClass} value={form.numero ?? ''} onChange={e => set('numero', e.target.value)} /></Field>
                <Field label="Complemento"><input className={inputClass} value={form.complemento ?? ''} onChange={e => set('complemento', e.target.value)} /></Field>
                <Field label="Bairro *"><input className={inputClass} value={form.bairro ?? ''} onChange={e => set('bairro', e.target.value)} /></Field>
                <Field label="Cidade *"><input className={inputClass} value={form.cidade ?? ''} onChange={e => set('cidade', e.target.value)} /></Field>
                <Field label="UF *"><input className={inputClass} maxLength={2} value={form.uf ?? ''} onChange={e => set('uf', e.target.value.toUpperCase())} /></Field>
                <div />
                <Field label="Contato de emergência — nome *"><input className={inputClass} value={form.contato_emergencia_nome ?? ''} onChange={e => set('contato_emergencia_nome', e.target.value)} /></Field>
                <Field label="Parentesco *"><input className={inputClass} value={form.contato_emergencia_parentesco ?? ''} onChange={e => set('contato_emergencia_parentesco', e.target.value)} /></Field>
                <Field label="Telefone *"><input className={inputClass} value={form.contato_emergencia_telefone ?? ''} onChange={e => set('contato_emergencia_telefone', e.target.value)} /></Field>
              </div>
            )}

            {passo === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500">Se não tiver dependentes, siga em frente sem adicionar nenhum.</p>
                {dependentes.map((d, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-4 border border-neutral-200 rounded p-3">
                    <input placeholder="Nome" className={inputClass} value={d.nome ?? ''} onChange={e => atualizarDependente(setDependentes, i, 'nome', e.target.value)} />
                    <input placeholder="CPF" className={inputClass} value={d.cpf ?? ''} onChange={e => atualizarDependente(setDependentes, i, 'cpf', e.target.value)} />
                    <input placeholder="Data de nascimento" type="date" className={inputClass} value={d.data_nascimento ?? ''} onChange={e => atualizarDependente(setDependentes, i, 'data_nascimento', e.target.value)} />
                    <div className="flex gap-2">
                      <input placeholder="Parentesco" className={inputClass} value={d.parentesco ?? ''} onChange={e => atualizarDependente(setDependentes, i, 'parentesco', e.target.value)} />
                      <button type="button" className="text-red-500 text-xs" onClick={() => setDependentes(deps => deps.filter((_, j) => j !== i))}>Remover</button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDependentes(deps => [...deps, { nome: '', cpf: '', data_nascimento: '', parentesco: '' }])}>
                  + Adicionar dependente
                </Button>
              </div>
            )}

            {passo === 4 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="CTPS — número"><input className={inputClass} value={form.ctps_numero ?? ''} onChange={e => set('ctps_numero', e.target.value)} /></Field>
                <Field label="CTPS — série"><input className={inputClass} value={form.ctps_serie ?? ''} onChange={e => set('ctps_serie', e.target.value)} /></Field>
                <label className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" checked={!!form.ctps_digital} onChange={e => set('ctps_digital', e.target.checked)} />
                  <span className="text-xs text-neutral-600">Minha CTPS é digital (uso o CPF)</span>
                </label>
                <Field label="PIS/PASEP *"><input className={inputClass} value={form.pis_pasep ?? ''} onChange={e => set('pis_pasep', e.target.value)} /></Field>
                <Field label="Título de eleitor — número"><input className={inputClass} value={form.titulo_eleitor_numero ?? ''} onChange={e => set('titulo_eleitor_numero', e.target.value)} /></Field>
                <Field label="Zona"><input className={inputClass} value={form.titulo_eleitor_zona ?? ''} onChange={e => set('titulo_eleitor_zona', e.target.value)} /></Field>
                <Field label="Seção"><input className={inputClass} value={form.titulo_eleitor_secao ?? ''} onChange={e => set('titulo_eleitor_secao', e.target.value)} /></Field>
                <Field label="Certificado de reservista (se aplicável)"><input className={inputClass} value={form.certificado_reservista ?? ''} onChange={e => set('certificado_reservista', e.target.value)} /></Field>
                <Field label="Escolaridade"><input className={inputClass} value={form.escolaridade ?? ''} onChange={e => set('escolaridade', e.target.value)} /></Field>
                <Field label="Registro de conselho de classe (se houver)"><input className={inputClass} value={form.registro_conselho_classe ?? ''} onChange={e => set('registro_conselho_classe', e.target.value)} /></Field>
              </div>
            )}

            {passo === 5 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Banco *"><input className={inputClass} value={form.banco ?? ''} onChange={e => set('banco', e.target.value)} /></Field>
                <Field label="Tipo de conta *">
                  <select className={inputClass} value={form.tipo_conta ?? 'corrente'} onChange={e => set('tipo_conta', e.target.value)}>
                    <option value="corrente">Conta Corrente</option>
                    <option value="salario">Conta Salário</option>
                  </select>
                </Field>
                <Field label="Agência *"><input className={inputClass} value={form.agencia ?? ''} onChange={e => set('agencia', e.target.value)} /></Field>
                <Field label="Conta *"><input className={inputClass} value={form.conta ?? ''} onChange={e => set('conta', e.target.value)} /></Field>
              </div>
            )}

            {docsDoPasso.length > 0 && (
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Documentos deste passo</p>
                {docsDoPasso.map(nome => {
                  const doc = estado.documentos.find(d => d.nome === nome)
                  if (!doc) return null
                  return (
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded border border-neutral-200 p-2.5">
                      <div className="min-w-0">
                        <p className="text-sm text-neutral-800">{doc.nome}</p>
                        {doc.nome_arquivo && <p className="text-xs text-neutral-400 truncate">{doc.nome_arquivo}</p>}
                        {doc.status === 'recusado' && doc.motivo_recusa && (
                          <p className="text-xs text-red-600">Recusado: {doc.motivo_recusa}</p>
                        )}
                      </div>
                      <label className="shrink-0">
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && enviarArquivo(doc.id, e.target.files[0])}
                        />
                        <span className="inline-flex items-center gap-1.5 rounded border border-primary px-3 py-1.5 text-xs font-bold text-primary cursor-pointer hover:bg-primary/10">
                          {uploadEmAndamento === doc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : doc.nome_arquivo ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <UploadCloud className="h-3.5 w-3.5" />
                          )}
                          {doc.nome_arquivo ? 'Reenviar' : 'Enviar'}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={avancar} loading={salvando}>
                {passo === 5 ? 'Concluir e Enviar →' : 'Avançar →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Centro({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">{children}</div>
}

function TelaFinal({ icone, titulo, texto }: { icone: React.ReactNode; titulo: string; texto: string }) {
  return (
    <Card theme="light" className="max-w-md">
      <CardContent className="p-8 text-center space-y-3">
        {icone}
        <h2 className="text-base font-bold text-neutral-900">{titulo}</h2>
        <p className="text-sm text-neutral-600">{texto}</p>
      </CardContent>
    </Card>
  )
}

function pick(obj: Record<string, any>, campos: string[]) {
  const out: Record<string, any> = {}
  for (const c of campos) out[c] = obj[c] ?? null
  return out
}

function atualizarDependente(
  setDependentes: React.Dispatch<React.SetStateAction<Record<string, any>[]>>,
  index: number,
  campo: string,
  valor: string,
) {
  setDependentes(deps => deps.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)))
}
