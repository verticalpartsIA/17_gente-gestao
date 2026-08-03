-- ============================================================================
-- AVALIAÇÃO DE EXPERIÊNCIA (45 / 90 dias) — Gente & Gestão
-- ============================================================================
--
-- STATUS: APLICADO em 2026-08-03 no projeto Supabase `vpsistema`
--         (ubdkoqxfwcraftesgmbw), migração `create_avaliacoes_experiencia`.
--         Este arquivo é o registro do que está no banco. Não reaplique sem
--         necessidade — é idempotente, mas gera ruído no histórico.
--
-- ATENÇÃO: este banco é COMPARTILHADO com o vpsistema.com (Core: profiles,
-- modules, role_permissions, activity_logs) e com o vprequisicao (req_*).
-- Todo objeto daqui é prefixado avaliacoes_experiencia* / avaliacao_exp_*
-- justamente para não colidir com nada do Core.
--
-- Decisões de modelagem:
--
--  1. O CATÁLOGO DE PERGUNTAS NÃO VIVE NO BANCO.
--     Fica em src/data/avaliacaoExperiencia.ts, versionado no Git. Aqui
--     guardamos só o `criterio_id` (ex: 'OPI-45-04') e `catalogo_versao`.
--     Motivo: quando a redação de uma pergunta mudar, as avaliações antigas
--     continuam apontando para a versão com que foram respondidas — o
--     histórico não vira ficção.
--
--  2. A NOTA DE PERCEPÇÃO É SEPARADA DA NOTA DE DESEMPENHO.
--     `media_desempenho` cobre só os 15 critérios. `termometro_integracao`
--     cobre as 2 perguntas de percepção (PERC-01/02) e NUNCA deve ser somado
--     à nota do colaborador: se a avaliação do superior imediato entrasse na
--     média, o colaborador seria penalizado por criticar a liderança.
--
--  3. TRÊS ESTADOS DISTINTOS PARA UMA RESPOSTA.
--     linha ausente = não respondido | nota 0 = avaliado e não atende |
--     nao_aplica = não se aplica à função (sai do divisor da média).
--
--  4. RLS COM POLICIES DE VERDADE.
--     Ligar RLS sem policy nenhuma bloqueia tudo, inclusive o app. As policies
--     seguem a convenção do banco: get_my_level() (SECURITY DEFINER).
--
--  5. VIEWS COM security_invoker = true.
--     Sem isso a view roda com privilégio do dono e FURA o RLS das tabelas de
--     baixo — inaceitável num banco compartilhado.
--
-- ── Enums (idempotentes) ────────────────────────────────────────────────────

do $$ begin
  create type public.avaliacao_exp_grupo as enum
    ('administrativo','operacional_interno','operacional_externo');
exception when duplicate_object then null; end $$;

do $$ begin
  -- destaque >= 4,5 | aprovado >= 3,5 (parabenizar) | atencao >= 2,5 | critico < 2,5
  create type public.avaliacao_exp_faixa as enum
    ('destaque','aprovado','atencao','critico');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.avaliacao_exp_status as enum ('rascunho','concluida');
exception when duplicate_object then null; end $$;

-- ── Cabeçalho ───────────────────────────────────────────────────────────────

create table if not exists public.avaliacoes_experiencia (
  id                    uuid primary key default gen_random_uuid(),

  colaborador_id        uuid references public.profiles (id) on delete restrict,
  colaborador_nome      text not null,
  colaborador_cargo     text,
  data_admissao         date,

  avaliador_id          uuid references public.profiles (id) on delete set null,
  avaliador_nome        text,

  grupo                 public.avaliacao_exp_grupo not null,
  fase                  smallint not null check (fase in (45, 90)),
  catalogo_versao       integer not null,

  -- Resultado dos 15 critérios de desempenho
  media_desempenho      numeric(3,2) check (media_desempenho between 0 and 5),
  soma_desempenho       numeric(4,1),
  criterios_pontuados   smallint,
  criterios_na          smallint not null default 0,
  faixa                 public.avaliacao_exp_faixa,

  -- Indicador de RH: percepção do colaborador sobre empresa e liderança.
  -- Deliberadamente FORA da média de desempenho.
  termometro_integracao numeric(3,2) check (termometro_integracao between 0 and 5),

  justificativa         text,

  status                public.avaliacao_exp_status not null default 'rascunho',
  concluida_em          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint avaliacoes_experiencia_unica unique (colaborador_id, fase),

  -- Abaixo de 3,5 a decisão precisa de lastro documental escrito
  constraint avaliacoes_experiencia_justificativa_obrigatoria check (
    status <> 'concluida'
    or media_desempenho is null
    or media_desempenho >= 3.5
    or length(coalesce(trim(justificativa), '')) >= 20
  )
);

create index if not exists avaliacoes_experiencia_colaborador_idx
  on public.avaliacoes_experiencia (colaborador_id);
create index if not exists avaliacoes_experiencia_avaliador_idx
  on public.avaliacoes_experiencia (avaliador_id);
create index if not exists avaliacoes_experiencia_fase_idx
  on public.avaliacoes_experiencia (fase, status);

-- Reaproveita a função de timestamp já existente no banco (Core).
drop trigger if exists avaliacoes_experiencia_updated_at on public.avaliacoes_experiencia;
create trigger avaliacoes_experiencia_updated_at
  before update on public.avaliacoes_experiencia
  for each row execute function public.handle_updated_at();

-- ── Respostas ───────────────────────────────────────────────────────────────

create table if not exists public.avaliacoes_experiencia_respostas (
  id            uuid primary key default gen_random_uuid(),
  avaliacao_id  uuid not null
                  references public.avaliacoes_experiencia (id) on delete cascade,

  criterio_id   text not null,   -- ex: 'ADM-45-09', 'OPI-90-04', 'PERC-02'

  -- Escala 0,0 a 5,0 em passos de 0,5 (11 níveis). NULL quando nao_aplica.
  nota          numeric(2,1) check (
                  nota is null
                  or (nota between 0 and 5 and (nota * 2) = floor(nota * 2))
                ),
  nao_aplica    boolean not null default false,
  observacao    text,
  created_at    timestamptz not null default now(),

  constraint avaliacoes_experiencia_respostas_unica
    unique (avaliacao_id, criterio_id),
  constraint avaliacoes_experiencia_respostas_na_sem_nota
    check (not nao_aplica or nota is null)
);

create index if not exists avaliacoes_experiencia_respostas_avaliacao_idx
  on public.avaliacoes_experiencia_respostas (avaliacao_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Convenção do banco: get_my_level() (SECURITY DEFINER) devolve o nível do
-- usuário logado — 'Administrador' | 'Lider' | 'Colaborador'.
--
-- Administrador (RH) = acesso total.
-- Lider = cria e lê as avaliações que ele mesmo aplicou, e só enquanto rascunho.
-- Colaborador = sem acesso.

alter table public.avaliacoes_experiencia          enable row level security;
alter table public.avaliacoes_experiencia_respostas enable row level security;

drop policy if exists avaliacoes_exp_admin_all      on public.avaliacoes_experiencia;
drop policy if exists avaliacoes_exp_avaliador_sel  on public.avaliacoes_experiencia;
drop policy if exists avaliacoes_exp_avaliador_ins  on public.avaliacoes_experiencia;
drop policy if exists avaliacoes_exp_avaliador_upd  on public.avaliacoes_experiencia;

create policy avaliacoes_exp_admin_all on public.avaliacoes_experiencia
  for all to authenticated
  using (public.get_my_level() = 'Administrador')
  with check (public.get_my_level() = 'Administrador');

create policy avaliacoes_exp_avaliador_sel on public.avaliacoes_experiencia
  for select to authenticated
  using (avaliador_id = auth.uid());

create policy avaliacoes_exp_avaliador_ins on public.avaliacoes_experiencia
  for insert to authenticated
  with check (
    avaliador_id = auth.uid()
    and public.get_my_level() in ('Administrador','Lider')
  );

-- Avaliação concluída é registro fechado: não se edita depois.
create policy avaliacoes_exp_avaliador_upd on public.avaliacoes_experiencia
  for update to authenticated
  using (avaliador_id = auth.uid() and status = 'rascunho')
  with check (avaliador_id = auth.uid());

drop policy if exists avaliacoes_exp_resp_admin_all     on public.avaliacoes_experiencia_respostas;
drop policy if exists avaliacoes_exp_resp_avaliador_sel on public.avaliacoes_experiencia_respostas;
drop policy if exists avaliacoes_exp_resp_avaliador_ins on public.avaliacoes_experiencia_respostas;
drop policy if exists avaliacoes_exp_resp_avaliador_upd on public.avaliacoes_experiencia_respostas;

create policy avaliacoes_exp_resp_admin_all on public.avaliacoes_experiencia_respostas
  for all to authenticated
  using (public.get_my_level() = 'Administrador')
  with check (public.get_my_level() = 'Administrador');

-- CONFIDENCIALIDADE DO BLOCO DE PERCEPÇÃO:
-- o avaliador pode GRAVAR as respostas PERC-* mas não pode LÊ-LAS de volta.
-- É o que garante resposta honesta na pergunta sobre o superior imediato —
-- quem responde sabe que o próprio chefe não vai ler. Só o RH lê.
-- Consequência prática no cliente: ao inserir respostas PERC-*, use insert
-- SEM .select() de retorno, senão o RETURNING é bloqueado pela policy.
create policy avaliacoes_exp_resp_avaliador_sel on public.avaliacoes_experiencia_respostas
  for select to authenticated
  using (
    criterio_id not like 'PERC-%'
    and exists (
      select 1 from public.avaliacoes_experiencia a
      where a.id = avaliacao_id and a.avaliador_id = auth.uid()
    )
  );

create policy avaliacoes_exp_resp_avaliador_ins on public.avaliacoes_experiencia_respostas
  for insert to authenticated
  with check (
    exists (
      select 1 from public.avaliacoes_experiencia a
      where a.id = avaliacao_id
        and a.avaliador_id = auth.uid()
        and a.status = 'rascunho'
    )
  );

create policy avaliacoes_exp_resp_avaliador_upd on public.avaliacoes_experiencia_respostas
  for update to authenticated
  using (
    criterio_id not like 'PERC-%'
    and exists (
      select 1 from public.avaliacoes_experiencia a
      where a.id = avaliacao_id
        and a.avaliador_id = auth.uid()
        and a.status = 'rascunho'
    )
  );

-- ── Views ───────────────────────────────────────────────────────────────────
-- security_invoker = true é OBRIGATÓRIO: sem isso a view roda com privilégio
-- do dono e FURA o RLS das tabelas de baixo.

-- Comparativo 45 × 90. Os dois questionários medem coisas diferentes por
-- design, então a comparação é pela média geral e por eixo — nunca pergunta a
-- pergunta (o eixo de cada critério está no catálogo em código).
create or replace view public.avaliacoes_experiencia_evolucao
  with (security_invoker = true) as
  select
    a45.colaborador_id,
    a45.colaborador_nome,
    a45.media_desempenho                        as media_45,
    a90.media_desempenho                        as media_90,
    a90.media_desempenho - a45.media_desempenho as delta,
    (a90.media_desempenho < a45.media_desempenho) as regressao
  from public.avaliacoes_experiencia a45
  join public.avaliacoes_experiencia a90
    on a90.colaborador_id = a45.colaborador_id
   and a90.fase = 90
  where a45.fase = 45
    and a45.status = 'concluida'
    and a90.status = 'concluida';

-- Termômetro de Integração agregado — leitura de RH. Serve para achar o padrão
-- que nenhuma métrica individual mostra: quando vários ingressantes do mesmo
-- gestor dão nota baixa em "Superior Imediato", o problema não é dos novatos.
create or replace view public.avaliacoes_experiencia_termometro
  with (security_invoker = true) as
  select
    a.id            as avaliacao_id,
    a.colaborador_id,
    a.fase,
    a.concluida_em,
    r.criterio_id,
    r.nota,
    r.observacao
  from public.avaliacoes_experiencia a
  join public.avaliacoes_experiencia_respostas r on r.avaliacao_id = a.id
  where r.criterio_id like 'PERC-%';

comment on table public.avaliacoes_experiencia is
  'Avaliação do período de experiência (45/90 dias). Catálogo de perguntas em src/data/avaliacaoExperiencia.ts, versionado por catalogo_versao.';
comment on column public.avaliacoes_experiencia.termometro_integracao is
  'Percepção do colaborador sobre empresa e liderança. Indicador de RH — NUNCA somar à média de desempenho.';
comment on column public.avaliacoes_experiencia_respostas.nao_aplica is
  'N/A: critério não se aplica à função. Sai do divisor da média. Distinto de nota 0 (avaliado e não atende) e de linha ausente (não respondido).';
