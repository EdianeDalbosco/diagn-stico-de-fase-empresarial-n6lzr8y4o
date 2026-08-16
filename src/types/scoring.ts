import { FormStepData, TemperaturaLead, SolucaoRecomendada } from './diagnostico'

/**
 * LÓGICA INTERNA DE DIRECIONAMENTO (NÃO VISÍVEL AO LEAD)
 *
 * Regras de direcionamento:
 * - Dor forte + urgência + capacidade de investimento → "Contato comercial prioritário"
 * - Tem conhecimento/experiência mas não possui oferta, método ou produto estruturado → "Trajetória de Valor 5D"
 * - Tem uma oferta, mas precisa estruturar posicionamento, promessa, produto e monetização → "Trajetória de Valor 5D"
 * - Empresa desorganizada, sem processos, financeiro, indicadores ou gestão estruturada → "Consultoria Empresarial"
 * - Empresa cresceu, mas gestão não acompanhou → "Consultoria Empresarial"
 * - Empresário muito preso ao operacional → "Consultoria / solução de gestão"
 * - Lidera equipe e possui dificuldades com pessoas, comunicação, delegação e resultados → "Jornada Líder 360"
 * - Gestor recém-promovido ou líder sem formação → "Jornada Líder 360"
 * - Busca networking, troca, acompanhamento e ambiente empresarial → "Edvanced Business Club"
 * - Negócio relativamente estruturado e busca conexão + crescimento → "Business Club"
 * - Dor ainda difusa e baixa maturidade → "Conteúdo / evento / Experience / produto de entrada"
 */

export function calculateTemperaturaLead(data: FormStepData): TemperaturaLead {
  const isUrgenciaImediata = data.nivel_prioridade === 'Uma prioridade imediata'
  const isUrgencia90ou6m =
    data.nivel_prioridade === 'Uma prioridade para os próximos 90 dias' ||
    data.nivel_prioridade === 'Algo que quero resolver nos próximos 6 meses'

  const querInvestirSim = data.disposicao_investimento === 'Sim, quero entender as possibilidades'
  const querInvestirDepende = data.disposicao_investimento === 'Depende da solução'
  const querInvestirNao =
    data.disposicao_investimento === 'Não neste momento' ||
    data.disposicao_investimento === 'Ainda estou pesquisando'

  const dorComprimento = (data.dor_principal || '').trim().length
  const temDorForte = dorComprimento > 15

  if (isUrgenciaImediata && (querInvestirSim || (querInvestirDepende && temDorForte))) {
    return 'Quente'
  }

  if (
    (isUrgencia90ou6m && (querInvestirSim || querInvestirDepende)) ||
    (isUrgenciaImediata && querInvestirDepende)
  ) {
    return 'Morno'
  }

  if (querInvestirNao || data.nivel_prioridade === 'Apenas uma ideia para o futuro') {
    return 'Frio'
  }

  return 'Morno'
}

export function calculateSolucaoRecomendada(data: FormStepData): SolucaoRecomendada {
  const isUrgenciaImediata = data.nivel_prioridade === 'Uma prioridade imediata'
  const querInvestirSim = data.disposicao_investimento === 'Sim, quero entender as possibilidades'
  const dorComprimento = (data.dor_principal || '').trim().length
  const temDorForte = dorComprimento > 20

  // 1. Dor forte + urgência + capacidade de investimento → Contato comercial prioritário
  if (isUrgenciaImediata && querInvestirSim && temDorForte) {
    return 'Contato comercial prioritário'
  }

  // 2. Trajetória de Valor 5D (Conhecimento / Infoproduto / Oferta)
  const isConhecimento =
    data.momento_atual ===
      'Tenho conhecimento/experiência, mas ainda não transformei isso em um produto ou negócio' ||
    data.conhecimento_experiencia === 'Sim, mas ainda não sei como estruturar' ||
    data.conhecimento_experiencia === 'Sim, já tenho algo estruturado, mas preciso melhorar' ||
    data.realidade === 'Tenho conhecimento, mas não consigo transformar isso em uma oferta clara' ||
    data.tipo_apoio === 'Quero transformar meu conhecimento em produto e receita' ||
    data.desejo_transformacao === 'Transformar meu conhecimento em produto' ||
    data.desejo_transformacao === 'Criar ou melhorar minha oferta' ||
    data.areas_avancar.includes('Transformar conhecimento em uma oferta vendável') ||
    data.areas_avancar.includes('Criar um método próprio') ||
    data.areas_avancar.includes('Construção de produto ou serviço')

  // 3. Jornada Líder 360 (Liderança / Gestão de Pessoas)
  const isLideranca =
    data.momento_atual === 'Tenho equipe e quero desenvolver minha liderança' ||
    data.momento_atual === 'Sou líder/gestor dentro de uma empresa' ||
    data.tipo_apoio === 'Quero desenvolver minha liderança' ||
    data.desejo_transformacao === 'Me tornar um líder melhor' ||
    data.desejo_transformacao === 'Desenvolver minha equipe' ||
    data.realidade === 'Tenho líderes, mas eles ainda não estão preparados para liderar' ||
    data.realidade === 'Minha equipe depende de mim para praticamente tudo' ||
    data.areas_avancar.includes('Desenvolvimento de líderes') ||
    data.areas_avancar.includes('Comunicação e liderança') ||
    data.areas_avancar.includes('Gestão da equipe')

  // 4. Consultoria / solução de gestão (Operacional / Processos / Gestão que cresceu)
  const isConsultoriaOuGestao =
    data.momento_atual === 'Meu negócio cresceu e agora preciso organizar a gestão' ||
    data.momento_atual === 'Já tenho um negócio, mas ainda funciona de forma muito improvisada' ||
    data.tipo_apoio === 'Preciso de uma consultoria mais estruturada' ||
    data.tipo_apoio === 'Quero alguém analisando meu negócio comigo' ||
    data.realidade === 'Meu negócio funciona, mas depende demais de mim' ||
    data.realidade === 'Minha empresa cresceu sem estrutura' ||
    data.realidade === 'Tenho dificuldade para organizar processos' ||
    data.realidade === 'Trabalho muito, mas não tenho clareza dos números' ||
    data.realidade === 'Tenho faturamento, mas não sei exatamente quanto sobra' ||
    data.desejo_transformacao === 'Organizar processos' ||
    data.desejo_transformacao === 'Ter controle financeiro' ||
    data.desejo_transformacao === 'Construir um negócio que dependa menos de mim' ||
    data.desejo_transformacao === 'Sair do operacional' ||
    data.areas_avancar.includes('Sair do operacional') ||
    data.areas_avancar.includes('Processos e organização interna') ||
    data.areas_avancar.includes('Organização financeira') ||
    data.areas_avancar.includes('Fluxo de caixa e controle financeiro')

  // 5. Business Club / Edvanced Business Club (Networking / Expansão / Troca)
  const isBusinessClub =
    data.momento_atual === 'Quero ampliar meu networking e estar próximo de outros empresários' ||
    data.tipo_apoio === 'Quero participar de um grupo de empresários e ampliar conexões' ||
    data.desejo_transformacao === 'Ampliar meu networking' ||
    data.realidade === 'Quero estar próximo de empresários que também estão crescendo' ||
    data.areas_avancar.includes('Networking e conexões empresariais')

  // Priorização baseada no alinhamento
  if (isConhecimento) {
    return 'Trajetória de Valor 5D'
  }

  if (isLideranca) {
    return 'Jornada Líder 360'
  }

  if (isConsultoriaOuGestao) {
    if (
      data.desejo_transformacao === 'Sair do operacional' ||
      data.realidade === 'Meu negócio funciona, mas depende demais de mim'
    ) {
      return 'Consultoria / solução de gestão'
    }
    return 'Consultoria Empresarial'
  }

  if (isBusinessClub) {
    if (
      data.faixa_faturamento &&
      !['Ainda não faturo', 'Até R$ 10 mil'].includes(data.faixa_faturamento)
    ) {
      return 'Business Club'
    }
    return 'Edvanced Business Club'
  }

  // Se o negócio quer crescer ou aumentar faturamento
  if (
    data.momento_atual === 'Meu negócio está estruturado, mas quero crescer' ||
    data.momento_atual === 'Quero aumentar meu faturamento e gerar novos resultados' ||
    data.tipo_apoio === 'Quero acompanhamento próximo'
  ) {
    return 'Consultoria Empresarial'
  }

  // Caso dor ainda seja difusa ou baixa maturidade
  return 'Conteúdo / evento / Experience / produto de entrada'
}
