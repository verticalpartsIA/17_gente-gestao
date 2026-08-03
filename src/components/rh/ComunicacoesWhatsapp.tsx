import { useCallback, useEffect, useState } from 'react'
import { Send, Plus, X, RefreshCw, AlertTriangle, ArrowLeftRight, MessageCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth'
import { listarCandidatosComTelefone, type Candidato } from '@/lib/contratacaoRepo'
import {
  listarThreadsRH,
  listarRoteamentoRecente,
  listarMensagens,
  enviarMensagem,
  iniciarConversa,
  reclassificarThread,
  persistenciaDisponivel,
  jidParaTelefone,
  type WhatsappRouting,
  type WhatsappMensagem,
} from '@/lib/whatsappRepo'

function nomeThread(t: WhatsappRouting) {
  return t.push_name ?? jidParaTelefone(t.remote_jid)
}

function horaLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ── Modal: Nova Conversa ─────────────────────────────────────────────────────

function NovaConversaModal({ onClose, onIniciada }: { onClose: () => void; onIniciada: (jid: string) => void }) {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [candidatoId, setCandidatoId] = useState('')
  const [telefoneManual, setTelefoneManual] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarCandidatosComTelefone().then(setCandidatos).catch(() => setCandidatos([]))
  }, [])

  const candidato = candidatos.find(c => c.id === candidatoId) ?? null
  const telefone = candidato?.telefone ?? telefoneManual
  const podeEnviar = telefone.trim() !== '' && texto.trim() !== '' && !enviando

  async function enviar() {
    setEnviando(true)
    setErro(null)
    try {
      const { remoteJid } = await iniciarConversa(candidatoId || null, telefone, texto)
      onIniciada(remoteJid)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Nova Conversa" className="my-auto w-full max-w-md rounded-xl bg-white shadow-dark">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-bold text-neutral-900">Nova Conversa no WhatsApp</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Candidato (opcional)</span>
            <select
              value={candidatoId}
              onChange={e => setCandidatoId(e.target.value)}
              className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">Número manual</option>
              {candidatos.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.telefone}</option>
              ))}
            </select>
          </label>
          {!candidatoId && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Telefone *</span>
              <input
                value={telefoneManual}
                onChange={e => setTelefoneManual(e.target.value)}
                placeholder="Ex: 11987654321"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Mensagem *</span>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={3}
              placeholder="Olá! Aqui é o RH da VerticalParts..."
              className="w-full resize-y rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erro}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={!podeEnviar} loading={enviando} leftIcon={<Send className="h-4 w-4" />} onClick={enviar}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ComunicacoesWhatsapp() {
  const { profile } = useAuth()
  const souAdministrador = profile?.level === 'Administrador'

  const [threads, setThreads] = useState<WhatsappRouting[]>([])
  const [carregandoThreads, setCarregandoThreads] = useState(false)
  const [erroThreads, setErroThreads] = useState<string | null>(null)
  const [threadSelecionada, setThreadSelecionada] = useState<string | null>(null)
  const [mensagens, setMensagens] = useState<WhatsappMensagem[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [roteamento, setRoteamento] = useState<WhatsappRouting[]>([])
  const [mostrarRoteamento, setMostrarRoteamento] = useState(false)

  const carregarThreads = useCallback(() => {
    if (!persistenciaDisponivel() || !souAdministrador) return
    setCarregandoThreads(true)
    setErroThreads(null)
    listarThreadsRH()
      .then(setThreads)
      .catch(e => setErroThreads(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => setCarregandoThreads(false))
  }, [souAdministrador])

  useEffect(carregarThreads, [carregarThreads])

  // Poll leve — mensagens chegam via webhook, não por ação do usuário aqui.
  useEffect(() => {
    if (!souAdministrador) return
    const id = setInterval(carregarThreads, 15000)
    return () => clearInterval(id)
  }, [carregarThreads, souAdministrador])

  useEffect(() => {
    if (!threadSelecionada || !persistenciaDisponivel()) {
      setMensagens([])
      return
    }
    const carregar = () => listarMensagens(threadSelecionada).then(setMensagens).catch(() => {})
    carregar()
    const id = setInterval(carregar, 8000)
    return () => clearInterval(id)
  }, [threadSelecionada])

  function carregarRoteamento() {
    listarRoteamentoRecente().then(setRoteamento).catch(() => setRoteamento([]))
  }

  useEffect(() => {
    if (mostrarRoteamento) carregarRoteamento()
  }, [mostrarRoteamento])

  async function handleEnviar() {
    if (!threadSelecionada || !texto.trim()) return
    setEnviando(true)
    setErroAcao(null)
    try {
      await enviarMensagem(threadSelecionada, texto)
      setTexto('')
      listarMensagens(threadSelecionada).then(setMensagens).catch(() => {})
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleReclassificar(jid: string, novoDepartamento: 'rh' | 'posvenda') {
    try {
      await reclassificarThread(jid, novoDepartamento)
      carregarRoteamento()
      carregarThreads()
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Erro inesperado.')
    }
  }

  if (!souAdministrador) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
        As conversas de WhatsApp são conduzidas pelo RH.
      </div>
    )
  }

  const thread = threads.find(t => t.remote_jid === threadSelecionada) ?? null

  return (
    <div className="space-y-4">
      {erroThreads && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroThreads}</span>
        </div>
      )}
      {erroAcao && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroAcao}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de conversas */}
        <Card theme="light" noPadding className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
            <CardTitle>Conversas</CardTitle>
            <div className="flex items-center gap-1.5">
              <button onClick={carregarThreads} title="Atualizar" className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                <RefreshCw className={`h-4 w-4 ${carregandoThreads ? 'animate-spin' : ''}`} />
              </button>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalAberto(true)}>Nova</Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[520px] divide-y divide-neutral-100 overflow-y-auto p-0">
            {threads.map(t => (
              <button
                key={t.remote_jid}
                onClick={() => setThreadSelecionada(t.remote_jid)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 ${
                  threadSelecionada === t.remote_jid ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{nomeThread(t)}</p>
                  <p className="truncate text-xs text-neutral-500">{jidParaTelefone(t.remote_jid)}</p>
                </div>
              </button>
            ))}
            {threads.length === 0 && !carregandoThreads && (
              <p className="px-4 py-8 text-center text-xs text-neutral-400">
                Nenhuma conversa ainda. Elas aparecem aqui quando alguém escolhe "Vagas/RH" no menu do WhatsApp, ou quando você inicia uma.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Conversa selecionada */}
        <Card theme="light" noPadding className="lg:col-span-2">
          <CardHeader className="border-b border-neutral-200 px-5 pt-5 pb-4">
            <CardTitle>{thread ? nomeThread(thread) : 'Selecione uma conversa'}</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[520px] flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {mensagens.map(m => (
                <div key={m.id} className={`flex ${m.from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                    m.from_me ? 'bg-primary/15 text-neutral-900' : 'bg-neutral-100 text-neutral-900'
                  }`}>
                    <p>{m.body}</p>
                    <p className="mt-1 text-[10px] text-neutral-400">{horaLabel(m.created_at)}</p>
                  </div>
                </div>
              ))}
              {thread && mensagens.length === 0 && (
                <p className="py-8 text-center text-xs text-neutral-400">Sem mensagens ainda.</p>
              )}
              {!thread && (
                <p className="py-8 text-center text-xs text-neutral-400">Escolha uma conversa na lista ao lado.</p>
              )}
            </div>
            {thread && (
              <div className="flex items-center gap-2 border-t border-neutral-200 p-3">
                <input
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEnviar() }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <Button size="sm" disabled={!texto.trim()} loading={enviando} onClick={handleEnviar}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Correção manual de roteamento */}
      <Card theme="light" noPadding>
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-5 pt-5 pb-4">
          <CardTitle>Central de Roteamento</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setMostrarRoteamento(v => !v)}>
            {mostrarRoteamento ? 'Ocultar' : 'Corrigir classificação'}
          </Button>
        </CardHeader>
        {mostrarRoteamento && (
          <CardContent className="divide-y divide-neutral-100 px-5 py-3">
            <p className="pb-2 text-xs text-neutral-500">
              Número compartilhado com o Pós-Venda — se o menu classificou errado, corrija aqui.
            </p>
            {roteamento.map(r => (
              <div key={r.remote_jid} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-800">{r.push_name ?? jidParaTelefone(r.remote_jid)} · {jidParaTelefone(r.remote_jid)}</p>
                  <p className="text-[11px] text-neutral-400">{r.status === 'aguardando_escolha' ? 'aguardando escolha' : `decidido: ${r.departamento}`}</p>
                </div>
                {r.status === 'decidido' && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ArrowLeftRight className="h-3.5 w-3.5" />}
                    onClick={() => handleReclassificar(r.remote_jid, r.departamento === 'rh' ? 'posvenda' : 'rh')}
                  >
                    Mover para {r.departamento === 'rh' ? 'Pós-Venda' : 'RH'}
                  </Button>
                )}
                {r.status === 'aguardando_escolha' && <Badge variant="warning">Aguardando</Badge>}
              </div>
            ))}
            {roteamento.length === 0 && (
              <p className="py-4 text-center text-xs text-neutral-400">Nenhum registro ainda.</p>
            )}
          </CardContent>
        )}
      </Card>

      {modalAberto && (
        <NovaConversaModal
          onClose={() => setModalAberto(false)}
          onIniciada={jid => {
            setModalAberto(false)
            carregarThreads()
            setThreadSelecionada(jid)
          }}
        />
      )}
    </div>
  )
}
