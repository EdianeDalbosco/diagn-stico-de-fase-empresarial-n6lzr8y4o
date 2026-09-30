export interface FormStepData {
  // Etapa 1: QUEM É VOCÊ?
  nome: string
  whatsapp: string
  email: string
  instagram: string
  cidade_estado: string

  // Etapa 2: QUAL É O SEU MOMENTO ATUAL?
  momento_atual: string

  // Etapa 3: SOBRE O SEU NEGÓCIO
  tem_negocio: 'Sim' | 'Não' | 'Estou estruturando' | ''
  nome_empresa: string
  segmento: string
  tempo_empresa: string
  tamanho_equipe: string
  faixa_faturamento: string

  // Etapa 4: EM QUAL ÁREA VOCÊ MAIS PRECISA AVANÇAR? (max 3)
  areas_avancar: string[]

  // Etapa 5: QUAL É A SUA PRINCIPAL DOR HOJE?
  dor_principal: string

  // Etapa 6: O QUE MAIS SE PARECE COM A SUA REALIDADE?
  realidade: string

  // Etapa 7: COMO ESTÁ A GESTÃO DO SEU NEGÓCIO HOJE? (0-10)
  notas_gestao: {
    clareza_estrategica: number
    gestao_financeira: number
    processos: number
    vendas: number
    gestao_pessoas: number
    lideranca: number
    planejamento_metas: number
    indicadores_resultados: number
    posicionamento_comunicacao: number
    capacidade_crescer_sem_depender: number
  }

  // Etapa 8: SOBRE LIDERANÇA
  lidera_pessoas: string
  desafio_lideranca: string

  // Etapa 9: SOBRE SEU CONHECIMENTO E EXPERIÊNCIA
  conhecimento_experiencia: string
  transformar_oferta: string

  // Etapa 10: ONDE VOCÊ QUER CHEGAR?
  desejo_transformacao: string

  // Etapa 11: SEU OBJETIVO FINANCEIRO
  objetivo_financeiro: string

  // Etapa 12: O QUE ESTÁ IMPEDINDO VOCÊ DE CHEGAR LÁ?
  impedimentos: string[]

  // Etapa 13: QUAL TIPO DE APOIO FAZ MAIS SENTIDO PARA VOCÊ?
  tipo_apoio: string

  // Etapa 14: NÍVEL DE PRIORIDADE
  nivel_prioridade: string

  // Etapa 15: INVESTIMENTO
  disposicao_investimento: string

  // Etapa 16: ÚLTIMA PERGUNTA
  porque_importante: string
}

export type TemperaturaLead = 'Quente' | 'Morno' | 'Frio'

export type StatusFollowup = 'novo' | 'contatado' | 'em_negociacao' | 'ganho' | 'perdido'

export const STATUS_FOLLOWUP_LABELS: Record<StatusFollowup, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  em_negociacao: 'Em negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

export type SolucaoRecomendada =
  | 'Contato comercial prioritário'
  | 'Trajetória de Valor 5D'
  | 'Consultoria Empresarial'
  | 'Consultoria / solução de gestão'
  | 'Jornada Líder 360'
  | 'Edvanced Business Club'
  | 'Business Club'
  | 'Conteúdo / evento / Experience / produto de entrada'

export interface DiagnosticoRecord extends FormStepData {
  id?: string
  solucao_recomendada: SolucaoRecomendada | string
  temperatura_lead: TemperaturaLead
  status_followup?: StatusFollowup
  /** Token único que protege o acesso à página pública /diagnostico/:id */
  token_acesso?: string
  created?: string
  updated?: string
}

export const initialFormData: FormStepData = {
  nome: '',
  whatsapp: '',
  email: '',
  instagram: '',
  cidade_estado: '',
  momento_atual: '',
  tem_negocio: '',
  nome_empresa: '',
  segmento: '',
  tempo_empresa: '',
  tamanho_equipe: '',
  faixa_faturamento: '',
  areas_avancar: [],
  dor_principal: '',
  realidade: '',
  notas_gestao: {
    clareza_estrategica: 5,
    gestao_financeira: 5,
    processos: 5,
    vendas: 5,
    gestao_pessoas: 5,
    lideranca: 5,
    planejamento_metas: 5,
    indicadores_resultados: 5,
    posicionamento_comunicacao: 5,
    capacidade_crescer_sem_depender: 5,
  },
  lidera_pessoas: '',
  desafio_lideranca: '',
  conhecimento_experiencia: '',
  transformar_oferta: '',
  desejo_transformacao: '',
  objetivo_financeiro: '',
  impedimentos: [],
  tipo_apoio: '',
  nivel_prioridade: '',
  disposicao_investimento: '',
  porque_importante: '',
}
