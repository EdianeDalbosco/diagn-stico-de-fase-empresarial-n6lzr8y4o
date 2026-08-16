import pb from '@/lib/pocketbase/client'
import { FormStepData, DiagnosticoRecord } from '@/types/diagnostico'
import { calculateSolucaoRecomendada, calculateTemperaturaLead } from '@/types/scoring'

export async function submitDiagnostico(data: FormStepData): Promise<DiagnosticoRecord> {
  const solucao_recomendada = calculateSolucaoRecomendada(data)
  const temperatura_lead = calculateTemperaturaLead(data)

  const payload = {
    nome: data.nome.trim(),
    whatsapp: data.whatsapp.trim(),
    email: data.email.trim().toLowerCase(),
    instagram: data.instagram.trim(),
    cidade_estado: data.cidade_estado.trim(),
    momento_atual: data.momento_atual,
    tem_negocio: data.tem_negocio,
    nome_empresa: data.nome_empresa.trim(),
    segmento: data.segmento.trim(),
    tempo_empresa: data.tempo_empresa,
    tamanho_equipe: data.tamanho_equipe,
    faixa_faturamento: data.faixa_faturamento,
    areas_avancar: data.areas_avancar,
    dor_principal: data.dor_principal.trim(),
    realidade: data.realidade,
    notas_gestao: data.notas_gestao,
    lidera_pessoas: data.lidera_pessoas,
    desafio_lideranca: data.desafio_lideranca,
    conhecimento_experiencia: data.conhecimento_experiencia,
    transformar_oferta: data.transformar_oferta,
    desejo_transformacao: data.desejo_transformacao,
    objetivo_financeiro: data.objetivo_financeiro,
    impedimentos: data.impedimentos,
    tipo_apoio: data.tipo_apoio,
    nivel_prioridade: data.nivel_prioridade,
    disposicao_investimento: data.disposicao_investimento,
    porque_importante: data.porque_importante.trim(),
    solucao_recomendada,
    temperatura_lead,
  }

  const record = await pb.collection('diagnosticos').create<DiagnosticoRecord>(payload)
  return record
}

export async function listDiagnosticos(limit = 50) {
  return pb.collection('diagnosticos').getList<DiagnosticoRecord>(1, limit, {
    sort: '-created',
  })
}
