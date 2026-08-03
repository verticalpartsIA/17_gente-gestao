-- ============================================================================
-- AVALIAÇÃO DE EXPERIÊNCIA — PROPOSTA DE PERSISTÊNCIA
-- ============================================================================
--
-- ATENÇÃO: este script NÃO foi aplicado. É uma proposta para revisão.
-- Hoje o questionário funciona de ponta a ponta na interface e calcula o
-- resultado, mas as respostas não são gravadas em lugar nenhum.
--
-- Rode isto (após revisar) para habilitar a persistência, e depois troque o
-- estado local do modal por chamadas ao Supabase.
--
-- Decisões de modelagem:
--
--  1. O CATÁLOGO DE PERGUNTAS NÃO VIVE NO BANCO.
--     Ele fica em src/data/avaliacaoExperiencia.ts, versionado no Git. Aqui
--     guardamos apenas o `criterio_id` (ex: 'OPI-45-04') e o número da versão
--     do catálogo usada. Motivo: quando a redação de uma pergunta mudar, as
--     avaliações antigas continuam apontando para a versão com que foram
--     respondidas — o histórico não vira ficção.
--
--  2. A NOTA DE PERCEPÇÃO É SEPARADA DA NOTA DE DESEMPENHO.
--     `media_desempenho` cobre só os 15 critérios. `termometro_integracao`
--     cobre as 2 perguntas de percepção (PERC-01/02) e NUNCA deve ser somado
--     à nota do colaborador: se a avaliação do superior imediato entrasse na
--     média, o colaborador seria penalizado por criticar a liderança.
--
--  3. N/A é gravado como nota NULL com `nao_aplica = true`, para distinguir
--     de "ainda não respondido" (linha ausente) e de nota 0 (avaliado e não
--     atende).
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────

create type avaliacao_exp_grupo as enum (
  'administrativo',
  'operacional_interno',
  'operacional_externo'
);

create type avaliacao_exp_faixa as enum (
  'destaque',   -- >= 4,5
  'aprovado',   -- >= 3,5  → parabenizar
  'atencao',    -- >= 2,5  → vale repensar
  'critico'     --  < 2,5  → vale repensar
);

create type avaliacao_exp_status as enum ('rascunho', 'concluida');

-- ── Cabeçalho da avaliação ──────────────────────────────────────────────────

create table public.avaliacoes_experiencia (
  id                    uuid primary key default gen_random_uuid(),

  -- Quem é avaliado. Ajuste a FK conforme a tabela de pessoas em uso.
  colaborador_id        uuid references public.profiles (id) on delete restrict,
  colaborador_nome      text not null,
  colaborador_cargo     text,
  data_admissao         date,

  -- Quem avalia
  avaliador_id          uuid references public.profiles (id) on delete set null,
  avaliador_nome        text,

  grupo                 avaliacao_exp_grupo not null,
  fase                  smallint not null check (fase in (45, 90)),

  -- Versão do catálogo (CATALOGO_VERSAO em src/data/avaliacaoExperiencia.ts)
  catalogo_versao       integer not null,

  -- Resultado dos 15 critérios de desempenho
  media_desempenho      numeric(3,2) check (media_desempenho between 0 and 5),
  soma_desempenho       numeric(4,1),
  criterios_pontuados   smallint,
  criterios_na          smallint not null default 0,
  faixa                 avaliacao_exp_faixa,

  -- Indicador de RH — percepção do colaborador sobre empresa e liderança.
  -- Deliberadamente fora da média de desempenho.
  termometro_integracao numeric(3,2) check (termometro_integracao between 0 and 5),

  -- Obrigatória quando media_desempenho < 3,5 (ver constraint abaixo)
  justificativa         text,

  status                avaliacao_exp_status not null default 'rascunho',
  concluida_em          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Uma avaliação por colaborador por fase
  constraint avaliacoes_experiencia_unica
    unique (colaborador_id, fase),

  -- Abaixo de 3,5 a decisão precisa de lastro documental escrito
  constraint avaliacoes_experiencia_justificativa_obrigatoria
    check (
      status <> 'concluida'
      or media_desempenho is null
      or media_desempenho >= 3.5
      or length(coalesce(trim(justificativa), '')) >= 20
    )
);

create index avaliacoes_experiencia_colaborador_idx
  on public.avaliacoes_experiencia (colaborador_id);
create index avaliacoes_experiencia_fase_idx
  on public.avaliacoes_experiencia (fase, status);

-- ── Respostas, uma linha por critério ───────────────────────────────────────

create table public.avaliacoes_experiencia_respostas (
  id            uuid primary key default gen_random_uuid(),
  avaliacao_id  uuid not null
                  references public.avaliacoes_experiencia (id) on delete cascade,

  -- Id do critério no catálogo em código (ex: 'ADM-45-09', 'PERC-02')
  criterio_id   text not null,

  -- Escala 0,0 a 5,0 em passos de 0,5. NULL quando nao_aplica = true.
  nota          numeric(2,1)
                  check (nota is null or (nota between 0 and 5 and (nota * 2) = floor(nota * 2))),
  nao_aplica    boolean not null default false,

  observacao    text,
  created_at    timestamptz not null default now(),

  constraint avaliacoes_experiencia_respostas_unica
    unique (avaliacao_id, criterio_id),

  -- N/A não tem nota; nota preenchida não é N/A
  constraint avaliacoes_experiencia_respostas_na_sem_nota
    check ((nao_aplica and nota is null) or (not nao_aplica))
);

create index avaliacoes_experiencia_respostas_avaliacao_idx
  on public.avaliacoes_experiencia_respostas (avaliacao_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
--
-- As políticas abaixo são um ESQUELETO — ajuste aos papéis reais do projeto
-- antes de aplicar. Dois pontos que não devem ser perdidos:
--
--  • O colaborador avaliado NÃO deve ler as respostas de percepção de outros.
--  • O bloco de percepção (PERC-01/02) deve ser visível ao RH, e não ao
--    superior imediato avaliado na pergunta PERC-02 — é o que garante resposta
--    honesta. Considere expor ao gestor apenas uma view sem esses dois ids.

alter table public.avaliacoes_experiencia enable row level security;
alter table public.avaliacoes_experiencia_respostas enable row level security;

-- Exemplo: view para o gestor, sem o bloco de percepção.
create view public.avaliacoes_experiencia_respostas_gestor as
  select *
  from public.avaliacoes_experiencia_respostas
  where criterio_id not like 'PERC-%';

-- ── Consulta de apoio: comparativo 45 × 90 por colaborador ──────────────────
--
-- Os questionários de 45 e 90 dias medem coisas diferentes por design, então a
-- comparação NÃO é feita pergunta a pergunta — apenas pela média geral e por
-- eixo (o eixo de cada critério está no catálogo em código).

create view public.avaliacoes_experiencia_evolucao as
  select
    a45.colaborador_id,
    a45.colaborador_nome,
    a45.media_desempenho as media_45,
    a90.media_desempenho as media_90,
    a90.media_desempenho - a45.media_desempenho as delta,
    (a90.media_desempenho < a45.media_desempenho) as regressao
  from public.avaliacoes_experiencia a45
  join public.avaliacoes_experiencia a90
    on a90.colaborador_id = a45.colaborador_id
   and a90.fase = 90
  where a45.fase = 45
    and a45.status = 'concluida'
    and a90.status = 'concluida';
