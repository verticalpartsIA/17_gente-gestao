/**
 * CATÁLOGO — AVALIAÇÃO DE EXPERIÊNCIA (VerticalParts)
 * ============================================================================
 *
 * Este arquivo é a ÚNICA fonte de verdade do conteúdo dos questionários.
 * Para alterar a redação de uma pergunta ou de um tooltip, edite aqui — não há
 * nenhuma outra cópia do texto no projeto.
 *
 * Estrutura: 6 questionários = 3 grupos × 2 fases.
 *   Cada questionário = 15 critérios pontuados + 2 perguntas de percepção = 17.
 *   Os 2 critérios de percepção (PERC-01/02) são os mesmos nos 6 questionários
 *   e NÃO entram na média do colaborador (ver src/lib/avaliacaoScore.ts).
 *
 * Cada critério tem dois textos de apoio ao avaliador:
 *   guia            → reenquadra o que o critério realmente mede (tooltip 🛈)
 *   referenciaNota5 → descreve a evidência que justifica a nota máxima (tooltip 🎯)
 *
 * IMPORTANTE — versionamento: ao alterar redação de perguntas/tooltips, suba
 * CATALOGO_VERSAO. Cada avaliação salva a versão com que foi respondida, para
 * que o histórico continue mostrando o texto que o avaliador realmente leu.
 */

export const CATALOGO_VERSAO = 1

// ── Tipos ────────────────────────────────────────────────────────────────────

export type Grupo = 'administrativo' | 'operacional_interno' | 'operacional_externo'
export type Fase = 45 | 90
export type Bloco = 'desempenho' | 'percepcao'

/** Eixos usados para o gráfico comparativo 45 × 90 dias. Todos os 5 eixos
 *  existem nos 6 questionários, para que o radar seja sempre comparável. */
export type Eixo =
  | 'cultura'
  | 'disciplina'
  | 'tecnica'
  | 'comunicacao'
  | 'resultado'

export interface Criterio {
  id: string
  ordem: number
  eixo: Eixo
  bloco: Bloco
  titulo: string
  pergunta: string
  /** tooltip 🛈 — o que o critério realmente mede */
  guia: string
  /** tooltip 🎯 — evidência que caracteriza a nota máxima */
  referenciaNota5: string
}

export interface Questionario {
  grupo: Grupo
  fase: Fase
  criterios: Criterio[]
}

// ── Rótulos ──────────────────────────────────────────────────────────────────

export const GRUPOS: { valor: Grupo; label: string; descricao: string }[] = [
  {
    valor: 'administrativo',
    label: 'Administrativo',
    descricao: 'Marketing, Financeiro, Jurídico, Importação, Qualidade, Comercial',
  },
  {
    valor: 'operacional_interno',
    label: 'Operacional Interno',
    descricao: 'Almoxarifado, Expedição, Limpeza',
  },
  {
    valor: 'operacional_externo',
    label: 'Operacional Externo',
    descricao: 'Engenharia de Campo',
  },
]

export const FASES: { valor: Fase; label: string; foco: string; decisao: string }[] = [
  {
    valor: 45,
    label: '45 dias',
    foco: 'Integração',
    decisao: 'Decisão de prorrogação do contrato de experiência',
  },
  {
    valor: 90,
    label: '90 dias',
    foco: 'Efetivação',
    decisao: 'Decisão de efetivação — confirma resultados e evolução pós-feedback',
  },
]

export const EIXOS: { valor: Eixo; label: string }[] = [
  { valor: 'cultura',     label: 'Cultura & Comportamento' },
  { valor: 'disciplina',  label: 'Disciplina, Segurança & Zelo' },
  { valor: 'tecnica',     label: 'Técnica & Aprendizado' },
  { valor: 'comunicacao', label: 'Comunicação & Relacionamento' },
  { valor: 'resultado',   label: 'Resultado & Autonomia' },
]

export function eixoLabel(eixo: Eixo): string {
  return EIXOS.find(e => e.valor === eixo)?.label ?? eixo
}

export function grupoLabel(grupo: Grupo): string {
  return GRUPOS.find(g => g.valor === grupo)?.label ?? grupo
}

// ═════════════════════════════════════════════════════════════════════════════
// BLOCO DE PERCEPÇÃO — presente nos 6 questionários, NÃO pontua o colaborador
// ═════════════════════════════════════════════════════════════════════════════

export const CRITERIOS_PERCEPCAO: Criterio[] = [
  {
    id: 'PERC-01',
    ordem: 16,
    eixo: 'cultura',
    bloco: 'percepcao',
    titulo: 'Sobre a VerticalParts',
    pergunta:
      'Como você percebe a VerticalParts desde que entrou: estrutura, clareza do que se espera de você, e o que te surpreendeu — para bem ou para mal?',
    guia:
      'Pergunta feita AO colaborador, não sobre ele. Não interrompa e não corrija a resposta: o valor está no que ele diria se ninguém fosse julgá-lo por isso.',
    referenciaNota5:
      'Nota 5 = encontrou uma empresa melhor do que esperava, com expectativas claras sobre o próprio trabalho. Nota baixa aqui é problema da VerticalParts a resolver, nunca do colaborador.',
  },
  {
    id: 'PERC-02',
    ordem: 17,
    eixo: 'comunicacao',
    bloco: 'percepcao',
    titulo: 'Sobre seu Superior Imediato',
    pergunta:
      'Você recebe do seu superior imediato orientação clara, feedback e abertura para tirar dúvidas?',
    guia:
      'A resposta mais honesta vem quando quem pergunta não é o próprio superior avaliado. Se você é o superior imediato dele, considere pedir que o RH colha esta resposta separadamente.',
    referenciaNota5:
      'Nota 5 = orientação clara, feedback frequente e abertura real para perguntar. Nota baixa é sinal de desenvolvimento de liderança, e nunca deve pesar contra o colaborador.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// ADMINISTRATIVO — 45 DIAS (Integração)
// ═════════════════════════════════════════════════════════════════════════════

const ADM_45: Criterio[] = [
  {
    id: 'ADM-45-01', ordem: 1, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Entendimento do Fluxo',
    pergunta: 'Compreende como o negócio da VerticalParts funciona de ponta a ponta — da importação da peça até a entrega ao cliente?',
    guia: 'Não é decorar o organograma nem saber citar setores. É entender que a peça que ele movimenta num sistema é a mesma que um elevador parado está esperando para voltar a funcionar.',
    referenciaNota5: 'Explica com as próprias palavras o caminho da peça e aponta em que ponto desse caminho o trabalho dele entra — e por que atrasá-lo trava alguém depois.',
  },
  {
    id: 'ADM-45-02', ordem: 2, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Aprendizado de Sistemas',
    pergunta: 'Demonstra agilidade em aprender os softwares de gestão da VerticalParts?',
    guia: 'Agilidade aqui não é velocidade de digitação. É quantas vezes ele precisa perguntar a mesma coisa antes de o processo virar automático.',
    referenciaNota5: 'Opera as rotinas do dia sem consultar colega ou anotação, e já encontrou atalhos que ninguém ensinou.',
  },
  {
    id: 'ADM-45-03', ordem: 3, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Qualidade Inicial',
    pergunta: 'As tarefas entregues (documentos, planilhas, cadastros) estão livres de erros básicos?',
    guia: 'Erro básico é o que uma segunda leitura pega: número trocado, campo vazio, nome errado. Não é erro de julgamento — é desatenção.',
    referenciaNota5: 'Entrega revisada, sem ninguém precisar devolver para corrigir — a revisão dele já é a revisão final.',
  },
  {
    id: 'ADM-45-04', ordem: 4, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Integração Setorial',
    pergunta: 'Já interage de forma produtiva com os outros departamentos administrativos?',
    guia: 'Interagir não é ser simpático no corredor. É conseguir pedir e entregar informação a outro setor sem que a coisa trave ou precise de intermediário.',
    referenciaNota5: 'Já sabe a quem recorrer em cada setor, procura direto e resolve — sem escalar ao gestor o que ele mesmo poderia resolver.',
  },
  {
    id: 'ADM-45-05', ordem: 5, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Comunicação Verbal e Escrita',
    pergunta: 'Expressa-se com clareza e profissionalismo em e-mails, mensagens e reuniões?',
    guia: 'Clareza não é escrever bonito nem longo. É a mensagem ser entendida na primeira leitura, sem gerar três respostas pedindo explicação.',
    referenciaNota5: 'Escreve curto e completo, com pedido e prazo explícitos, e representa bem a VerticalParts ao falar com fornecedor ou cliente.',
  },
  {
    id: 'ADM-45-06', ordem: 6, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Interesse e Proatividade',
    pergunta: 'Demonstra curiosidade real em entender a fundo o portfólio de peças e serviços da empresa?',
    guia: 'Curiosidade não é fazer muita pergunta. É fazer a pergunta seguinte — a que mostra que ele pensou sobre a resposta anterior.',
    referenciaNota5: 'Busca informação por conta própria (catálogo, sistema, colega) e chega ao gestor já com hipótese, não apenas com dúvida.',
  },
  {
    id: 'ADM-45-07', ordem: 7, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Organização',
    pergunta: 'Mantém seus arquivos, registros e prazos iniciais organizados?',
    guia: 'Organização não é mesa limpa. É outra pessoa conseguir achar o que ele fez, caso ele falte amanhã.',
    referenciaNota5: 'Segue o padrão de nomes e pastas da empresa e nunca perdeu um prazo por ter perdido a informação.',
  },
  {
    id: 'ADM-45-08', ordem: 8, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Fit Cultural',
    pergunta: 'Age de acordo com os valores éticos e as normas da VerticalParts?',
    guia: 'Fit cultural não é gostar das mesmas coisas que a equipe. É agir do modo certo quando ninguém está olhando e não haveria consequência.',
    referenciaNota5: 'Assume o próprio erro sem ser confrontado, e já recusou o caminho mais fácil por ele não ser o correto.',
  },
  {
    id: 'ADM-45-09', ordem: 9, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Assiduidade',
    pergunta: 'Cumpre o horário administrativo sem atrasos ou ausências frequentes?',
    guia: 'Assiduidade não é vir todos os dias no mesmo horário — é estar realmente na VerticalParts, de corpo presente. Estar na cadeira sem estar no trabalho não é assiduidade.',
    referenciaNota5: 'Presente, pontual e mentalmente engajado no expediente; quando precisa faltar, avisa antes e deixa o pendente repassado.',
  },
  {
    id: 'ADM-45-10', ordem: 10, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Postura Profissional',
    pergunta: 'Mantém conduta profissional adequada ao ambiente de escritório?',
    guia: 'Postura não é formalidade nem roupa. É o efeito que a presença dele causa: o ambiente fica mais produtivo ou mais ruidoso quando ele chega?',
    referenciaNota5: 'Trata todos os níveis da empresa com o mesmo respeito, e nunca precisou ser chamado à atenção por conduta ou conversa fora de hora.',
  },
  {
    id: 'ADM-45-11', ordem: 11, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Recepção de Treinamento',
    pergunta: 'Mostra-se aberto e atento às orientações dos líderes de setor?',
    guia: 'Abertura não é concordar com tudo. É ouvir até o fim, aplicar, e só então discutir — em vez de explicar de antemão por que não vai dar.',
    referenciaNota5: 'Anota, aplica na mesma semana e volta com a dúvida refinada em vez de repetir a pergunta inicial.',
  },
  {
    id: 'ADM-45-12', ordem: 12, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Agilidade nas Demandas',
    pergunta: 'Responde às demandas internas com a rapidez esperada para quem está iniciando?',
    guia: 'Agilidade não é fazer tudo correndo. É não deixar a demanda parada na mão dele sem ninguém saber em que pé está.',
    referenciaNota5: 'Dá retorno mesmo quando não terminou, informando andamento e prazo — quem pediu nunca precisa cobrar.',
  },
  {
    id: 'ADM-45-13', ordem: 13, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Foco no Cliente Interno',
    pergunta: 'Atende às solicitações dos colegas com presteza e boa vontade?',
    guia: 'O colega que pede algo é cliente. A questão não é se ele atendeu, é se o colega voltaria a pedir para ele sem hesitar.',
    referenciaNota5: 'É procurado espontaneamente pelos colegas, porque atender bem virou reputação dele.',
  },
  {
    id: 'ADM-45-14', ordem: 14, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Uso de Recursos',
    pergunta: 'Utiliza materiais e equipamentos da empresa com zelo?',
    guia: 'Zelo não é economizar por medo. É tratar o que é da empresa com o mesmo critério com que trataria o que é dele.',
    referenciaNota5: 'Equipamento sob a guarda dele está conservado, e ele reporta defeito em vez de deixar quebrar de vez.',
  },
  {
    id: 'ADM-45-15', ordem: 15, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Expectativa vs. Realidade',
    pergunta: 'O desempenho inicial condiz com o que o colaborador apresentou no processo seletivo?',
    guia: 'Não é comparar com o colaborador ideal — é comparar com o que ele mesmo prometeu. A pergunta é se o profissional contratado foi o que apareceu.',
    referenciaNota5: 'Entregou o que dizia saber fazer e, em alguns pontos, superou o que apresentou na entrevista.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// ADMINISTRATIVO — 90 DIAS (Efetivação)
// ═════════════════════════════════════════════════════════════════════════════

const ADM_90: Criterio[] = [
  {
    id: 'ADM-90-01', ordem: 1, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Autonomia Técnica',
    pergunta: 'Realiza as funções centrais do seu cargo sem supervisão constante?',
    guia: 'Autonomia não é trabalhar sozinho. É saber separar o que resolve por conta do que precisa subir para o gestor — e acertar nessa separação.',
    referenciaNota5: 'Conduz a rotina inteira do cargo sem ser conferido, e o gestor só é acionado no que realmente exige decisão dele.',
  },
  {
    id: 'ADM-90-02', ordem: 2, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Evolução Pós-Feedback',
    pergunta: 'Corrigiu de fato as falhas apontadas na avaliação de 45 dias?',
    guia: 'É o critério mais revelador dos 90 dias. Não é se ele aceitou bem o feedback — é se o problema apontado desapareceu.',
    referenciaNota5: 'Os pontos do dia 45 não são mais problema, e ele consegue dizer o que mudou na prática para isso acontecer.',
  },
  {
    id: 'ADM-90-03', ordem: 3, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Visão Estratégica',
    pergunta: 'Sugere melhorias em processos que reduzam custo, retrabalho ou tempo?',
    guia: 'Não é ter opinião sobre tudo. É enxergar o desperdício que virou rotina e que todo mundo já parou de ver.',
    referenciaNota5: 'Trouxe pelo menos uma proposta viável, com noção do impacto — e não apenas apontou o que está errado.',
  },
  {
    id: 'ADM-90-04', ordem: 4, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Domínio de Prazos',
    pergunta: 'Gerencia múltiplas tarefas simultâneas sem perder entregas críticas?',
    guia: 'A questão não é dar conta de tudo — é acertar o que sacrificar quando não dá para fazer tudo.',
    referenciaNota5: 'Prioriza sozinho, avisa antes quando um prazo vai estourar, e nunca perdeu entrega crítica por desorganização.',
  },
  {
    id: 'ADM-90-05', ordem: 5, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Relacionamento Interpessoal',
    pergunta: 'É visto como um facilitador pelos outros departamentos?',
    guia: 'Facilitador é aquele cuja entrada no assunto destrava a coisa. O oposto não é o antipático — é aquele que todos preferem contornar.',
    referenciaNota5: 'Outros setores o procuram direto, por saberem que com ele o assunto anda.',
  },
  {
    id: 'ADM-90-06', ordem: 6, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Precisão Analítica',
    pergunta: 'Seus relatórios e análises são confiáveis o suficiente para embasar decisão?',
    guia: 'Confiável não é bonito nem detalhado. É poder ser usado sem alguém precisar conferir o número por trás.',
    referenciaNota5: 'O gestor decide com base no material dele sem refazer a conta — e nunca foi surpreendido por erro depois.',
  },
  {
    id: 'ADM-90-07', ordem: 7, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Comprometimento com Metas',
    pergunta: 'Bateu as metas parciais estabelecidas para o período de experiência?',
    guia: 'Se não houve meta clara combinada no dia 45, a falha é da gestão e não dele — registre isso na observação antes de pontuar baixo.',
    referenciaNota5: 'Atingiu ou superou o combinado, e sabe dizer de cabeça onde está em relação à meta.',
  },
  {
    id: 'ADM-90-08', ordem: 8, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Resiliência',
    pergunta: 'Lida bem com períodos de alta demanda, urgências e imprevistos do seu setor?',
    guia: 'Resiliência não é não reclamar. É a qualidade do trabalho não cair quando a pressão sobe.',
    referenciaNota5: 'Mantém método e clareza sob pressão, e não contamina a equipe com o próprio estresse.',
  },
  {
    id: 'ADM-90-09', ordem: 9, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Liderança Informal',
    pergunta: 'Começa a auxiliar novos colegas ou estagiários do setor por iniciativa própria?',
    guia: 'Não é sobre cargo. É sobre quem os novatos procuram quando não querem perguntar ao chefe.',
    referenciaNota5: 'Já treinou alguém informalmente e o resultado apareceu no trabalho dessa pessoa.',
  },
  {
    id: 'ADM-90-10', ordem: 10, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Conhecimento do Negócio',
    pergunta: 'Entende o mercado brasileiro de elevadores o suficiente para apoiar decisões da empresa?',
    guia: 'Não é saber tudo do setor. É saber por que o cliente compra da VerticalParts e não do concorrente.',
    referenciaNota5: 'Cita concorrência, prazo e preço com noção real, e usa isso ao argumentar internamente.',
  },
  {
    id: 'ADM-90-11', ordem: 11, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Uso de Tecnologia',
    pergunta: 'Utiliza os recursos dos sistemas internos para otimizar o próprio tempo?',
    guia: 'A pergunta é se ele ainda faz à mão o que o sistema já faz. Muita gente aprende o suficiente para sobreviver e para aí.',
    referenciaNota5: 'Automatizou parte da própria rotina e ensinou o caminho a alguém.',
  },
  {
    id: 'ADM-90-12', ordem: 12, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Inovação',
    pergunta: 'Trouxe alguma ideia nova ou melhoria concreta para o processo do seu setor?',
    guia: 'Inovação aqui é pequena e prática: um passo eliminado, uma planilha que virou automática. Não se espera reinvenção do negócio.',
    referenciaNota5: 'Implantou junto com o gestor uma mudança que continua valendo hoje.',
  },
  {
    id: 'ADM-90-13', ordem: 13, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Ética Profissional',
    pergunta: 'Demonstra integridade ao lidar com informações confidenciais da empresa, de clientes ou de fornecedores?',
    guia: 'Integridade não se mede em ausência de escândalo. Mede-se no comentário que ele não fez e na informação que não circulou por causa dele.',
    referenciaNota5: 'Trata dado sensível com discrição natural, e já cortou uma conversa que não deveria estar acontecendo.',
  },
  {
    id: 'ADM-90-14', ordem: 14, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Pontualidade Consistente',
    pergunta: 'Manteve o padrão de horários e presença depois de ganhar mais liberdade?',
    guia: 'Aqui se mede o que os 45 dias não conseguem medir: se o bom comportamento inicial era caráter ou vitrine.',
    referenciaNota5: 'O padrão do dia 90 é igual ou melhor que o do dia 1, sem ninguém precisar controlar.',
  },
  {
    id: 'ADM-90-15', ordem: 15, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Desejo de Permanência',
    pergunta: 'Expressa planos de longo prazo dentro da VerticalParts?',
    guia: 'Não é declarar amor à empresa. É haver um projeto concreto dele que passa por aqui — quem não vê futuro costuma já estar de saída.',
    referenciaNota5: 'Fala do próprio futuro na VerticalParts com plano específico, não com frase pronta de entrevista.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// OPERACIONAL INTERNO — 45 DIAS (Integração)
// ═════════════════════════════════════════════════════════════════════════════

const OPI_45: Criterio[] = [
  {
    id: 'OPI-45-01', ordem: 1, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Assiduidade Crítica',
    pergunta: 'É pontual na chegada para as rotinas de abertura do galpão?',
    guia: 'Aqui atraso não é detalhe: se ele chega tarde, a operação inteira começa tarde e alguém cobre o buraco. Assiduidade é estar presente de corpo e atenção, não apenas bater ponto.',
    referenciaNota5: 'Chega antes do necessário para começar no horário, e a equipe nunca esperou por ele.',
  },
  {
    id: 'OPI-45-02', ordem: 2, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Segurança e EPIs',
    pergunta: 'Utiliza corretamente os equipamentos de segurança e segue as normas da VerticalParts?',
    guia: 'Não é ter o EPI, é usar do jeito certo mesmo na tarefa rápida — o acidente acontece justamente no "só desta vez".',
    referenciaNota5: 'Usa sem ser lembrado, inclusive quando ninguém da liderança está no galpão.',
  },
  {
    id: 'OPI-45-03', ordem: 3, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Aprendizado da Área',
    pergunta: 'Já domina o mapa físico da sua área, localizando o que precisa sem auxílio constante?',
    guia: 'Não é decorar códigos. É reduzir a dependência do colega — cada pergunta repetida tira duas pessoas da produção.',
    referenciaNota5: 'Encontra sozinho o que precisa e já orienta quem está mais perdido que ele.',
  },
  {
    id: 'OPI-45-04', ordem: 4, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Zelo com Materiais',
    pergunta: 'Demonstra zelo ao manusear peças, materiais e equipamentos, evitando avarias e perdas?',
    guia: 'Peça de elevador avariada não vira desconto: vira cliente parado e frete refeito. A questão é se ele sabe o valor do que tem na mão.',
    referenciaNota5: 'Nenhuma avaria causada por descuido, e adapta o próprio jeito de carregar quando o item é delicado.',
  },
  {
    id: 'OPI-45-05', ordem: 5, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Produtividade Inicial',
    pergunta: 'O volume de trabalho entregue atende ao padrão esperado para o período inicial?',
    guia: 'Compare com o esperado de um iniciante, não com o veterano do setor. O que importa é a curva, não o número absoluto.',
    referenciaNota5: 'Já entrega no ritmo da equipe, mesmo sendo o mais novo.',
  },
  {
    id: 'OPI-45-06', ordem: 6, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Relacionamento em Equipe',
    pergunta: 'Colabora com os colegas de operação de forma harmoniosa?',
    guia: 'Não é ser querido. É a equipe render mais ou menos quando ele está na escala.',
    referenciaNota5: 'Ajuda sem ser pedido e não entra em atrito, mesmo nos dias de correria.',
  },
  {
    id: 'OPI-45-07', ordem: 7, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Disciplina Operacional',
    pergunta: 'Segue as ordens de serviço e os fluxos operacionais sem resistência?',
    guia: 'Seguir não é obedecer calado. É executar o combinado e levar a discordância ao supervisor depois — não fazer do próprio jeito no meio do serviço.',
    referenciaNota5: 'Cumpre o fluxo à risca e, quando discorda, propõe a mudança pelo canal certo.',
  },
  {
    id: 'OPI-45-08', ordem: 8, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Organização do Espaço',
    pergunta: 'Mantém sua área de trabalho limpa e as ferramentas guardadas?',
    guia: 'Área desorganizada em galpão não é questão de estética: é risco de acidente e peça perdida.',
    referenciaNota5: 'Entrega o turno com a área pronta para o próximo, sem ninguém pedir.',
  },
  {
    id: 'OPI-45-09', ordem: 9, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Disposição para a Rotina',
    pergunta: 'Demonstra energia e disposição adequadas às tarefas operacionais da função?',
    guia: 'Não é sobre força física, é sobre constância: muita gente rende bem na primeira hora e desaparece na última.',
    referenciaNota5: 'Mantém o mesmo ritmo do início ao fim do turno, inclusive em dia de carga pesada.',
  },
  {
    id: 'OPI-45-10', ordem: 10, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Comunicação de Falhas',
    pergunta: 'Reporta falhas, avarias ou falta de material ao supervisor imediatamente?',
    guia: 'O problema quase nunca é o erro: é o tempo que o erro ficou escondido. Quem esconde falha custa mais caro que quem falha.',
    referenciaNota5: 'Avisa na hora, mesmo quando a falha foi dele, e já chega com a informação completa.',
  },
  {
    id: 'OPI-45-11', ordem: 11, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Aderência a Horários',
    pergunta: 'Respeita os tempos de intervalo e de almoço?',
    guia: 'Não é rigidez com minutos. É o intervalo dele não virar prejuízo do colega que ficou cobrindo.',
    referenciaNota5: 'Volta no horário sem ser chamado, sempre.',
  },
  {
    id: 'OPI-45-12', ordem: 12, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Iniciativa',
    pergunta: 'Em momentos de baixa demanda, busca manter o ambiente em ordem voluntariamente?',
    guia: 'Este critério separa quem trabalha de quem cumpre horário. Observe o que ele faz quando não há tarefa na fila.',
    referenciaNota5: 'Procura o que fazer sem ser mandado — e o que ele escolhe fazer é realmente útil.',
  },
  {
    id: 'OPI-45-13', ordem: 13, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Adaptação à Função',
    pergunta: 'Mostrou-se confortável com a rotina física e repetitiva do setor?',
    guia: 'Sinceridade aqui evita desligamento no dia 80: se a função não é para ele, é melhor saber agora.',
    referenciaNota5: 'Assumiu a rotina sem desconforto e não demonstra estar de passagem.',
  },
  {
    id: 'OPI-45-14', ordem: 14, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Conhecimento Operacional',
    pergunta: 'Domina a nomenclatura e os materiais próprios da sua função na VerticalParts?',
    guia: 'Falar a língua do galpão evita erro de separação e retrabalho. Não é teoria, é vocabulário de trabalho.',
    referenciaNota5: 'Usa os termos corretos naturalmente e não confunde itens parecidos.',
  },
  {
    id: 'OPI-45-15', ordem: 15, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Comprometimento',
    pergunta: 'Demonstra orgulho em manter o padrão de qualidade da VerticalParts?',
    guia: 'Orgulho aqui aparece no detalhe que ninguém iria conferir — o reforço na embalagem, a etiqueta reta.',
    referenciaNota5: 'Refaz o próprio trabalho quando não ficou bom, mesmo sabendo que passaria.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// OPERACIONAL INTERNO — 90 DIAS (Efetivação)
// ═════════════════════════════════════════════════════════════════════════════

const OPI_90: Criterio[] = [
  {
    id: 'OPI-90-01', ordem: 1, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Excelência Operacional',
    pergunta: 'Executa sua rotina sem erros que gerem retrabalho para colegas ou para o cliente?',
    guia: 'No dia 90 erro de desatenção já não tem desculpa de aprendizado. Conte os erros dos últimos 45 dias, não a impressão geral.',
    referenciaNota5: 'Período recente sem nenhum erro que tenha chegado ao colega ou ao cliente.',
  },
  {
    id: 'OPI-90-02', ordem: 2, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Velocidade e Eficiência',
    pergunta: 'Aumentou a produtividade em relação aos primeiros 45 dias?',
    guia: 'A comparação é com ele mesmo. Quem entrega no dia 90 o mesmo que entregava no dia 45 parou de aprender.',
    referenciaNota5: 'Ganho de ritmo visível, sem queda de qualidade para compensar.',
  },
  {
    id: 'OPI-90-03', ordem: 3, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Consistência de Comportamento',
    pergunta: 'Manteve o bom relacionamento com a equipe ao longo dos três meses?',
    guia: 'Os 45 dias medem impressão; os 90 medem verdade. Muita gente sustenta boa convivência por seis semanas e não por três meses.',
    referenciaNota5: 'É o mesmo colega do primeiro dia, inclusive nas semanas ruins.',
  },
  {
    id: 'OPI-90-04', ordem: 4, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Manutenção do Padrão',
    pergunta: 'O nível de limpeza e organização da área dele é constante, ou caiu depois das primeiras semanas?',
    guia: 'O que se mede aqui é queda de padrão: o esforço que existia porque ele era novo e sumiu quando a vigilância diminuiu.',
    referenciaNota5: 'Padrão igual ou melhor que o das primeiras semanas, sem cobrança.',
  },
  {
    id: 'OPI-90-05', ordem: 5, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Zelo Patrimonial',
    pergunta: 'Continua cuidando das ferramentas e do estoque como se fossem dele?',
    guia: 'Zelo que só dura enquanto está sendo observado não é zelo, é atuação.',
    referenciaNota5: 'Nada sob a guarda dele se perdeu ou se danificou por descuido em 90 dias.',
  },
  {
    id: 'OPI-90-06', ordem: 6, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Segurança Consolidada',
    pergunta: 'O uso de EPIs e o cumprimento das normas já se tornaram hábito natural?',
    guia: 'A diferença entre 45 e 90 dias é esta: no início ele lembra porque foi avisado, no fim ele faz sem pensar.',
    referenciaNota5: 'Usa por hábito e chama a atenção do colega que não está usando.',
  },
  {
    id: 'OPI-90-07', ordem: 7, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Assiduidade e Pontualidade',
    pergunta: 'O histórico de faltas e atrasos nos 90 dias é baixo ou nulo?',
    guia: 'Use o registro real de ponto, não a memória. E separe a falta avisada da falta que deixou o setor descoberto.',
    referenciaNota5: 'Sem faltas injustificadas e sem atraso que tenha afetado a operação.',
  },
  {
    id: 'OPI-90-08', ordem: 8, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Flexibilidade',
    pergunta: 'Aceita bem mudanças de prioridade, como um carregamento urgente de última hora?',
    guia: 'Não é dizer sim a tudo. É a mudança de plano não virar mau humor que a equipe inteira precisa administrar.',
    referenciaNota5: 'Reorganiza-se rápido e sem desgaste quando a prioridade muda.',
  },
  {
    id: 'OPI-90-09', ordem: 9, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Capacidade de Instrução',
    pergunta: 'Já consegue explicar o fluxo básico da área para um novo ajudante?',
    guia: 'Quem sabe fazer e não sabe explicar ainda não domina. Ensinar é o teste final do aprendizado.',
    referenciaNota5: 'Treinou alguém e essa pessoa passou a trabalhar certo a partir da explicação dele.',
  },
  {
    id: 'OPI-90-10', ordem: 10, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Resposta a Críticas',
    pergunta: 'Como reagiu às correções feitas pelo supervisor no dia a dia?',
    guia: 'Observe a segunda reação, não a primeira. Quase todo mundo aceita a crítica na hora; a questão é o que acontece na semana seguinte.',
    referenciaNota5: 'Ouve sem se defender, corrige — e o assunto não precisa voltar.',
  },
  {
    id: 'OPI-90-11', ordem: 11, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Redução de Desperdício',
    pergunta: 'Demonstra cuidado para não desperdiçar materiais de consumo e embalagem?',
    guia: 'Desperdício em galpão é silencioso: é o dobro de plástico, o produto de limpeza usado sem medida. Ninguém percebe até virar custo do mês.',
    referenciaNota5: 'Usa a quantidade certa e aponta onde a operação está desperdiçando.',
  },
  {
    id: 'OPI-90-12', ordem: 12, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Pró-atividade Operacional',
    pergunta: 'Identifica e reporta necessidades de manutenção no galpão?',
    guia: 'Não é consertar, é enxergar antes de quebrar. Quem só reporta depois da parada não está sendo proativo.',
    referenciaNota5: 'Já evitou uma parada por ter avisado de um problema no início.',
  },
  {
    id: 'OPI-90-13', ordem: 13, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Foco no Resultado',
    pergunta: 'Entende a importância do seu trabalho para o cliente final receber a peça certa?',
    guia: 'A pergunta é se ele vê o cliente do outro lado da caixa, ou se está apenas cumprindo uma tarefa que termina na doca.',
    referenciaNota5: 'Confere por iniciativa própria quando algo parece errado, porque sabe o custo do erro chegar ao cliente.',
  },
  {
    id: 'OPI-90-14', ordem: 14, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Disciplina Normativa',
    pergunta: 'Segue o Regulamento Interno da VerticalParts sem advertências no período?',
    guia: 'Critério objetivo: consulte o registro. Zero advertência é 5; cada ocorrência formal derruba a nota.',
    referenciaNota5: 'Nenhuma advertência ou ocorrência formal nos 90 dias.',
  },
  {
    id: 'OPI-90-15', ordem: 15, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Potencial de Crescimento',
    pergunta: 'Demonstra perfil para assumir mais responsabilidades no futuro?',
    guia: 'Não é sobre a vaga de hoje. É se você o veria daqui a dois anos coordenando o turno.',
    referenciaNota5: 'Já assume responsabilidade além do combinado e a equipe naturalmente o escuta.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// OPERACIONAL EXTERNO — 45 DIAS (Integração)
// ═════════════════════════════════════════════════════════════════════════════

const OPE_45: Criterio[] = [
  {
    id: 'OPE-45-01', ordem: 1, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Adaptação a Viagens',
    pergunta: 'Demonstrou resiliência e boa vontade com a rotina de deslocamentos?',
    guia: 'Muita gente aceita viajar na entrevista e descobre no dia 20 que não era o que imaginava. É melhor saber agora.',
    referenciaNota5: 'Encara a rotina de estrada sem desgaste e não tenta escapar das escalas mais distantes.',
  },
  {
    id: 'OPE-45-02', ordem: 2, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Segurança em Campo',
    pergunta: 'Segue rigidamente os protocolos de segurança na remoção de elevadores?',
    guia: 'É o critério mais grave da lista. Remoção com atalho de segurança não é agilidade — é acidente que ainda não aconteceu.',
    referenciaNota5: 'Cumpre o protocolo integralmente mesmo sob pressão de prazo do cliente, e interrompe o serviço quando a condição não é segura.',
  },
  {
    id: 'OPE-45-03', ordem: 3, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Confiança no Trabalho Remoto',
    pergunta: 'Realiza as tarefas com honestidade mesmo longe da supervisão?',
    guia: 'Trabalho externo se sustenta em confiança, não em controle. A pergunta é se o relato dele bate com a realidade da obra.',
    referenciaNota5: 'O que ele reporta sempre confere com o que se verifica depois — inclusive quando o resultado não foi bom.',
  },
  {
    id: 'OPE-45-04', ordem: 4, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Comunicação Remota',
    pergunta: 'Mantém a base informada sobre o progresso do serviço, com relatórios ou fotos?',
    guia: 'Silêncio em campo é problema. Quem só aparece no fim do serviço deixa a base sem poder reagir a tempo.',
    referenciaNota5: 'Envia atualização sem ser cobrado, na frequência combinada, com informação útil — e não apenas "tudo ok".',
  },
  {
    id: 'OPE-45-05', ordem: 5, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Pontualidade no Cliente',
    pergunta: 'Chega aos locais de obra nos horários agendados?',
    guia: 'Atrasar na obra do cliente não é atraso interno: é a imagem da VerticalParts chegando tarde, e às vezes é o condomínio inteiro esperando.',
    referenciaNota5: 'Chega no horário combinado e, quando o imprevisto é real, avisa antes do horário — não depois.',
  },
  {
    id: 'OPE-45-06', ordem: 6, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Uso de Ferramental',
    pergunta: 'Cuida das ferramentas da VerticalParts levadas para o campo?',
    guia: 'Ferramenta em campo é a que mais se perde e a que ninguém vê perder. Confira o retorno, não a intenção.',
    referenciaNota5: 'Ferramental volta completo e conservado de todas as viagens.',
  },
  {
    id: 'OPE-45-07', ordem: 7, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Conhecimento Técnico Base',
    pergunta: 'Possui o domínio mecânico e elétrico básico exigido pela função?',
    guia: 'É o piso técnico, não a excelência. Sem isso ele não deveria estar em campo sozinho — e isso é decisão de segurança, não de desempenho.',
    referenciaNota5: 'Domina o básico com folga e já resolve situações que exigem raciocínio técnico, não apenas procedimento.',
  },
  {
    id: 'OPE-45-08', ordem: 8, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Postura no Cliente',
    pergunta: 'Comporta-se de maneira ética e educada ao representar a marca fora da empresa?',
    guia: 'Em campo ele não representa a si mesmo: para o cliente, ele É a VerticalParts. Uma frase mal colocada custa mais que o serviço.',
    referenciaNota5: 'Gera comentário positivo do cliente e nunca criticou a empresa ou colegas na frente de terceiros.',
  },
  {
    id: 'OPE-45-09', ordem: 9, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Resolução de Problemas',
    pergunta: 'Tenta solucionar pequenos imprevistos em campo antes de acionar a base?',
    guia: 'O equilíbrio é o ponto: quem aciona a base para tudo não tem autonomia; quem nunca aciona pode estar improvisando no lugar errado.',
    referenciaNota5: 'Resolve o que é do alcance dele e aciona a base exatamente no que exige decisão técnica.',
  },
  {
    id: 'OPE-45-10', ordem: 10, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Preenchimento de Documentos',
    pergunta: 'Preenche corretamente as ordens de serviço e os laudos de remoção?',
    guia: 'Documento de campo é a única prova do que foi feito. Laudo incompleto vira prejuízo em discussão com cliente.',
    referenciaNota5: 'Documentação chega completa, legível e no mesmo dia, sem a base precisar pedir complemento.',
  },
  {
    id: 'OPE-45-11', ordem: 11, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Trabalho em Dupla',
    pergunta: 'Sincroniza bem as tarefas com o parceiro de campo?',
    guia: 'Em remoção, dupla dessincronizada é risco físico — não apenas ineficiência.',
    referenciaNota5: 'A dupla trabalha coordenada, com combinação prévia e sem discussão no meio da manobra.',
  },
  {
    id: 'OPE-45-12', ordem: 12, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Adaptação Cultural',
    pergunta: 'Entende que o serviço externo exige disponibilidade e flexibilidade?',
    guia: 'Não é aceitar qualquer coisa. É compreender que obra tem imprevisto e que rigidez de horário costuma ser incompatível com campo.',
    referenciaNota5: 'Ajusta-se a mudanças de escala sem transformar cada alteração em negociação.',
  },
  {
    id: 'OPE-45-13', ordem: 13, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Aprendizado de Processos',
    pergunta: 'Absorveu os métodos específicos de remoção da VerticalParts?',
    guia: 'Experiência anterior ajuda e atrapalha: o veterano de outra empresa às vezes insiste no método antigo. A pergunta é se ele adotou o nosso.',
    referenciaNota5: 'Executa pelo método da casa e sabe explicar por que ele é assim.',
  },
  {
    id: 'OPE-45-14', ordem: 14, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Zelo com Veículo',
    pergunta: 'Mantém o veículo da empresa limpo e dirige com prudência?',
    guia: 'Veículo é o ativo mais caro que a empresa entrega na mão dele, e o único que pode gerar dano a terceiros.',
    referenciaNota5: 'Veículo conservado, sem multa e sem ocorrência, com manutenção reportada em dia.',
  },
  {
    id: 'OPE-45-15', ordem: 15, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Estabilidade Emocional',
    pergunta: 'Lida bem com a pressão de prazos em obras de clientes?',
    guia: 'Em campo não há gestor para absorver a pressão do cliente — ela chega direto nele. A questão é se ele mantém o julgamento técnico sob essa pressão.',
    referenciaNota5: 'Mantém a calma diante de cobrança do cliente e não deixa a pressão comprometer a segurança ou a qualidade.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// OPERACIONAL EXTERNO — 90 DIAS (Efetivação)
// ═════════════════════════════════════════════════════════════════════════════

const OPE_90: Criterio[] = [
  {
    id: 'OPE-90-01', ordem: 1, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Autonomia Total em Campo',
    pergunta: 'Consegue finalizar a remoção de um elevador de forma independente?',
    guia: 'É a pergunta que decide a efetivação nesta função: ele já é um profissional que a empresa pode enviar sozinho?',
    referenciaNota5: 'Conduz o serviço do início ao fim sem suporte, com resultado equivalente ao de um técnico experiente.',
  },
  {
    id: 'OPE-90-02', ordem: 2, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Gestão de Imprevistos',
    pergunta: 'Como lidou com problemas técnicos inesperados fora da empresa?',
    guia: 'Peça a ele um caso concreto dos últimos 45 dias. Resposta genérica aqui geralmente significa que ele ainda não conduziu nada difícil.',
    referenciaNota5: 'Relata um imprevisto real, a decisão que tomou e por quê — e a decisão foi tecnicamente correta.',
  },
  {
    id: 'OPE-90-03', ordem: 3, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Feedback do Cliente',
    pergunta: 'Houve elogios ou reclamações de clientes sobre sua conduta técnica?',
    guia: 'Critério de evidência externa: vale o que o cliente disse, não a impressão interna. Ausência de reclamação não é elogio.',
    referenciaNota5: 'Elogio espontâneo de cliente registrado no período, sem nenhuma reclamação.',
  },
  {
    id: 'OPE-90-04', ordem: 4, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Domínio de Segurança',
    pergunta: 'Demonstra ser exemplo de segurança para os outros em campo?',
    guia: 'No dia 45 bastava cumprir. No dia 90 espera-se que ele puxe o padrão da dupla para cima.',
    referenciaNota5: 'Corrige colega em desvio de segurança e é referência de procedimento correto na equipe.',
  },
  {
    id: 'OPE-90-05', ordem: 5, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Prestação de Contas',
    pergunta: 'Gerencia bem os gastos de viagem e presta contas com rigor?',
    guia: 'Não é gastar pouco, é gastar o justo e comprovar. Prestação de contas atrasada ou incompleta é sinal de alerta em função externa.',
    referenciaNota5: 'Contas em dia, comprovadas e coerentes, sem a base precisar cobrar.',
  },
  {
    id: 'OPE-90-06', ordem: 6, eixo: 'resultado', bloco: 'desempenho',
    titulo: 'Qualidade do Relatório',
    pergunta: 'Os laudos técnicos entregues são detalhados e precisos?',
    guia: 'O laudo é o produto que fica. A pergunta é se a engenharia consegue decidir com ele sem telefonar para o autor.',
    referenciaNota5: 'Laudo suficiente para decisão técnica à distância, com fotos e medições que sustentam a conclusão.',
  },
  {
    id: 'OPE-90-07', ordem: 7, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Manutenção de Ativos',
    pergunta: 'O veículo e as ferramentas sob a posse dele estão bem cuidados após 90 dias?',
    guia: 'Noventa dias é tempo suficiente para o descuido aparecer. Compare o estado atual com o de quando foi entregue.',
    referenciaNota5: 'Ativos em estado igual ao da entrega, descontado o desgaste normal, com manutenções reportadas.',
  },
  {
    id: 'OPE-90-08', ordem: 8, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Confiabilidade Remota',
    pergunta: 'Manteve a produtividade esperada mesmo sem supervisão direta?',
    guia: 'É o teste central do trabalho externo: o rendimento dele depende ou não de alguém olhando?',
    referenciaNota5: 'Produtividade constante nos 90 dias, sem relação com a presença ou ausência de supervisão.',
  },
  {
    id: 'OPE-90-09', ordem: 9, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Evolução Técnica',
    pergunta: 'Aprendeu as particularidades dos modelos mais difíceis de remover?',
    guia: 'A comparação é com o próprio dia 45. Quem só sabe fazer o serviço fácil não evoluiu — apenas repetiu.',
    referenciaNota5: 'Já executou os casos difíceis e sabe antecipar onde cada modelo costuma dar problema.',
  },
  {
    id: 'OPE-90-10', ordem: 10, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Representação de Marca',
    pergunta: 'É visto pelo cliente como um profissional que orgulha a VerticalParts?',
    guia: 'Pense no efeito comercial: o cliente que o recebeu voltaria a contratar a empresa por causa dele?',
    referenciaNota5: 'O cliente pede que ele volte no próximo serviço.',
  },
  {
    id: 'OPE-90-11', ordem: 11, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Trabalho sob Pressão',
    pergunta: 'Manteve a calma e a qualidade técnica em obras com prazos apertados?',
    guia: 'A questão não é se ele entregou no prazo, é o que ele sacrificou para entregar. Prazo cumprido com atalho de segurança é nota baixa, não alta.',
    referenciaNota5: 'Entregou sob pressão sem abrir mão de procedimento nem de segurança.',
  },
  {
    id: 'OPE-90-12', ordem: 12, eixo: 'comunicacao', bloco: 'desempenho',
    titulo: 'Sinergia com a Base',
    pergunta: 'A troca de informações com o escritório flui sem ruídos?',
    guia: 'Ruído aqui custa viagem repetida. Avalie quantas vezes a base precisou refazer algo por informação incompleta dele.',
    referenciaNota5: 'Informação chega completa e no tempo certo; a base nunca precisou refazer trabalho por falha de comunicação.',
  },
  {
    id: 'OPE-90-13', ordem: 13, eixo: 'disciplina', bloco: 'desempenho',
    titulo: 'Assiduidade em Viagens',
    pergunta: 'Cumpriu todos os cronogramas de viagem planejados no trimestre?',
    guia: 'Critério objetivo: confira a escala. Recusa ou remarcação frequente em função externa é incompatibilidade com a função, não preferência.',
    referenciaNota5: 'Cumpriu integralmente a escala do trimestre, inclusive as viagens menos convenientes.',
  },
  {
    id: 'OPE-90-14', ordem: 14, eixo: 'tecnica', bloco: 'desempenho',
    titulo: 'Capacidade de Decisão',
    pergunta: 'Sabe quando deve parar uma obra por risco e reportar à engenharia?',
    guia: 'É o critério que protege a empresa. Quem nunca parou nada pode ser sorte — ou pode ser alguém que não reconhece risco.',
    referenciaNota5: 'Já interrompeu um serviço por risco identificado corretamente, mesmo contrariando a expectativa do cliente.',
  },
  {
    id: 'OPE-90-15', ordem: 15, eixo: 'cultura', bloco: 'desempenho',
    titulo: 'Visão de Carreira',
    pergunta: 'Demonstra interesse em se tornar um especialista sênior na empresa?',
    guia: 'Em campo, formar técnico leva anos. Investir em quem está de passagem é prejuízo — vale saber a intenção real.',
    referenciaNota5: 'Expressa plano concreto de especialização e já busca aprender além do exigido.',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// Montagem dos 6 questionários
// ═════════════════════════════════════════════════════════════════════════════

const BASE: Record<Grupo, Record<Fase, Criterio[]>> = {
  administrativo:       { 45: ADM_45, 90: ADM_90 },
  operacional_interno:  { 45: OPI_45, 90: OPI_90 },
  operacional_externo:  { 45: OPE_45, 90: OPE_90 },
}

/**
 * Retorna os 17 critérios do questionário: os 15 de desempenho do grupo/fase
 * escolhidos, seguidos dos 2 de percepção (comuns a todos os questionários).
 */
export function getQuestionario(grupo: Grupo, fase: Fase): Questionario {
  return {
    grupo,
    fase,
    criterios: [...BASE[grupo][fase], ...CRITERIOS_PERCEPCAO],
  }
}

/** Só os critérios que entram na média do colaborador (sempre 15). */
export function getCriteriosDesempenho(grupo: Grupo, fase: Fase): Criterio[] {
  return BASE[grupo][fase]
}

/** Agrupa os critérios por eixo, na ordem canônica de EIXOS. */
export function agruparPorEixo(criterios: Criterio[]): { eixo: Eixo; label: string; criterios: Criterio[] }[] {
  return EIXOS
    .map(({ valor, label }) => ({
      eixo: valor,
      label,
      criterios: criterios.filter(c => c.eixo === valor),
    }))
    .filter(g => g.criterios.length > 0)
}
