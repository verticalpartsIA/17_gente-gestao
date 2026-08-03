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

/** Retorna true só se a Evolution API confirmou o envio (2xx). */
async function sendText(apikey: string, number: string, text: string): Promise<boolean> {
  try {
    const r = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey },
      body: JSON.stringify({ number, text }),
    })
    if (!r.ok) console.error('whatsapp-dispatcher: Evolution recusou o envio', r.status, await r.text().catch(() => ''))
    return r.ok
  } catch (err) {
    console.error('whatsapp-dispatcher: falha ao enviar texto via Evolution', err)
    return false
  }
}

/** Retorna true só se o Pós-Venda confirmou o recebimento (2xx). */
async function relayToPosvenda(rawBody: string, apikey: string): Promise<boolean> {
  try {
    const r = await fetch(POSVENDA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey },
      body: rawBody,
    })
    if (!r.ok) console.error('whatsapp-dispatcher: Pós-Venda recusou o repasse', r.status, await r.text().catch(() => ''))
    return r.ok
  } catch (err) {
    console.error('whatsapp-dispatcher: falha ao repassar pro Pós-Venda', err)
    return false
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

  // Repasse "oficial" — se falhar, não finge sucesso pro Evolution: quem
  // olhar os logs (ou uma futura fila de retry) precisa saber que essa
  // mensagem NÃO chegou em lugar nenhum.
  async function relayOrFail(): Promise<Response> {
    const ok = await relayToPosvenda(rawBody, apikey)
    return ok ? json({ ok: true }) : json({ error: 'Falha ao repassar pro Pós-Venda' }, 502)
  }

  try {
    const payload = JSON.parse(rawBody)

    if (payload.event !== 'messages.upsert') {
      return await relayOrFail()
    }

    const { key, pushName, message } = payload.data ?? {}
    if (!key?.remoteJid) {
      return await relayOrFail()
    }

    const remoteJid: string = key.remoteJid
    const fromMe: boolean = key.fromMe ?? false
    const isGroup = remoteJid.endsWith('@g.us')
    const body = extractBody(message)
    const messageId: string | null = key.id ?? null

    if (isGroup) {
      return await relayOrFail()
    }

    const sb = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: existing, error: lookupError } = await sb
      .from('contratacao_whatsapp_routing')
      .select('*')
      .eq('remote_jid', remoteJid)
      .maybeSingle()

    // Falha ao consultar o roteamento — NUNCA tratar como "primeiro contato"
    // (isso perderia/atrapalharia uma conversa já decidida). Mais seguro:
    // mesmo destino de hoje.
    if (lookupError) {
      console.error('whatsapp-dispatcher: falha ao consultar roteamento', lookupError)
      return await relayOrFail()
    }

    // Já roteado pro RH — grava aqui, não repassa.
    if (existing?.departamento === 'rh') {
      const { error } = await sb.from('contratacao_whatsapp_mensagens').insert({
        remote_jid: remoteJid, from_me: fromMe, push_name: pushName ?? null, body, message_id: messageId,
      })
      if (error && error.code !== '23505') {
        // Não é duplicata — é uma falha de verdade. Como mensagem 'rh' não
        // é repassada a mais nenhum lugar, não pode virar 200 mentiroso.
        console.error('whatsapp-dispatcher: insert mensagem rh falhou', error)
        return json({ error: 'Falha ao gravar a mensagem' }, 500)
      }
      return json({ ok: true })
    }

    // Já roteado pro Pós-Venda — repassa sem tocar em nada.
    if (existing?.departamento === 'posvenda') {
      return await relayOrFail()
    }

    // Eco de uma mensagem nossa (fromMe) sem linha de roteamento ainda — não
    // devia acontecer (whatsapp-start/whatsapp-send sempre criam a linha
    // antes de mandar), mas se acontecer o mais seguro é tratar como hoje:
    // repassar pro Pós-Venda.
    if (fromMe) {
      return await relayOrFail()
    }

    const texto = body.trim().toLowerCase()
    const ehRH = RH_PATTERN.test(texto)
    const ehSuporte = SUPORTE_PATTERN.test(texto)
    const numero = jidToPhone(remoteJid)

    // Primeiro contato — pergunta e não repassa nada ainda.
    if (!existing) {
      const { error: insertRoutingError } = await sb.from('contratacao_whatsapp_routing').insert({
        remote_jid: remoteJid, push_name: pushName ?? null, status: 'aguardando_escolha', tentativas: 0,
      })
      if (insertRoutingError) console.error('whatsapp-dispatcher: insert routing (1o contato) falhou', insertRoutingError)

      const enviado = await sendText(
        apikey, numero,
        'Olá! 👋 Pra te encaminhar certo: você quer falar sobre uma *vaga de emprego* ou sobre *um pedido/produto*?\n\nResponda *1* para Vagas (RH) ou *2* para Suporte.',
      )
      if (!enviado) return json({ error: 'Falha ao enviar o menu' }, 502)
      return json({ ok: true })
    }

    if (ehRH) {
      const { error: updError } = await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'rh', status: 'decidido', decidido_em: new Date().toISOString() })
        .eq('remote_jid', remoteJid)
      if (updError) {
        console.error('whatsapp-dispatcher: update routing (rh) falhou', updError)
        return json({ error: 'Falha ao gravar o roteamento' }, 500)
      }
      const { error: insError } = await sb.from('contratacao_whatsapp_mensagens').insert({
        remote_jid: remoteJid, from_me: false, push_name: pushName ?? null, body, message_id: messageId,
      })
      if (insError && insError.code !== '23505') {
        console.error('whatsapp-dispatcher: insert mensagem (rh) falhou', insError)
        return json({ error: 'Falha ao gravar a mensagem' }, 500)
      }
      // Confirmação é cortesia — a mensagem do candidato já está gravada
      // acima, então uma falha aqui não perde nada, só não avisa a pessoa.
      const enviado = await sendText(apikey, numero, 'Perfeito! Você está falando com o time de Recrutamento da VerticalParts. Em breve alguém te responde por aqui. 😊')
      if (!enviado) console.warn('whatsapp-dispatcher: confirmação de RH não foi entregue')
      return json({ ok: true })
    }

    if (ehSuporte) {
      const { error: updError } = await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'posvenda', status: 'decidido', decidido_em: new Date().toISOString() })
        .eq('remote_jid', remoteJid)
      if (updError) console.error('whatsapp-dispatcher: update routing (posvenda) falhou', updError)
      return await relayOrFail()
    }

    // Não entendeu — repete de forma mais simples, até 3 tentativas. Depois
    // disso, assume o comportamento de hoje (Pós-Venda) em vez de deixar a
    // pessoa presa num menu que ela não está respondendo.
    const tentativas = (existing.tentativas ?? 0) + 1
    if (tentativas >= 3) {
      const { error: updError } = await sb.from('contratacao_whatsapp_routing')
        .update({ departamento: 'posvenda', status: 'decidido', decidido_em: new Date().toISOString(), tentativas })
        .eq('remote_jid', remoteJid)
      if (updError) console.error('whatsapp-dispatcher: update routing (fallback posvenda) falhou', updError)
      return await relayOrFail()
    }

    const { error: tentError } = await sb.from('contratacao_whatsapp_routing').update({ tentativas }).eq('remote_jid', remoteJid)
    if (tentError) console.error('whatsapp-dispatcher: update tentativas falhou', tentError)
    const enviado = await sendText(apikey, numero, 'Não entendi 🙏 Responda só *1* (vaga de emprego) ou *2* (suporte/pedido).')
    if (!enviado) return json({ error: 'Falha ao enviar o menu' }, 502)
    return json({ ok: true })
  } catch (err) {
    // Qualquer bug daqui pra baixo não pode sumir com a mensagem: cai no
    // mesmo destino de hoje. Se até o repasse de emergência falhar, avisa
    // com sinceridade — não finge sucesso.
    console.error('whatsapp-dispatcher: erro inesperado, repassando por segurança', err)
    const ok = await relayToPosvenda(rawBody, apikey)
    return json({ ok, fallback: true }, ok ? 200 : 502)
  }
})
