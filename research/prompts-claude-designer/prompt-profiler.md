# Prompt — VerticalParts Profiler (HTML Prototype para Claude Designer)

## Contexto do Projeto
Você é o Claude Designer para o sistema **VerticalParts RH** — uma plataforma de gestão de pessoas para uma empresa de autopeças de médio porte chamada VerticalParts.

**Tecnologia e estilo visual do projeto:**
- Tema escuro como base (surface = `#0f0f0f`, card = `#1a1a1f`)
- Cor primária: `#F5C400` (amarelo ouro / brand)
- Fontes: Inter (sans) e Barlow Condensed (display/headings)
- Cards com bordas sutis e sombras escuras
- Badges coloridos em capsulas com texto uppercase e tracking-wide
- Ícones Lucide

---

## Módulo: VerticalParts Profiler

O **Profiler** é o módulo de admissão digital e perfil do colaborador — é a "ficha mestra" de cada pessoa na empresa. É o ponto central onde todos os dados de um colaborador são unificados.

### Objetivo do módulo
Criar um HTML prototype da página do Profiler que o RH usa para:
1. Ver o perfil completo de qualquer colaborador
2. Acessar todos os dados pessoais, documentos, contratos e histórico
3. Iniciar processos (atualizar dados, solicitar documentos, etc.)

---

## Seções da página (todas em uma única página com scroll)

### Header do Perfil
- Foto de avatar com iniciais (grande, cor do departamento)
- Nome completo, cargo, departamento
- Status: badge "Ativo", "Admissão", "Desligado"
- Regime: CLT ou PJ
- Data de admissão e tempo de empresa
- Botões: "Editar Perfil", "Gerar Contrato", "Desligar Colaborador"

### Seção 1 — Dados Pessoais
Campos em grid 2 colunas:
- CPF, RG, Data de Nascimento, Sexo
- Estado Civil, Nacionalidade, Naturalidade
- Endereço completo (CEP, rua, número, bairro, cidade, estado)
- Telefone, E-mail pessoal, E-mail corporativo

### Seção 2 — Dados Contratuais
- Cargo, Departamento, Centro de Custo
- Tipo de contrato (CLT/PJ), Regime de trabalho (presencial/híbrido/remoto)
- Salário Base, Data de Admissão, Data do último reajuste
- CTPS (número e série), PIS/PASEP
- Banco, Agência, Conta Corrente

### Seção 3 — Documentos
Lista de 12 documentos com status (Entregue/Pendente/Vencido):
- RG, CPF, PIS/PASEP, Comprovante de residência, Certidão (nascimento/casamento)
- CTPS, Título de eleitor, Certificado reservista, Foto 3x4
- ASO — Exame admissional/periódico, Dados bancários, Formulário pré-admissional

Botão "Upload" para cada documento pendente. Botão "Ver" para os entregues.

### Seção 4 — Histórico de Movimentações
Timeline vertical com eventos:
- Admissão (data e cargo inicial)
- Reajustes salariais (data, valor anterior, novo valor, % aumento)
- Promoções / mudança de cargo
- Advertências / elogios formais
- Férias usufruídas

### Seção 5 — Desempenho (resumo)
Mini-card com último AVD: nota média, ciclo, status
Mini-card com PDI ativo: nome da ação mais relevante, % conclusão
Link para ver página completa de Desempenho

---

## Dados de exemplo (usar nas telas)

**Colaborador exemplo:** Ana Paula Rocha
- CPF: 123.456.789-00
- RG: 12.345.678-9 SSP/SP
- Nascimento: 15/03/1985
- Cargo: Gerente Comercial
- Depto: Comercial
- Admissão: 03/03/2019 (7 anos, 4 meses)
- Salário: R$ 9.000,00
- Regime: CLT, Presencial
- Banco: Itaú, Ag. 1234, C/C 56789-0
- PIS: 123.45678.90-1
- CTPS: 123456 / Série 001 / SP

**Histórico:**
- 03/03/2019 — Admissão como Executiva de Vendas, R$ 5.500
- 01/06/2020 — Reajuste para R$ 6.200 (+12.7%)
- 01/03/2021 — Promoção para Gerente Comercial, R$ 8.000
- 01/01/2023 — Reajuste para R$ 9.000 (+12.5%)
- Jul/2025 — Férias usufruídas (30 dias)

**Desempenho:**
- Último AVD: 4.67/5.0 (Concluído, Q3 2026)
- PDI ativo: Gestão Estratégica EAD (65%)

---

## Instruções de estilo
- Tema escuro: `bg-[#0f0f0f]`, cards `bg-[#1a1a1f]`, bordas `rgba(255,255,255,0.08)`
- Texto principal: `text-white`, secundário: `text-[#8b8b9a]`
- Cor primária: `#F5C400`
- Seções separadas por `<section>` com header em uppercase + tracking-widest
- Botões com bordas e sem preenchimento (outline style) predominante
- Timeline com linha vertical cinza + dots coloridos
- Use `data-lucide="..."` para todos os ícones
- Fonte: Inter (Google Fonts)
- Badges arredondados tipo cápsula, uppercase, texto pequeno
