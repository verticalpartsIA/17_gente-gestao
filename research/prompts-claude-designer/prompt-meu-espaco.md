# Prompt — Meu Espaço (HTML Prototype para Claude Designer)

## Contexto do Projeto
Você é o Claude Designer para o sistema **VerticalParts RH** — uma plataforma de gestão de pessoas para uma empresa de autopeças de médio porte chamada VerticalParts.

**Tecnologia e estilo visual:**
- Tema escuro: surface `#0f0f0f`, card `#1a1a1f`, elevated `#222228`
- Cor primária: `#F5C400` (amarelo ouro)
- Fontes: Inter + Barlow Condensed
- Ícones via `data-lucide="..."`

---

## Módulo: Meu Espaço

O **Meu Espaço** é o portal self-service do colaborador — onde cada funcionário acessa suas próprias informações, documentos e solicitações, sem depender do RH para tudo.

### Objetivo do módulo
Criar um HTML prototype da página "Meu Espaço" com visão do colaborador logado (ponto de vista: Ana Paula Rocha, Gerente Comercial).

---

## Seções da página

### Header — Boas-vindas
- Saudação com nome: "Bom dia, Ana Paula!"
- Sub: "Gerente Comercial · Comercial · 7 anos e 4 meses de empresa"
- Mini avatar com iniciais AP (cor do depto: `#2563EB` — Comercial)
- Data atual e dia da semana

### Card de Resumo Rápido (4 KPIs em linha)
1. **Dias de férias disponíveis:** 30 dias
2. **Horas extras no mês:** +8h (banco de horas)
3. **Próxima revisão salarial:** Jan/2027
4. **PDI em andamento:** 1 ativo (65%)

### Aba 1 — Meus Documentos
Lista de documentos pessoais disponíveis para download:
- Holerite (mês atual e 12 meses anteriores) — botão "Baixar PDF"
- Informe de Rendimentos 2025 — botão "Baixar"
- Comprovante de vínculo empregatício — botão "Gerar"
- Declaração de benefícios — botão "Gerar"
- Cartão CTPS digital — botão "Ver"

### Aba 2 — Minhas Solicitações
Formulário para abrir novas solicitações + lista das existentes:

**Tipos de solicitação disponíveis (botões/cards clicáveis):**
- Solicitação de Férias
- Declaração de Vínculo
- Atualização de dados pessoais
- Solicitação de holerite extra
- Dúvidas sobre benefícios

**Solicitações abertas (tabela):**
| ID | Tipo | Data | Status |
|---|---|---|---|
| SOL-001 | Férias 01/09–30/09 | 18/Jul/2026 | Aprovado |
| SOL-002 | Atualização endereço | 10/Jul/2026 | Concluído |

### Aba 3 — Meu Desempenho
- Gráfico de linha simples: evolução das notas nos últimos 3 ciclos de AVD
  - Q1/2025: 4.2, Q3/2025: 4.5, Q3/2026: 4.67
- PDI atual: lista das 4 ações com status e progresso (barras)
- Treinamentos concluídos: 3 itens

### Aba 4 — Meus Benefícios
Cards visuais para cada benefício ativo:
- Vale Refeição: R$ 25/dia · 22 dias = R$ 550/mês
- Vale Transporte: R$ 6/trajeto (não utiliza)
- Plano de Saúde: Unimed · Copart. R$ 119/mês
- Odontológico: OdontoSESC · R$ 45/mês
- Seguro de Vida: R$ 20/mês
- **Total estimado de benefícios:** R$ 734/mês

---

## Dados do colaborador logado
**Ana Paula Rocha** — Gerente Comercial, Comercial
- Admissão: 03/03/2019
- Salário: R$ 9.000
- Status: Ativa

---

## Instruções de estilo
- Tema escuro com cards elevados
- Cabeçalho com gradiente sutil ou fundo levemente diferenciado
- Abas laterais ou horizontais no estilo tab-bar com borda inferior amarela quando ativa
- KPIs em linha com ícones grandes e números em destaque
- Cores de status: verde=aprovado, amarelo=pendente, cinza=concluído
- Botões de ação com borda primária (outline) no estilo do projeto
- Formulário de nova solicitação em painel lateral (slide-in)
