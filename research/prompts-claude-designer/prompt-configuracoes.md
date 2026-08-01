# Prompt — Configurações (HTML Prototype para Claude Designer)

## Contexto do Projeto
Você é o Claude Designer para o sistema **VerticalParts RH** — uma plataforma de gestão de pessoas para uma empresa de autopeças de médio porte chamada VerticalParts.

**Tecnologia e estilo visual:**
- Tema escuro: surface `#0f0f0f`, card `#1a1a1f`, elevated `#222228`
- Cor primária: `#F5C400` (amarelo ouro)
- Fontes: Inter + Barlow Condensed
- Ícones via `data-lucide="..."`

---

## Módulo: Configurações

A página de **Configurações** é acessível apenas para o Administrador do sistema (Gelson Simões — CEO). É o painel de controle do sistema RH como um todo.

### Objetivo do módulo
Criar um HTML prototype da página de Configurações com:
- Configurações da empresa
- Gestão de usuários e permissões
- Integrações com sistemas externos
- Configurações de notificações

---

## Seções da página (layout em sidebar de categorias + conteúdo à direita)

### Sidebar de Categorias
- Empresa
- Usuários e Permissões
- Módulos Ativos
- Integrações
- Notificações
- Segurança
- Logs de Auditoria

---

### Categoria: Empresa
Formulário com dados da empresa:
- Nome: VerticalParts Soluções Automotivas Ltda
- CNPJ: 12.345.678/0001-90
- Inscrição Estadual: 123.456.789.111
- Endereço: Rua das Autopeças, 1500, Galpão 3, CEP 01310-100, São Paulo — SP
- Setor: Comércio e Serviços — Autopeças
- Nº de colaboradores: 21 (atualizado automaticamente pelo sistema)
- Logotipo: upload de imagem
- Regime tributário: Lucro Presumido
- Botão: "Salvar alterações"

---

### Categoria: Usuários e Permissões
Tabela de usuários do sistema (quem tem acesso ao RH):
| Nome | E-mail | Nível de Acesso | Último Acesso | Status |
|---|---|---|---|---|
| Gelson Simões | gelson@verticalparts.com.br | Administrador | Hoje, 09:32 | Ativo |
| Ana Paula Rocha | ana.paula@verticalparts.com.br | Gestor | 25/Jul/2026 | Ativo |
| Roberto Faria | roberto.faria@verticalparts.com.br | Gestor | 24/Jul/2026 | Ativo |
| Mariana Costa | mariana.costa@verticalparts.com.br | Consultor (PJ) | 20/Jul/2026 | Ativo |

Botão "Convidar Usuário" — abre modal com: nome, e-mail, nível de acesso.

Níveis de acesso:
- **Administrador:** acesso total
- **RH:** todos os módulos de RH, sem configurações
- **Gestor:** apenas colaboradores do próprio departamento
- **Colaborador:** apenas "Meu Espaço"

---

### Categoria: Módulos Ativos
Lista de módulos com toggle on/off:
- [ON] Atração de Talentos
- [ON] Gestão de Talentos
- [ON] Desempenho e Performance
- [ON] Retenção e Engajamento
- [ON] SST — Saúde e Segurança
- [ON] Departamento Pessoal (DP)
- [ON] Folha Digital
- [ON] Gestão de Frota
- [OFF] Marketplace de Benefícios *(em implantação)*
- [OFF] VerticalParts Profiler *(em implantação)*

---

### Categoria: Integrações
Cards de integração com status:
- **Omie ERP** — Status: Conectado · Última sync: Hoje 08:00 · botão "Configurar"
- **Gupy (ATS)** — Status: Desconectado · botão "Conectar"
- **Ponto Mais (Ponto Eletrônico)** — Status: Conectado · botão "Configurar"
- **Unimed (Plano de Saúde)** — Status: Manual · botão "Automatizar"
- **Gov.br / eSocial** — Status: Conectado · botão "Ver logs"
- **Banco Bradesco (Folha)** — Status: Conectado · botão "Configurar"

---

### Categoria: Notificações
Toggles de notificações:
- [ON] E-mail quando ASO vencer em 30 dias
- [ON] WhatsApp quando novo candidato aplica
- [OFF] Resumo semanal de indicadores de RH
- [ON] Alerta de multa de frota
- [ON] Lembrete de entrevista 24h antes

---

### Categoria: Logs de Auditoria
Tabela com os últimos 10 logs:
| Data/Hora | Usuário | Ação | Módulo |
|---|---|---|---|
| 25/Jul 14:32 | Gelson Simões | Editou cargo de Ana Paula Rocha | Gestão de Talentos |
| 25/Jul 10:12 | Ana Paula Rocha | Criou REQ-005 | Atração de Talentos |
| 24/Jul 16:45 | Roberto Faria | Aprovou férias de Carlos Mendes | DP |
| 24/Jul 09:30 | Gelson Simões | Login no sistema | Sistema |
| 23/Jul 18:10 | Gelson Simões | Exportou Folha Digital — Jul/2026 | Folha |

---

## Instruções de estilo
- Layout em duas colunas: sidebar fixa à esquerda + conteúdo à direita (não usar a sidebar global de navegação, usar uma sidebar interna da página)
- Item ativo na sidebar com cor primária e borda esquerda
- Formulários com campos label uppercase small + input dark
- Toggles estilo switch iOS (amarelo quando ativo)
- Cards de integração com status badge colorido + ícone do serviço (letra inicial)
- Tabela de logs com fonte mono para datas e ações
- Botão "Salvar" sticky no rodapé do formulário ativo
