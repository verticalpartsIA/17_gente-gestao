# 🚜 VerticalParts RH & Departamento Pessoal (vprhdp)

<p align="center">
  <strong>Portal Unificado de Gestão de Pessoas, Performance, DP, SST e Frota da VerticalParts.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 💡 Concepção e Desenvolvimento

* **Pensado e Idealizado por:** Gelson Simões
* **Desenvolvido e Refatorado por:** Antigravity (Agente de IA do Google DeepMind)

Este portal foi reconstruído a partir do design system interno da VerticalParts, integrando todos os requisitos de negócio e operacionais mapeados a partir de engenharia reversa do sistema legador da Sólides, unificando os fluxos operacionais em uma experiência moderna de alta fidelidade visual.

---

## 📂 Portfólio de Módulos e Funcionalidades

O sistema está estruturado em torno das seguintes áreas principais de atuação:

### 1. 📊 Painel Geral (Dashboard Administrador)
* **Entenda seus Desligamentos (Rotatividade):** Métricas de colaboradores demitidos com menos de um ano de casa, colaboradores em período de experiência e taxa de rotatividade em tempo real (atualmente zerada e com tendência de queda).
* **Dados de Profiler:** Mapeamento comportamental em tempo real com distribuição percentual (Executor, Comunicador, Planejador, Analista). Tempo médio de permanência (Permanência Média de 832.8 dias) e perfil médio preponderante (`PEC` - Planejador Executor Comunicador).
* **AVD e PDI:** Resumo numérico de avaliações de desempenho (solicitações vs. respostas pendentes) e plano de desenvolvimento individual (indicador de PDIs cadastrados e colaboradores sem PDI).
* **Meus Favoritos e Lembretes:** Seção customizável de favoritos com motor de busca e widget regulatório em destaque para a **NR-1** (prazos e conformidades).
* **Carrosséis Dinâmicos:** Painel interativo de Aniversariantes de Nascimento (ex: Jovanna Mello em 23/05) e Aniversariantes de Casa.

### 2. 🧲 Atração de Talentos (Recrutamento e Seleção)
* **Vagas:** Gestão do funil de posições abertas com métrica de candidatos inscritos e status das oportunidades.
* **Banco de Talentos:** Banco de dados de currículos indexados contendo nome, perfil do Profiler, pretensão salarial, principais competências e data de cadastro.
* **Provas e Testes:** Catálogo de testes aplicáveis (Profiler, Raciocínio Lógico, Fit Cultural, Português, Inglês) com opções de envio de link ou visualização de templates.
* **Métricas do Processo:** Painel analítico de eficiência (Tempo Médio de Contratação / Time-to-Hire, Custo por Contratação, Eficiência por Canal de captação).

### 3. 👥 Gestão de Talentos
* **Admissão Digital:** Acompanhamento do onboarding de pré-admitidos, progresso e upload de documentação.
* **Cargos e Salários (iGPS):** Organização de cargos corporativos alinhados ao Código Brasileiro de Ocupações (CBO), faixas salariais e compliance legal.
* **Departamentos:** Tabela de gerentes responsáveis, total de subordinados ativos, orçamentos mensais estimados e índice de equilíbrio salarial por área (Engenharia, Logística, Financeiro, MKT, etc).
* **Unidades:** Controle geográfico das filiais da empresa (Matriz SP, CD Guarulhos, Filial Santos) com quantidade total de colaboradores por localidade.
* **Aniversariantes:** Consolidação mensal de aniversariantes para eventos internos de endomarketing.

### 4. 📈 Desenvolvimento & Performance
* **Gestão de Metas (Legado):** Visualização de metas institucionais e setoriais em formato de tabela legada (Nome da Meta, Código, Mês/Ano, Valor e Progresso).
* **Aviso de Limite:** Alerta de conformidade de plano avisando ocupação de cotas (47/50 colaboradores ativos).
* **Treinamentos:** Segmento completo com:
  * *Gestão de Treinamentos:* Catálogo de cursos obrigatórios (ex: Direção Defensiva, NR-35 Trabalho em Altura, Integração de Novos Colaboradores) com total de convocados e progresso médio.
  * *Dashboard de Treinamentos:* Cards analíticos de satisfação (Avaliação de Reação 4.8/5.0), total de horas assistidas e taxa de conclusão da empresa.

### 5. 🚒 Saúde, Segurança e Meio Ambiente (SST)
* **Exames Médicos (ASO):** Controle do vencimento de atestados admissionais, periódicos e demissionais dos colaboradores.
* **Fichas de EPI:** Gestão de entrega, validade e assinatura digital dos Equipamentos de Proteção Individual obrigatórios.
* **Normas Regulamentadoras:** Auditoria de conformidade das NRs (NR-1, NR-10, NR-35) aplicadas às operações.

### 6. 🚛 Gestão de Frota
* **Cadastro de Veículos:** Controle de frota logística (carros de frota e utilitários).
* **Infrações e Multas:** Monitoramento de multas registradas, identificação de condutor associado e status de pagamento.

---

## 🌲 Árvore de Navegação do App (Site Tree)

O sistema de rotas client-side mapeia a seguinte estrutura hierárquica:

```text
/ (Raiz) ─── [Redireciona para /dashboard]
├── /login ───────────────── Portal de autenticação (Email + Senha / Auto-SSO via vpsistema)
├── /register ────────────── Cadastro de usuários (com força de senha em tempo real)
├── /forgot-password ─────── Recuperação de credenciais
├── /reset-password ──────── Redefinição de senha
├── /showcase ────────────── Catálogo interativo do VP Design System (Cores, Tipografia, Botões)
│
└── [Rotas Protegidas - AppShell]
    ├── /dashboard ───────── Painel Geral (Métricas Administrador / Colaborador)
    ├── /profiler ────────── Painel de Profiler Individual e Mapeamento de Perfil
    ├── /atracao ─────────── Atração de Talentos
    │                       ├── ?tab=vagas (Funil de recrutamento)
    │                       ├── ?tab=banco (Banco de currículos)
    │                       ├── ?tab=provas (Catálogo de avaliações técnicas/comportamentais)
    │                       └── ?tab=metricas (KPIs de tempo de contratação e custos)
    │
    ├── /gestao-talentos ─── Gestão de Talentos
    │                       ├── ?tab=admissao (Admissão Digital / Onboarding)
    │                       ├── ?tab=cargos (Faixas Salariais / CBO iGPS)
    │                       ├── ?tab=departamentos (Estrutura de Departamentos e Gerentes)
    │                       ├── ?tab=unidades (Lista de Filiais/Centros de Distribuição)
    │                       └── ?tab=aniversariantes (Festa do Mês / Tempo de Casa)
    │
    ├── /desempenho ──────── Performance e Desenvolvimento
    │                       ├── ?tab=competencias (Cadastro de Competências)
    │                       ├── ?tab=avaliacao (Avaliação de Desempenho / Ciclos)
    │                       ├── ?tab=experiencia (Avaliação de Período de Experiência)
    │                       ├── ?tab=metas (Legado de Metas + Aviso de limite de plano)
    │                       ├── ?tab=performance (Análise agregada)
    │                       ├── ?tab=9box (Matriz 9-Box de potencial e desempenho)
    │                       ├── ?tab=pdi (Plano de Desenvolvimento Individual)
    │                       └── ?tab=treinamentos (Gestão de Cursos e KPIs de Treinamentos)
    │
    ├── /retencao-engajamento  Retenção e Engajamento (Clima Organizacional, eNPS, Feedbacks)
    ├── /beneficios ──────── Benefícios Corporativos (VT, VR/VA, Planos de Saúde)
    ├── /colaboradores ───── Cadastro de Colaboradores / Departamento Pessoal
    ├── /ponto ───────────── Ponto Eletrônico (Marcar ponto e consulta a espelho de ponto)
    ├── /holerites ───────── Folha Digital (Emissão e fechamento de holerites em lote)
    ├── /ssma ────────────── Saúde Ocupacional (ASO, EPI, NRs)
    ├── /frota ───────────── Controle de Frota Logística (Veículos e Multas)
    ├── /configuracoes ───── Painel administrativo do sistema (Empresa, RBAC, API)
    ├── /marketplace ─────── Marketplace de upgrades e limite de colaboradores
    ├── /suporte ─────────── Central de atendimento e suporte técnico
    └── /meu-espaco ──────── Espaço do Colaborador (Ponto pessoal, holerites, PDI pessoal)
```

---

## 🛠️ Instruções para Execução Local

### Prerrequisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **Yarn**

### Passo a Passo
1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente:**
   Copie o arquivo `.env.example` para `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```
   Edite as variáveis com as chaves do Supabase (URL e chaves anônimas) quando o backend for configurado.

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse as páginas principais:**
   * Showcase de Componentes: `http://localhost:5173/showcase`
   * Dashboard Principal: `http://localhost:5173/dashboard`

---

## 🤖 Manual da IA (LLM Instructions & Architecture metadata)

> [!NOTE]
> Esta seção foi projetada especificamente para fornecer contexto imediato a outras Inteligências Artificiais e LLMs (como Codex, Claude ou Gemini) que trabalhem neste repositório no futuro.

### Diretrizes de Arquitetura do Frontend
1. **Padrão de Navegação por Abas (`useSearchParams`):**
   * Muitas páginas do sistema (como `/atracao`, `/gestao-talentos`, `/desempenho`, `/ssma` e `/beneficios`) controlam sua navegação interna através de abas no estado sincronizadas com a URL.
   * **Importante:** Sempre utilize o hook `useSearchParams` da biblioteca `react-router-dom` para recuperar o parâmetro `?tab=` na montagem inicial e atualizar o estado ativo. Isso permite que links na Sidebar apontem diretamente para sub-abas específicas (ex: `/desempenho?tab=metas`).
2. **Cores e Identidade Visual (Design Tokens):**
   * A identidade visual da marca **VerticalParts** está ancorada no tom amarelo/ouro:
     * Dourado Primário: `#F5C400` (classe Tailwind `text-primary` ou `bg-primary`)
     * Dourado Hover/Dark: `#C99E00` (classe Tailwind `hover:bg-primary-dark`)
     * Fundos escuros/superfícies: `#0f0f0f` (`bg-surface`), `#1a1a1f` (`bg-surface-card`), `#222228` (`bg-surface-elevated`).
     * Tipografia de Títulos: `Barlow Condensed` (em caixa alta)
     * Tipografia de Texto: `Inter`
3. **Estado de Dados e Mock:**
   * Atualmente, o portal opera com conjuntos de dados locais fictícios, mas estruturados em tipos estritos do TypeScript (interfaces no início de cada página), prontificados para serem vinculados à API do Supabase no futuro.
   * Evite o uso de placeholders vagos. Todo mock inserido deve possuir jargão realista operacional (motoristas de frota, exames de NR-35, motorista de munck, certificados ASO vigentes, etc.).
4. **Verificação de Build:**
   * Sempre execute `npm run build` ou `npx tsc --noEmit` para garantir que novas alterações não quebrem a árvore de tipagem estrita do TypeScript, especialmente ao lidar com os tipos complexos de ícones do `lucide-react`.

---

## 📄 Licença e Uso

Uso interno restrito. Propriedade exclusiva da **VerticalParts © 2026**. Todos os direitos reservados.
