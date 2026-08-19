import { SolucaoRecomendada } from '@/types/diagnostico'

/**
 * Rótulos PÚBLICOS (visíveis ao lead) para cada solução recomendada.
 *
 * As chaves do tipo `SolucaoRecomendada` são apenas identificadores internos
 * de direcionamento e correspondem a nomes comerciais de produtos. O lead
 * nunca deve ver esses nomes: por isso, ao exibir a solução em qualquer
 * superfície voltada ao lead (página de resultados, PDF, tela de conclusão),
 * use sempre `getLabelPublicoSolucao(...)` no lugar do valor bruto.
 */
const SOLUCAO_LABEL_PUBLICO: Record<string, string> = {
  'Contato comercial prioritário': 'Conversa prioritária com a equipe Edvanced',
  'Trajetória de Valor 5D': 'Estruturar conhecimento em oferta',
  'Consultoria Empresarial': 'Organização e estrutura empresarial',
  'Consultoria / solução de gestão': 'Sair do operacional e organizar a gestão',
  'Jornada Líder 360': 'Desenvolvimento de liderança',
  'Edvanced Business Club': 'Networking e troca entre empresários',
  'Business Club': 'Conexões empresariais de alto nível',
  'Conteúdo / evento / Experience / produto de entrada': 'Conteúdos e experiências para clareza',
}

const LABEL_PADRAO = 'Direcionamento estratégico'

/**
 * Retorna um rótulo público (sem nome de produto) para a solução informada.
 * Caso o valor não seja reconhecido, devolve um rótulo genérico.
 */
export function getLabelPublicoSolucao(solucao: SolucaoRecomendada | string | undefined): string {
  if (!solucao) return LABEL_PADRAO
  return SOLUCAO_LABEL_PUBLICO[solucao] || LABEL_PADRAO
}
