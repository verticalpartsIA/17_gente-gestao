# Prompt — Suporte (HTML Prototype para Claude Designer)

## Contexto do Projeto
Você é o Claude Designer para o sistema **VerticalParts RH** — uma plataforma de gestão de pessoas para uma empresa de autopeças de médio porte chamada VerticalParts.

**Tecnologia e estilo visual:**
- Tema escuro: surface `#0f0f0f`, card `#1a1a1f`, elevated `#222228`
- Cor primária: `#F5C400` (amarelo ouro)
- Fontes: Inter + Barlow Condensed
- Ícones via `data-lucide="..."`

---

## Módulo: Suporte

A página de **Suporte** é o canal de ajuda e central de atendimento do sistema VerticalParts RH. Serve tanto para colaboradores (dúvidas gerais) quanto para gestores (problemas técnicos, solicitações ao RH).

### Objetivo do módulo
Criar um HTML prototype da página de Suporte com:
- Central de ajuda com FAQ
- Abertura de chamados
- Status dos chamados abertos
- Canais de contato

---

## Seções da página

### Header
- Título: "Central de Suporte — VerticalParts RH"
- Subtítulo: "Como podemos ajudar?"
- Barra de busca grande (buscar artigos de ajuda)

### Cards de Acesso Rápido (4 cards em linha)
1. **Abrir Chamado** — ícone de ticket, descrição: "Reporte problemas ou solicite ajuda"
2. **Ver Meus Chamados** — ícone de lista, descrição: "Acompanhe o status das suas solicitações"
3. **Documentação** — ícone de livro, descrição: "Guias de uso do sistema por módulo"
4. **Falar com RH** — ícone de mensagem, descrição: "Chat direto com a equipe de RH"

---

### Seção: Artigos Mais Acessados (FAQ)
Cards clicáveis com artigos de ajuda:

**Categoria: Folha e Benefícios**
- Como visualizar e baixar meu holerite?
- Como solicitar vale-transporte?
- O que fazer se meu benefício não foi creditado?

**Categoria: Ponto Eletrônico**
- Como justificar uma falta?
- Como funciona o banco de horas?
- Como solicitar abono de horas extras?

**Categoria: Férias**
- Como solicitar férias?
- Quanto tempo demora a aprovação?
- Posso fracionar minhas férias?

**Categoria: Sistema**
- Não consigo fazer login — o que fazer?
- Como atualizar meus dados pessoais?
- Como funciona o Meu Espaço?

---

### Seção: Meus Chamados
Tabela de chamados do usuário logado:
| ID | Assunto | Categoria | Data | Status | Prioridade |
|---|---|---|---|---|---|
| #1042 | Holerite de Junho não disponível | Folha | 20/Jul/2026 | Em atendimento | Média |
| #1038 | Atualização de endereço | Dados pessoais | 10/Jul/2026 | Concluído | Baixa |
| #1031 | Dúvida sobre reajuste salarial | RH | 01/Jul/2026 | Concluído | Baixa |

Status badge: "Aberto" (vermelho), "Em atendimento" (amarelo), "Concluído" (verde)

---

### Formulário: Abrir Novo Chamado (colapsável ou em painel lateral)
Campos:
- **Assunto:** (texto livre)
- **Categoria:** (select: Folha / Ponto / Férias / Benefícios / Dados pessoais / Sistema / Outros)
- **Prioridade:** (Baixa / Média / Alta)
- **Descrição detalhada:** (textarea)
- **Anexar arquivo:** (upload)
- Botão: "Enviar chamado"

---

### Seção: Canais de Contato
Cards de canais alternativos:
- **WhatsApp RH:** (11) 99999-1234 — Horário: Seg–Sex 08h–18h
- **E-mail RH:** rh@verticalparts.com.br
- **Ramal interno:** 2100
- **SLA:** Resposta em até 24h para prioridade média, 4h para alta

---

## Instruções de estilo
- Página mais "amigável" e menos densa que os outros módulos — mais espaçamento, ícones maiores
- FAQ em grid 3 colunas de cards clicáveis com ícone, título e seta de navegação
- Barra de busca hero com fundo levemente elevado e borda primária no focus
- Cards de acesso rápido com ícone grande (40px), cor de fundo suave, hover com borda primária
- Tabela de chamados com ID em fonte mono, status em badge colorido
- Formulário em painel lateral que desliza da direita (drawer)
- Canais de contato em cards horizontais com ícone + texto
- Tom: mais acolhedor e menos técnico — é o ponto de contato humano do sistema
