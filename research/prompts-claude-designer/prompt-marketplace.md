# Prompt — Marketplace de Benefícios (HTML Prototype para Claude Designer)

## Contexto do Projeto
Você é o Claude Designer para o sistema **VerticalParts RH** — uma plataforma de gestão de pessoas para uma empresa de autopeças de médio porte chamada VerticalParts.

**Tecnologia e estilo visual:**
- Tema escuro: surface `#0f0f0f`, card `#1a1a1f`, elevated `#222228`
- Cor primária: `#F5C400` (amarelo ouro)
- Fontes: Inter + Barlow Condensed
- Ícones via `data-lucide="..."`

---

## Módulo: Marketplace de Benefícios

O **Marketplace** é uma vitrine de benefícios flexíveis onde a empresa oferece um saldo mensal (ex: R$ 300/mês) e o colaborador escolhe como usar — em parceiros selecionados, cursos, academias, etc.

### Objetivo do módulo
Criar um HTML prototype do Marketplace de Benefícios com:
- Saldo disponível do colaborador
- Grid de categorias e parceiros
- Histórico de uso

---

## Seções da página

### Header — Saldo Flexível
- Card de destaque com saldo mensal: **R$ 300,00 disponíveis**
- Saldo utilizado: R$ 120,00 (barra de progresso)
- Saldo restante: R$ 180,00
- Data de reset: 01/Ago/2026
- Texto: "Seu saldo renova todo dia 1º. Use em qualquer parceiro abaixo."

### Grid de Categorias (ícones em linha)
- Saúde & Bem-Estar
- Educação & Cursos
- Alimentação
- Transporte
- Cultura & Lazer
- Home Office

### Grid de Parceiros (cards com logo fictício)

**Saúde & Bem-Estar:**
- Academia SmartFit — Plano Black: R$ 99,90/mês — botão "Ativar"
- Psicologia Viva — Sessões online: R$ 150/sessão — botão "Agendar"
- Gympass — Multigyms: a partir de R$ 69,90 — botão "Ativar"

**Educação & Cursos:**
- Alura — Assinatura anual: R$ 200/mês (parcelado) — botão "Assinar"
- Coursera — Certificados internacionais: USD 49/mês — botão "Acessar"
- LinkedIn Learning — R$ 89,90/mês — botão "Ativar"

**Alimentação:**
- Rappi — Créditos de entrega: R$ 50 — botão "Carregar"
- iFood Empresas — R$ 25/semana — botão "Configurar"

**Transporte:**
- 99 Empresas — Créditos de corrida: R$ 80 — botão "Carregar"
- Bike Itaú — Assinatura mensal: R$ 24,90 — botão "Assinar"

**Cultura & Lazer:**
- Ingresso.com — R$ 50 em ingressos — botão "Resgatar"
- Spotify Premium — R$ 21,90/mês — botão "Ativar"

### Histórico de Uso (tabela)
| Data | Categoria | Parceiro | Valor |
|---|---|---|---|
| 15/Jul/2026 | Educação | Alura | R$ 99,90 |
| 10/Jul/2026 | Transporte | 99 Empresas | R$ 20,00 |

### Banner CTA
- "Sugira um parceiro" — formulário simples com nome do serviço e por que seria útil

---

## Instruções de estilo
- Marketplace com visual de e-commerce mas dentro do sistema RH
- Cards de parceiros com logo placeholder (letra inicial em círculo colorido), nome, categoria badge, valor e botão
- Saldo em destaque com card maior, número em amarelo grande
- Barra de progresso de uso do saldo (amarela/verde)
- Filtros por categoria como chips horizontais clicáveis
- Hover nos cards de parceiro com elevação e borda primária
- Badge "Mais Popular" em alguns parceiros
- Cores por categoria: saúde=vermelho, educação=azul, alimentação=laranja, transporte=verde, cultura=roxo
