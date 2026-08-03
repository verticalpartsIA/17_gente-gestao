// Catálogo de quais dos 12 documentos padrão (criados automaticamente pelo
// trigger contratacao_candidato_contratado no banco) pertencem a cada passo
// do wizard de Admissão Digital (Fase 1 — issue 17_gente-gestao, Passos 1-5).
//
// "ASO — Exame admissional" fica de fora do wizard de propósito: é Passo 6
// (saúde ocupacional/PCD), fora do escopo desta fase — o RH ainda vê e
// gerencia esse documento no backoffice, só não aparece pro candidato aqui.

export const PASSOS_LABEL: Record<number, string> = {
  1: 'Dados Pessoais e Gerais',
  2: 'Endereço e Contato de Emergência',
  3: 'Estado Civil e Dependentes',
  4: 'Dados Profissionais e Documentação Trabalhista',
  5: 'Dados Bancários',
}

export const DOCUMENTOS_POR_PASSO: Record<number, string[]> = {
  1: ['RG', 'CPF', 'Foto 3x4'],
  2: ['Comprovante de residência'],
  3: ['Certidão de nascimento/casamento'],
  4: ['CTPS', 'PIS/PASEP', 'Título de eleitor', 'Certificado reservista', 'Formulário pré-admissional'],
  5: ['Dados bancários'],
}

export function documentosDoPasso(passo: number, nomesDisponiveis: string[]): string[] {
  const esperados = DOCUMENTOS_POR_PASSO[passo] ?? []
  return esperados.filter(nome => nomesDisponiveis.includes(nome))
}
