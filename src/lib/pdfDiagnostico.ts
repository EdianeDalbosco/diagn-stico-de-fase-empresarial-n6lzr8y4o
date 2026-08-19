import jsPDF from 'jspdf'
import { FormStepData, SolucaoRecomendada, TemperaturaLead } from '@/types/diagnostico'
import { getLabelPublicoSolucao } from '@/lib/solucaoLabels'

// Identidade visual da marca Edvanced
const NAVY = '#0A1E4A'
const NAVY_DARK = '#08173d'
const GOLD = '#B69D64'
const GOLD_LIGHT = '#D4B97A'
const TEXT_DARK = '#2D3748'
const TEXT_MUTED = '#5A6E85'
const BORDER = '#E2E8F0'
const BG_LIGHT = '#F8F9FA'

// Rótulos das 10 notas de gestão (mesma ordem do FormStepData.notas_gestao)
const NOTAS_GESTAO_LABELS: { key: keyof FormStepData['notas_gestao']; label: string }[] = [
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

export interface PdfDiagnosticoData {
  nome: string
  data?: string // ISO da criação do registro
  solucao_recomendada: SolucaoRecomendada | string
  temperatura_lead: TemperaturaLead
  notas_gestao: FormStepData['notas_gestao']
  dor_principal: string
  desejo_transformacao: string
}

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  const n = parseInt(clean, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const corTemperatura = (t: TemperaturaLead): [number, number, number] => {
  if (t === 'Quente') return hexToRgb('#E11D48') // rose-600
  if (t === 'Morno') return hexToRgb('#D97706') // amber-600
  return hexToRgb('#0EA5E9') // sky-500
}

/**
 * Constrói o documento PDF do diagnóstico a partir dos dados informados.
 * Centraliza a montagem para que download e envio por e-mail usem o mesmo
 * conteúdo visual.
 */
export function construirPdfDiagnostico(data: PdfDiagnosticoData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth() // 595.28
  const pageH = doc.internal.pageSize.getHeight() // 841.89
  const margin = 40
  const contentW = pageW - margin * 2

  // ---------- Cabeçalho com a marca ----------
  const headerH = 90
  const [rN, gN, bN] = hexToRgb(NAVY)
  doc.setFillColor(rN, gN, bN)
  doc.rect(0, 0, pageW, headerH, 'F')

  // Faixa dourada inferior do cabeçalho
  const [rG, gG, bG] = hexToRgb(GOLD)
  doc.setFillColor(rG, gG, bG)
  doc.rect(0, headerH - 4, pageW, 4, 'F')

  // Marca Edvanced
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('EDVANCED', margin, 42)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const [rGl, gGl, bGl] = hexToRgb(GOLD_LIGHT)
  doc.setTextColor(rGl, gGl, bGl)
  doc.text('HUB DE DESENVOLVIMENTO & SOLUÇÕES EMPRESARIAIS', margin, 58)

  doc.setFontSize(8)
  doc.setTextColor(200, 210, 225)
  doc.text('Diagnóstico de Fase Empresarial', margin, 72)

  // ---------- Corpo ----------
  let y = headerH + 28

  // Título do relatório
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(rN, gN, bN)
  doc.setFontSize(16)
  doc.text('Relatório de Diagnóstico', margin, y)

  y += 6
  doc.setDrawColor(rG, gG, bG)
  doc.setLineWidth(2)
  doc.line(margin, y, margin + 60, y)

  y += 22

  // Bloco de identificação (nome + data)
  const dataFmt = data.data
    ? new Date(data.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })

  const drawInfoLinha = (label: string, valor: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(hexToRgb(TEXT_MUTED)[0], hexToRgb(TEXT_MUTED)[1], hexToRgb(TEXT_MUTED)[2])
    doc.text(label.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(hexToRgb(TEXT_DARK)[0], hexToRgb(TEXT_DARK)[1], hexToRgb(TEXT_DARK)[2])
    doc.text(valor || '-', margin, y + 14)
    y += 30
  }

  drawInfoLinha('Nome do lead', data.nome)
  drawInfoLinha('Data do diagnóstico', dataFmt)

  // Solução recomendada + Temperatura lado a lado
  const colW = contentW / 2
  const colX2 = margin + colW

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(hexToRgb(TEXT_MUTED)[0], hexToRgb(TEXT_MUTED)[1], hexToRgb(TEXT_MUTED)[2])
  doc.text('DIRECIONAMENTO', margin, y)
  doc.text('TEMPERATURA DO LEAD', colX2, y)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(hexToRgb(TEXT_DARK)[0], hexToRgb(TEXT_DARK)[1], hexToRgb(TEXT_DARK)[2])
  const solucaoLines = doc.splitTextToSize(
    getLabelPublicoSolucao(data.solucao_recomendada),
    colW - 10,
  )
  doc.text(solucaoLines, margin, y + 14)

  // Badge temperatura
  const [rT, gT, bT] = corTemperatura(data.temperatura_lead)
  const tempText = data.temperatura_lead || '-'
  doc.setFontSize(10)
  const tempW = doc.getTextWidth(tempText) + 16
  doc.setFillColor(rT, gT, bT)
  doc.roundedRect(colX2, y + 2, tempW, 18, 9, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(tempText, colX2 + 8, y + 14)
  y += 14 + Math.max(solucaoLines.length, 1) * 13 + 18

  // ---------- 10 Notas de gestão ----------
  y += 6
  doc.setFillColor(hexToRgb(NAVY_DARK)[0], hexToRgb(NAVY_DARK)[1], hexToRgb(NAVY_DARK)[2])
  doc.roundedRect(margin, y, contentW, 24, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('NOTAS DE GESTÃO (0 a 10)', margin + 10, y + 16)
  y += 34

  const barraMaxW = 120
  NOTAS_GESTAO_LABELS.forEach((item) => {
    const valor = data.notas_gestao?.[item.key]
    const nota = typeof valor === 'number' ? valor : 0

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(hexToRgb(TEXT_DARK)[0], hexToRgb(TEXT_DARK)[1], hexToRgb(TEXT_DARK)[2])
    const labelLines = doc.splitTextToSize(item.label, 230)
    doc.text(labelLines[0], margin, y + 9)

    // Barra de fundo
    const barX = margin + 240
    const barY = y + 3
    doc.setFillColor(hexToRgb(BORDER)[0], hexToRgb(BORDER)[1], hexToRgb(BORDER)[2])
    doc.roundedRect(barX, barY, barraMaxW, 8, 4, 4, 'F')
    // Barra preenchida (cor varia conforme nota)
    const pct = Math.max(0, Math.min(10, nota)) / 10
    const fillW = barraMaxW * pct
    if (fillW > 0) {
      const cor = nota >= 7 ? hexToRgb('#2F855A') : nota >= 4 ? hexToRgb(GOLD) : hexToRgb('#C53030')
      doc.setFillColor(cor[0], cor[1], cor[2])
      doc.roundedRect(barX, barY, Math.max(fillW, 4), 8, 4, 4, 'F')
    }

    // Valor numérico
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(hexToRgb(NAVY)[0], hexToRgb(NAVY)[1], hexToRgb(NAVY)[2])
    doc.text(String(nota).replace('.', ','), barX + barraMaxW + 10, y + 9)

    y += 22
  })

  // ---------- Principal dor + Desejo de transformação ----------
  y += 6
  const drawBlocoTexto = (titulo: string, texto: string, corTitulo = NAVY) => {
    const [r, g, b] = hexToRgb(corTitulo)
    doc.setFillColor(hexToRgb(BG_LIGHT)[0], hexToRgb(BG_LIGHT)[1], hexToRgb(BG_LIGHT)[2])
    doc.roundedRect(margin, y, contentW, 18, 4, 4, 'F')
    doc.setFillColor(r, g, b)
    doc.rect(margin, y, 4, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(r, g, b)
    doc.text(titulo, margin + 12, y + 13)
    y += 26

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(hexToRgb(TEXT_DARK)[0], hexToRgb(TEXT_DARK)[1], hexToRgb(TEXT_DARK)[2])
    const linhas = doc.splitTextToSize(texto || '-', contentW)
    doc.text(linhas, margin, y)
    y += linhas.length * 13 + 16
  }

  drawBlocoTexto('PRINCIPAL DOR RELATADA', data.dor_principal)
  drawBlocoTexto('DESEJO DE TRANSFORMAÇÃO', data.desejo_transformacao)

  // ---------- Rodapé ----------
  const footerH = 50
  doc.setFillColor(hexToRgb(NAVY)[0], hexToRgb(NAVY)[1], hexToRgb(NAVY)[2])
  doc.rect(0, pageH - footerH, pageW, footerH, 'F')
  doc.setFillColor(hexToRgb(GOLD)[0], hexToRgb(GOLD)[1], hexToRgb(GOLD)[2])
  doc.rect(0, pageH - footerH, pageW, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(rGl, gGl, bGl)
  doc.setTextColor(255, 255, 255)
  const tagline =
    'Clareza para decidir. Estrutura para crescer. Direção para gerar novos resultados.'
  const tagW = doc.getTextWidth(tagline)
  doc.text(tagline, (pageW - tagW) / 2, pageH - 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(rGl, gGl, bGl)
  const footer = 'EDVANCED © ' + new Date().getFullYear() + ' · Soluções Empresariais'
  const fW = doc.getTextWidth(footer)
  doc.text(footer, (pageW - fW) / 2, pageH - 10)

  return doc
}

/**
 * Gera e baixa automaticamente um mini-relatório em PDF do diagnóstico.
 */
export function gerarPdfDiagnostico(data: PdfDiagnosticoData): void {
  const doc = construirPdfDiagnostico(data)
  const nomeArquivo = `diagnostico-${(data.nome || 'lead')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}.pdf`
  doc.save(nomeArquivo)
}

/**
 * Gera o PDF do diagnóstico e retorna um Blob (para envio por e-mail,
 * upload, etc.) sem disparar o download no navegador.
 */
export function gerarPdfBlob(data: PdfDiagnosticoData): Blob {
  const doc = construirPdfDiagnostico(data)
  return doc.output('blob')
}
