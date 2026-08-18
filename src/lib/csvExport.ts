import { DiagnosticoRecord } from '@/types/diagnostico'

// Ordem das 10 notas de gestão (mesma do FormStepData.notas_gestao)
const NOTAS_GESTAO_KEYS: { key: keyof DiagnosticoRecord['notas_gestao']; label: string }[] = [
  { key: 'clareza_estrategica', label: 'Clareza estratégica' },
  { key: 'gestao_financeira', label: 'Gestão financeira' },
  { key: 'processos', label: 'Processos' },
  { key: 'vendas', label: 'Vendas' },
  { key: 'gestao_pessoas', label: 'Gestão de pessoas' },
  { key: 'lideranca', label: 'Liderança' },
  { key: 'planejamento_metas', label: 'Planejamento e metas' },
  { key: 'indicadores_resultados', label: 'Indicadores e acompanhamento de resultados' },
  { key: 'posicionamento_comunicacao', label: 'Posicionamento e comunicação' },
  {
    key: 'capacidade_crescer_sem_depender',
    label: 'Capacidade de crescer sem depender ainda mais de você',
  },
]

// Cabeçalho do CSV — inclui as 10 notas de gestão individualmente
const CSV_HEADERS: string[] = [
  'Nome',
  'WhatsApp',
  'E-mail',
  'Instagram',
  'Cidade/Estado',
  'Momento Atual',
  'Tem Negócio',
  'Nome Empresa',
  'Segmento',
  'Tempo Empresa',
  'Tamanho Equipe',
  'Faixa Faturamento',
  'Áreas Avançar',
  'Dor Principal',
  'Realidade',
  ...NOTAS_GESTAO_KEYS.map((n) => n.label),
  'Lidera Pessoas',
  'Desafio Liderança',
  'Conhecimento Experiência',
  'Transformar Oferta',
  'Desejo Transformação',
  'Objetivo Financeiro',
  'Impedimentos',
  'Tipo Apoio',
  'Nível Prioridade',
  'Disposição Investimento',
  'Porque Importante',
  'Solução Recomendada',
  'Temperatura',
  'Data',
]

/**
 * Escapa um valor para o formato CSV (separador ";").
 * Strings contêm ";" ou quebras de linha são envoltas em aspas duplas,
 * e aspas internas são duplicadas. Arrays são unidos por vírgula dentro de aspas.
 */
const esc = (valor: unknown): string => {
  if (valor === null || valor === undefined) return ''
  let str: string
  if (Array.isArray(valor)) {
    str = valor.map((v) => String(v ?? '')).join(', ')
  } else if (typeof valor === 'object') {
    // ex.: notas_gestao — não deve chegar aqui, tratado à parte
    str = JSON.stringify(valor)
  } else {
    str = String(valor)
  }
  // Se contiver separador, quebra de linha ou aspas → envolve em aspas
  if (/[;"\r\n]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const formatarDataCsv = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Gera e baixa um arquivo CSV (UTF-8 com BOM, separador ";") com todos os
 * diagnósticos informados.
 */
export function exportarDiagnosticosCsv(registros: DiagnosticoRecord[]): void {
  const linhas: string[] = [CSV_HEADERS.join(';')]

  for (const d of registros) {
    const nota = (key: keyof DiagnosticoRecord['notas_gestao']): string => {
      const v = d.notas_gestao?.[key]
      return typeof v === 'number' ? String(v).replace('.', ',') : ''
    }

    const colunas: unknown[] = [
      d.nome,
      d.whatsapp,
      d.email,
      d.instagram,
      d.cidade_estado,
      d.momento_atual,
      d.tem_negocio,
      d.nome_empresa,
      d.segmento,
      d.tempo_empresa,
      d.tamanho_equipe,
      d.faixa_faturamento,
      d.areas_avancar,
      d.dor_principal,
      d.realidade,
      ...NOTAS_GESTAO_KEYS.map((n) => nota(n.key)),
      d.lidera_pessoas,
      d.desafio_lideranca,
      d.conhecimento_experiencia,
      d.transformar_oferta,
      d.desejo_transformacao,
      d.objetivo_financeiro,
      d.impedimentos,
      d.tipo_apoio,
      d.nivel_prioridade,
      d.disposicao_investimento,
      d.porque_importante,
      d.solucao_recomendada,
      d.temperatura_lead,
      formatarDataCsv(d.created),
    ]

    linhas.push(colunas.map(esc).join(';'))
  }

  // BOM UTF-8 para abrir corretamente no Excel brasileiro
  const BOM = '\uFEFF'
  const conteudo = BOM + linhas.join('\r\n')

  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dataHora = new Date().toISOString().slice(0, 10)
  link.setAttribute('download', `diagnosticos-edvanced-${dataHora}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
