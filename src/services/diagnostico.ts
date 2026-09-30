import pb from '@/lib/pocketbase/client'
import { FormStepData, DiagnosticoRecord, TemperaturaLead } from '@/types/diagnostico'
import { calculateSolucaoRecomendada, calculateTemperaturaLead } from '@/types/scoring'
import { gerarPdfBlob } from '@/lib/pdfDiagnostico'

/**
 * Sanitiza um valor de texto antes de enviá-lo ao PocketBase.
 * Retorna string vazia para undefined/null, garantindo que nenhum campo
 * do schema (mesmo os não-obrigatórios) receba `null` — o que faria o
 * PocketBase devolver 400 "Failed to create record".
 */
function cleanText(value: string | undefined | null): string {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

export async function submitDiagnostico(data: FormStepData): Promise<DiagnosticoRecord> {
  const solucao_recomendada = calculateSolucaoRecomendada(data)
  const temperatura_lead = calculateTemperaturaLead(data)

  // JSON do PocketBase aceita arrays/objetos nativos; garantimos arrays
  // válidos (nunca null/undefined) para evitar erro de parsing.
  const areas_avancar = Array.isArray(data.areas_avancar) ? data.areas_avancar : []
  const impedimentos = Array.isArray(data.impedimentos) ? data.impedimentos : []
  const notas_gestao =
    data.notas_gestao && typeof data.notas_gestao === 'object' ? data.notas_gestao : {}

  const payload = {
    nome: cleanText(data.nome),
    whatsapp: cleanText(data.whatsapp),
    email: cleanText(data.email).toLowerCase(),
    instagram: cleanText(data.instagram),
    cidade_estado: cleanText(data.cidade_estado),
    momento_atual: cleanText(data.momento_atual),
    tem_negocio: cleanText(data.tem_negocio),
    nome_empresa: cleanText(data.nome_empresa),
    segmento: cleanText(data.segmento),
    tempo_empresa: cleanText(data.tempo_empresa),
    tamanho_equipe: cleanText(data.tamanho_equipe),
    faixa_faturamento: cleanText(data.faixa_faturamento),
    areas_avancar,
    dor_principal: cleanText(data.dor_principal),
    realidade: cleanText(data.realidade),
    notas_gestao,
    lidera_pessoas: cleanText(data.lidera_pessoas),
    desafio_lideranca: cleanText(data.desafio_lideranca),
    conhecimento_experiencia: cleanText(data.conhecimento_experiencia),
    transformar_oferta: cleanText(data.transformar_oferta),
    desejo_transformacao: cleanText(data.desejo_transformacao),
    objetivo_financeiro: cleanText(data.objetivo_financeiro),
    impedimentos,
    tipo_apoio: cleanText(data.tipo_apoio),
    nivel_prioridade: cleanText(data.nivel_prioridade),
    disposicao_investimento: cleanText(data.disposicao_investimento),
    porque_importante: cleanText(data.porque_importante),
    solucao_recomendada,
    temperatura_lead,
  }

  // Cria o registro. Como o schema tem createRule: "" (público), qualquer
  // auth é desnecessária. Em caso de sucesso, retorna o registro criado.
  const record = await pb.collection('diagnosticos').create<DiagnosticoRecord>(payload)
  return record
}

export async function listDiagnosticos(limit = 50) {
  return pb.collection('diagnosticos').getList<DiagnosticoRecord>(1, limit, {
    sort: '-created',
  })
}

/**
 * Busca um diagnóstico pelo ID no PocketBase.
 * Usado pela rota pública /diagnostico/:id para reexibir os resultados
 * do lead a partir de um link direto.
 *
 * Lança um erro (404) caso o registro não exista — o chamador trata o estado
 * "não encontrado".
 */
export async function getDiagnosticoById(id: string): Promise<DiagnosticoRecord> {
  return pb.collection('diagnosticos').getOne<DiagnosticoRecord>(id)
}

/**
 * Envia o PDF do diagnóstico por e-mail para o lead, via endpoint público
 * /api/enviar-pdf-diagnostico (pb_hook). Constrói o mesmo PDF do download e
 * envia como multipart/form-data.
 *
 * Retorna { ok: boolean, error?: string }. Nunca lança — o envio do e-mail
 * é best-effort e não deve prejudicar o fluxo de sucesso do diagnóstico.
 */
export async function enviarPdfPorEmail(data: {
  nome: string
  email: string
  whatsapp: string
  solucao_recomendada: string
  temperatura_lead: TemperaturaLead
  notas_gestao: FormStepData['notas_gestao']
  dor_principal: string
  desejo_transformacao: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const pdfBlob = gerarPdfBlob({
      nome: data.nome,
      data: new Date().toISOString(),
      solucao_recomendada: data.solucao_recomendada,
      temperatura_lead: data.temperatura_lead,
      notas_gestao: data.notas_gestao,
      dor_principal: data.dor_principal,
      desejo_transformacao: data.desejo_transformacao,
    })

    const form = new FormData()
    form.append('nome', data.nome)
    form.append('email', data.email)
    form.append('whatsapp', data.whatsapp)
    form.append('solucao', data.solucao_recomendada)
    form.append('temperatura', data.temperatura_lead)
    form.append('pdf', pdfBlob, 'diagnostico.pdf')

    let res = await fetch(`${pb.baseUrl}/backend/v1/enviar-pdf-diagnostico`, {
      method: 'POST',
      body: form,
    })
    if (res.status === 404) {
      // Fallback de rota caso o ambiente sirva em /api/
      res = await fetch(`${pb.baseUrl}/api/enviar-pdf-diagnostico`, {
        method: 'POST',
        body: form,
      })
    }
    if (res.ok) return { ok: true }

    let errorMsg = 'Não foi possível enviar o e-mail.'
    try {
      const json = (await res.json()) as { error?: string }
      if (json.error) errorMsg = json.error
    } catch {
      /* intentionally ignored */
    }
    return { ok: false, error: errorMsg }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha inesperada ao enviar o e-mail.',
    }
  }
}
