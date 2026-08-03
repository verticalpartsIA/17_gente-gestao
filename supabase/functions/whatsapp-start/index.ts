import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * RH inicia uma conversa nova com um candidato. Cria a linha de roteamento
 * já decidida como 'rh' ANTES de mandar a mensagem — assim, quando a pessoa
 * responder, o dispatcher já sabe que é conversa nossa e não pergunta nada.
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

    // A tela só mostra este botão para Administrador, mas quem garante isso
    // de verdade precisa ser o servidor — chamar a função direto (sem passar
    // pela UI) não pode virar um jeito de mandar WhatsApp da empresa pra
    // qualquer número usando credenciais de serviço.
    const { data: perfil, error: perfilError } = await sb
      .from('profiles')
      .select('level')
      .eq('id', userData.user.id)
      .single()
    if (perfilError || perfil?.level !== 'Administrador') {
      return json({ error: 'Só o RH (Administrador) pode iniciar conversas de WhatsApp.' }, 403)
    }

    const { candidatoId, phone: rawPhone, text } = await req.json()
    if (!rawPhone || !text?.trim()) return json({ error: 'phone e text são obrigatórios' }, 422)

    let phone = String(rawPhone).replace(/\D/g, '')
    if ((phone.length === 10 || phone.length === 11) && !phone.startsWith('55')) phone = '55' + phone
    if (phone.length < 12 || phone.length > 13) {
      return json({ error: 'Número inválido — use DDI+DDD+número (ex: 5511999999999)' }, 422)
    }

    const evoApikey = Deno.env.get('EVOLUTION_APIKEY')
    if (!evoApikey) return json({ error: 'EVOLUTION_APIKEY não configurada' }, 500)

    const remoteJid = `${phone}@s.whatsapp.net`

    const { error: routingError } = await sb.from('contratacao_whatsapp_routing').upsert({
      remote_jid: remoteJid,
      departamento: 'rh',
      status: 'decidido',
      decidido_em: new Date().toISOString(),
      decidido_por: userData.user.id,
      candidato_id: candidatoId ?? null,
    })
    if (routingError) {
      console.error('whatsapp-start: upsert routing falhou', routingError)
      return json({ error: 'Não foi possível registrar o roteamento.' }, 500)
    }

    const r = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: evoApikey },
      body: JSON.stringify({ number: phone, text }),
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
      console.error('whatsapp-start: insert falhou', insertError)
    }

    return json({ ok: true, remoteJid })
  } catch (err) {
    console.error('whatsapp-start: erro inesperado', err)
    return json({ error: 'Erro interno' }, 500)
  }
})
