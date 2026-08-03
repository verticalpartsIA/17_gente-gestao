# Edge Functions — Gente & Gestão

Código-fonte das Edge Functions do projeto Supabase `ubdkoqxfwcraftesgmbw`,
versionado aqui só para histórico/revisão — o deploy **não é automático a
partir do git**. Publicar uma alteração exige rodar o deploy manualmente
(painel do Supabase ou `supabase functions deploy <nome>`).

## whatsapp-dispatcher

Único alvo do webhook da instância Evolution API compartilhada com o
Pós-Venda (`pv360`). Decide se cada conversa é do RH ou do Pós-Venda — ver
comentário no topo do arquivo e a migração `create_contratacao_whatsapp`.

`verify_jwt: false` — é um webhook público, autenticado pelo header `apikey`
comparado contra o secret `EVOLUTION_APIKEY`.

## whatsapp-send / whatsapp-start

Usadas pelo app (`src/lib/whatsappRepo.ts`) para o RH responder ou iniciar
conversas. `verify_jwt: true` — exigem sessão autenticada do Gente & Gestão.

## Secrets necessários (Project Settings → Edge Functions → Secrets)

```
EVOLUTION_APIKEY=<apikey da instância pv360>
EVOLUTION_URL=http://72.61.48.156:8080
```

Sem esses dois, as três funções recusam qualquer chamada de propósito —
nunca rodam com uma configuração incompleta silenciosamente.
