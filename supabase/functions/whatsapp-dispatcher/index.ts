import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Central de roteamento do WhatsApp compartilhado com o Pós-Venda.
 *
 * Único alvo do webhook da instância Evolution API (pv360). Decide se cada
 * conversa é do RH (Atração de Talentos) ou do Pós-Venda, e SÓ intercepta o
 * que for classificado como RH — tudo o mais é repassado sem alteração pro
 * webhook que o Pós-Venda já usa hoje, para não tocar no código/banco dele.
 *
 * Princípio de segurança: qualquer erro inesperado aqui cai no mesmo lugar
 * que o comportamento de HOJE (repassar tudo pro Pós-Venda) — nunca some
 * uma mensagem por causa de um bug deste dispatcher.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = 'https://ubdkoqxfwcraftesgmbw.supabase.co'
const POSVENDA_WEBHOOK_URL = 'https://posvenda360.vpsistema.com/api/whatsapp/webhook'
const EVO_URL = Deno.env.get('EVOLUTION_URL') ?? 'http://72.61.48.156:8080'
const EVO_INSTANCE = 'pv360'

const RH_PATTERN = /^1$|vaga|emprego|candidat|curr[ií]culo|trabalh|rh\b/
const SUPORTE_PATTERN = /^2$|suporte|atendimento|pedido|reclama|d[uú]vida|pos.?venda|produto/

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function jidToPhone(jid: string) {
  return jid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@c.us', '')
}

function extractBody(msg: Record<string, unknown> | undefined): string {
  if (!msg) return '[mídia]'
  if (typeof msg.conversation === 'string') return msg.conversation
  const ext = msg.extendedTextMessage as Record<string, unknown> | undefined
  if (typeof ext?.text === 'string') return ext.text
  return '[mídia]'
}

async function sendText(apikey: string, number: string, text: string) {
  try {
    await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey },
      body: JSON.stringify({ number, text }),
    })
  } catch (err) {
    console.error('whatsapp-dispatcher: falha ao enviar texto via Evolution', err)
  }
}

async function relayToPosvenda(rawBody: string, apikey: string) {
  try {
    await fetch(POSVENDA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey },
      body: rawBody,
    })
  } catch (err) {
    console.error('whatsapp-dispatcher: falha ao repassar pro Pós-Venda', err)
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method === 'GET') return new Response('OK', { headers: CORS })

  const rawBody = await req.text()
  const apikey = req.headers.get('apikey') ?? ''
  const expected = Deno.env.get('EVOLUTION_APIKEY')

  if (!expected || apikey !== expected) {
    console.warn('whatsapp-dispatcher: apikey inválido')
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = JSON.parse(rawBody)

    if (payload.event !== 'messages.upsert') {
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    const { key, pushName, message } = payload.data ?? {}
    if (!key?.remoteJid) {
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    const remoteJid: string = key.remoteJid
    const fromMe: boolean = key.fromMe ?? false
    const isGroup = remoteJid.endsWith('@g.us')
    const body = extractBody(message)
    const messageId: string | null = key.id ?? null

    if (isGroup) {
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    const sb = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: existing } = await sb
      .from('contratacao_whatsapp_routing')
      .select('*')
      .eq('remote_jid', remoteJid)
      .maybeSingle()

    // Já roteado pro RH — grava aqui, não repassa.
    if (existing?.departamento === 'rh') {
      const { error } = await sb.from('contratacao_whatsapp_mensagens').insert({
        remote_jid: remoteJid, from_me: fromMe, push_name: pushName ?? null, body, message_id: messageId,
      })
      if (error && error.code !== '23505') console.error('whatsapp-dispatcher: insert mensagem rh falhou', error)
      return json({ ok: true })
    }

    // Já roteado pro Pós-Venda — repassa sem tocar em nada.
    if (existing?.departamento === 'posvenda') {
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    // Eco de uma mensagem nossa (fromMe) sem linha de roteamento ainda — não
    // devia acontecer (whatsapp-start/whatsapp-send sempre criam a linha
    // antes de mandar), mas se acontecer o mais seguro é tratar como hoje:
    // repassar pro Pós-Venda.
    if (fromMe) {
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    const texto = body.trim().toLowerCase()
    const ehRH = RH_PATTERN.test(texto)
    const ehSuporte = SUPORTE_PATTERN.test(texto)
    const numero = jidToPhone(remoteJid)

    // Primeiro contato — pergunta e não repassa nada ainda.
    if (!existing) {
      await sb.from('contratacao_whatsapp_routing').insert({
        remote_jid: remoteJid, push_name: pushName ?? null, status: 'aguardando_escolha', tentativas: 0,
      })
      await sendText(
        apikey, numero,
        'Olá! 👋 Pra te encaminhar certo: você quer falar sobre uma *vaga de emprego* ou sobre *um pedido/produto*?\n\nResponda *1* para Vagas (RH) ou *2* para Suporte.',
      )
      return json({ ok: true })
    }

    if (ehRH) {
      await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'rh', status: 'decidido', decidido_em: new Date().toISOString() })
        .eq('remote_jid', remoteJid)
      await sb.from('contratacao_whatsapp_mensagens').insert({
        remote_jid: remoteJid, from_me: false, push_name: pushName ?? null, body, message_id: messageId,
      })
      await sendText(apikey, numero, 'Perfeito! Você está falando com o time de Recrutamento da VerticalParts. Em breve alguém te responde por aqui. 😊')
      return json({ ok: true })
    }

    if (ehSuporte) {
      await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'posvenda', status: 'decidido', decidido_em: new Date().toISOString() })
        .eq('remote_jid', remoteJid)
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    // Não entendeu — repete de forma mais simples, até 3 tentativas. Depois
    // disso, assume o comportamento de hoje (Pós-Venda) em vez de deixar a
    // pessoa presa num menu que ela não está respondendo.
    const tentativas = (existing.tentativas ?? 0) + 1
    if (tentativas >= 3) {
      await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'posvenda', status: 'decidido', decidido_em: new Date().toISOString(), tentativas })
        .eq('remote_jid', remoteJid)
      await relayToPosvenda(rawBody, apikey)
      return json({ ok: true })
    }

    await sb.from('contratacao_whatsapp_routing').update({ tentativas }).eq('remote_jid', remoteJid)
    await sendText(apikey, numero, 'Não entendi 🙏 Responda só *1* (vaga de emprego) ou *2* (suporte/pedido).')
    return json({ ok: true })
  } catch (err) {
    // Qualquer bug daqui pra baixo não pode sumir com a mensagem: cai no
    // mesmo destino de hoje.
    console.error('whatsapp-dispatcher: erro inesperado, repassando por segurança', err)
    await relayToPosvenda(rawBody, apikey)
    return json({ ok: true, fallback: true })
  }
})
