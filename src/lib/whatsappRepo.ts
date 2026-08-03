/**
 * PERSISTÊNCIA — WHATSAPP (Central de Roteamento)
 * ============================================================================
 *
 * Tabelas: contratacao_whatsapp_routing, contratacao_whatsapp_mensagens
 * (ver migração create_contratacao_whatsapp).
 *
 * O número é compartilhado com o Pós-Venda (mesma instância Evolution API).
 * Um webhook único (Edge Function whatsapp-dispatcher) decide se cada
 * conversa é 'rh' ou 'posvenda' — aqui só lidamos com o lado 'rh': o que
 * for 'posvenda' nunca aparece nestas tabelas, foi repassado sem gravação.
 *
 * Envio de mensagem passa pelas Edge Functions whatsapp-send/whatsapp-start
 * (não INSERT direto) porque são elas que chamam a Evolution API de
 * verdade — a tabela é só o espelho do que já foi enviado/recebido.
 */

import { supabase, isMockMode } from './supabase'

const db = supabase as any

export type WhatsappDepartamento = 'rh' | 'posvenda'
export type WhatsappStatus = 'aguardando_escolha' | 'decidido'

export interface WhatsappRouting {
  remote_jid: string
  departamento: WhatsappDepartamento | null
  status: WhatsappStatus
  tentativas: number
  push_name: string | null
  candidato_id: string | null
  decidido_em: string | null
  decidido_por: string | null
  created_at: string
  updated_at: string
}

export interface WhatsappMensagem {
  id: string
  remote_jid: string
  from_me: boolean
  push_name: string | null
  body: string
  media_type: string | null
  message_id: string | null
  created_at: string
}

export function persistenciaDisponivel(): boolean {
  return !isMockMode
}

export function jidParaTelefone(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@c.us', '')
}

/** Conversas roteadas pro RH — as únicas que aparecem no chat do Gente & Gestão. */
export async function listarThreadsRH(): Promise<WhatsappRouting[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('contratacao_whatsapp_routing')
    .select('*')
    .eq('departamento', 'rh')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar as conversas: ${error.message}`)
  return (data ?? []) as WhatsappRouting[]
}

/** Últimas decisões de roteamento (qualquer departamento) — para corrigir classificação errada. */
export async function listarRoteamentoRecente(limite = 30): Promise<WhatsappRouting[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('contratacao_whatsapp_routing')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limite)
  if (error) throw new Error(`Não foi possível carregar o roteamento: ${error.message}`)
  return (data ?? []) as WhatsappRouting[]
}

export async function listarMensagens(remoteJid: string): Promise<WhatsappMensagem[]> {
  if (isMockMode) return []
  const { data, error } = await db
    .from('contratacao_whatsapp_mensagens')
    .select('*')
    .eq('remote_jid', remoteJid)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar as mensagens: ${error.message}`)
  return (data ?? []) as WhatsappMensagem[]
}

/** Só funciona em threads já decididas como 'rh' — a Edge Function recusa o resto. */
export async function enviarMensagem(remoteJid: string, text: string): Promise<void> {
  if (isMockMode) throw new Error('Envio indisponível em modo simulado.')
  const { data, error } = await supabase.functions.invoke('whatsapp-send', {
    body: { remoteJid, text },
  })
  if (error) throw new Error(`Não foi possível enviar: ${error.message}`)
  if (data?.error) throw new Error(data.error)
}

/** Inicia conversa nova — já marca a thread como 'rh' antes de mandar. */
export async function iniciarConversa(
  candidatoId: string | null,
  phone: string,
  text: string,
): Promise<{ remoteJid: string }> {
  if (isMockMode) throw new Error('Envio indisponível em modo simulado.')
  const { data, error } = await supabase.functions.invoke('whatsapp-start', {
    body: { candidatoId, phone, text },
  })
  if (error) throw new Error(`Não foi possível iniciar a conversa: ${error.message}`)
  if (data?.error) throw new Error(data.error)
  return data as { remoteJid: string }
}

/**
 * Correção manual — só é permitido em threads já 'decidido' (RLS). Serve
 * pro caso do menu automático classificar errado.
 */
export async function reclassificarThread(remoteJid: string, novoDepartamento: WhatsappDepartamento): Promise<void> {
  if (isMockMode) throw new Error('Gravação indisponível em modo simulado.')
  const { error } = await db
    .from('contratacao_whatsapp_routing')
    .update({ departamento: novoDepartamento })
    .eq('remote_jid', remoteJid)
  if (error) throw new Error(`Não foi possível corrigir o roteamento: ${error.message}`)
}
