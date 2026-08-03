// Contrato de dados que o Profiler deveria doar para outras telas — issue #56.
//
// Não existe motor de cálculo comportamental nem tabela de respostas do
// Profiler no banco ainda (ver src/pages/rh/ProfilerPage.tsx). Por isso as
// funções abaixo sempre retornam 'nao_implementado', em vez de fabricar
// composição comportamental. Isso dá um ponto único de integração: quando o
// questionário/engine existir, só este arquivo muda — nenhuma tela
// dependente (Desempenho, Retenção, Gestão de Talentos, Atração,
// Organograma, Dashboard) precisa saber que a fonte virou real.

export type ProfilerStatus = 'nao_implementado' | 'pendente' | 'respondido' | 'vencido'

export interface ProfilerResumo {
  colaboradorId: string
  statusProfiler: ProfilerStatus
  perfilPredominante: string | null
  dataUltimaResposta: string | null
}

function resumoVazio(colaboradorId: string): ProfilerResumo {
  return {
    colaboradorId,
    statusProfiler: 'nao_implementado',
    perfilPredominante: null,
    dataUltimaResposta: null,
  }
}

export async function getProfilerResumo(colaboradorId: string): Promise<ProfilerResumo> {
  return resumoVazio(colaboradorId)
}

export async function getProfilerResumoEquipe(colaboradorIds: string[]): Promise<ProfilerResumo[]> {
  return colaboradorIds.map(resumoVazio)
}
