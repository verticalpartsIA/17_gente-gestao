import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * RH responde numa conversa de WhatsApp já roteada para 'rh'. Recusa enviar
 * em qualquer thread que não esteja explicitamente marcada como nossa —
 * evita o RH mandar mensagem numa conversa que é, na verdade, do Pós-Venda.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SB_URL = 'https://ubdkoqxfwcraftesgmbw.supabase.co'
const EVO_URL = Deno.env.get('EVOLUTION_URL') ?? 'http://72.61.48.156:8080'
const EVO_INSTANCE = 'pv360'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function jidToPhone(jid: string) {
  return jid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@c.us', '')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const sbAuth = createClient(SB_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await sbAuth.auth.getUser()
    if (userError || !userData.user) return json({ error: 'Não autenticado' }, 401)

    const sb = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    // Mesma trava do whatsapp-start: a UI só mostra isso para Administrador,
    // mas o servidor não pode confiar só nisso — quem chama a função direto
    // com credenciais de serviço por baixo precisa passar pela mesma regra.
    const { data: perfil, error: perfilError } = await sb
      .from('profiles')
      .select('level')
      .eq('id', userData.user.id)
      .single()
    if (perfilError || perfil?.level !== 'Administrador') {
      return json({ error: 'Só o RH (Administrador) pode enviar mensagens de WhatsApp.' }, 403)
    }

    const { remoteJid, text } = await req.json()
    if (!remoteJid || !text?.trim()) return json({ error: 'remoteJid e text são obrigatórios' }, 422)

    const evoApikey = Deno.env.get('EVOLUTION_APIKEY')
    if (!evoApikey) return json({ error: 'EVOLUTION_APIKEY não configurada' }, 500)

    const { data: routing } = await sb
      .from('contratacao_whatsapp_routing')
      .select('remote_jid, departamento')
      .eq('remote_jid', remoteJid)
      .maybeSingle()

    if (routing?.departamento !== 'rh') {
      return json({ error: 'Esta conversa não está roteada para o RH.' }, 403)
    }

    const r = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: evoApikey },
      body: JSON.stringify({ number: jidToPhone(remoteJid), text }),
    })
    const evResult = await r.json().catch(() => ({}))
    if (!r.ok) {
      const detail = evResult?.message ?? evResult?.error ?? `HTTP ${r.status}`
      return json({ error: `Evolution API: ${detail}` }, 502)
    }

    const messageId = evResult?.key?.id ?? null
    const { error: insertError } = await sb.from('contratacao_whatsapp_mensagens').insert({
      remote_jid: remoteJid, from_me: true, body: text, message_id: messageId,
    })
    if (insertError && insertError.code !== '23505') {
      console.error('whatsapp-send: insert falhou', insertError)
    }

    return json({ ok: true })
  } catch (err) {
    console.error('whatsapp-send: erro inesperado', err)
    return json({ error: 'Erro interno' }, 500)
  }
})
