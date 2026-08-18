import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Bird,
  FileDown,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Calendar,
  User,
  Target,
  HeartCrack,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDiagnosticoById } from '@/services/diagnostico'
import { gerarPdfDiagnostico } from '@/lib/pdfDiagnostico'
import { DiagnosticoRecord, FormStepData, TemperaturaLead } from '@/types/diagnostico'
import { useToast } from '@/hooks/use-toast'

// Rótulos das 10 notas de gestão (mesma ordem usada no PDF)
const NOTAS_GESTAO_LABELS: { key: keyof FormStepData['notas_gestao']; label: string }[] = [
  { key: 'clareza_estrategica', label: 'Clareza estratégica' },
  { key: 'gestao_financeira', label: 'Gestão financeira' },
  { key: 'processos', label: 'Processos' },
  { key: 'vendas', label: 'Vendas' },
  { key: 'gestao_pessoas', label: 'Gestão de pessoas' },
  { key: 'lideranca', label: 'Liderança' },
  { key: 'planejamento_metas', label: 'Planejamento e metas' },
  { key: 'indicadores_resultados', label: 'Indicadores e resultados' },
  { key: 'posicionamento_comunicacao', label: 'Posicionamento e comunicação' },
  {
    key: 'capacidade_crescer_sem_depender',
    label: 'Capacidade de crescer sem depender de você',
  },
]

// Estilo visual (badge) por temperatura do lead
const TEMPERATURA_STYLES: Record<string, string> = {
  Quente: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  Morno: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Frio: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
}

const formatarData = (iso?: string): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const corBarraNota = (nota: number): string => {
  if (nota >= 7) return 'bg-emerald-500'
  if (nota >= 4) return 'bg-[#B69D64]'
  return 'bg-rose-500'
}

const DiagnosticoResultado: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [registro, setRegistro] = useState<DiagnosticoRecord | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setNaoEncontrado(false)
    if (!id) {
      setNaoEncontrado(true)
      setCarregando(false)
      return
    }
    getDiagnosticoById(id)
      .then((rec) => {
        if (!ativo) return
        setRegistro(rec)
        setCarregando(false)
      })
      .catch((err) => {
        if (!ativo) return
        console.error('Erro ao buscar diagnóstico:', err)
        setNaoEncontrado(true)
        setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [id])

  const handleDownloadPdf = () => {
    if (!registro) return
    try {
      gerarPdfDiagnostico({
        nome: registro.nome,
        data: registro.created,
        solucao_recomendada: registro.solucao_recomendada,
        temperatura_lead: registro.temperatura_lead as TemperaturaLead,
        notas_gestao: registro.notas_gestao,
        dor_principal: registro.dor_principal,
        desejo_transformacao: registro.desejo_transformacao,
      })
    } catch (err) {
      console.error('Erro ao gerar PDF do diagnóstico:', err)
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o PDF. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // -------- Estado: carregando --------
  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0A1E4A] text-white flex flex-col items-center justify-center px-4 py-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#B69D64] mb-3" />
        <p className="text-sm font-medium text-white/70">Carregando seu diagnóstico...</p>
      </div>
    )
  }

  // -------- Estado: não encontrado --------
  if (naoEncontrado || !registro) {
    return (
      <div className="min-h-screen bg-[#0A1E4A] text-white flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#B69D64]/15 border-2 border-[#B69D64] flex items-center justify-center text-[#B69D64] mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Diagnóstico não encontrado</h1>
          <p className="text-sm text-white/70 mb-8 leading-relaxed">
            O link acessado não corresponde a um diagnóstico válido. Ele pode ter sido removido ou o
            endereço pode estar incorreto.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white font-bold rounded-xl px-6 py-3 shadow-md shadow-[#0A1E4A]/15 border border-[#B69D64]/40 hover:border-[#B69D64] transition-all cursor-pointer"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à página inicial
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const temperatura = (registro.temperatura_lead as TemperaturaLead) || 'Frio'
  const notas = registro.notas_gestao || ({} as FormStepData['notas_gestao'])

  return (
    <div className="min-h-screen bg-[#0A1E4A] text-white">
      {/* Cabeçalho da marca */}
      <header className="w-full bg-[#0A1E4A]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-md shadow-black/20">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#102A6B] via-[#1A3A8A] to-[#102A6B] flex items-center justify-center text-[#B69D64] shadow-md shadow-black/20 border border-[#B69D64]/40 shrink-0">
            <Bird className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-widest text-white uppercase">
                EDVANCED
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#B69D64]/20 text-[#D4B97A] border border-[#B69D64]/40">
                MEU DIAGNÓSTICO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-white/60 tracking-wide">
              Hub de Desenvolvimento &amp; Soluções Empresariais
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Badge de topo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B69D64]/10 border border-[#B69D64]/30 text-[#D4B97A] text-xs sm:text-sm font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#B69D64]" />
            <span>Relatório de Diagnóstico de Fase Empresarial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Seu diagnóstico, {registro.nome?.split(' ')[0] || 'lead'}.
          </h1>
        </div>

        {/* Card branco principal com os resultados */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 border border-[#B69D64]/30 overflow-hidden">
          {/* Faixa dourada superior */}
          <div className="h-1.5 bg-gradient-to-r from-[#B69D64] via-[#D4B97A] to-[#B69D64]" />

          <div className="p-5 sm:p-8 text-[#2D3748]">
            {/* Identificação: nome + data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0A1E4A]/5 text-[#0A1E4A] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider">
                    Lead
                  </p>
                  <p className="text-sm font-bold text-[#0A1E4A] truncate">
                    {registro.nome || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0A1E4A]/5 text-[#0A1E4A] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider">
                    Data do diagnóstico
                  </p>
                  <p className="text-sm font-bold text-[#0A1E4A]">
                    {formatarData(registro.created)}
                  </p>
                </div>
              </div>
            </div>

            {/* Solução recomendada + Temperatura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#B69D64]" />
                  <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider">
                    Solução recomendada
                  </p>
                </div>
                <p className="text-sm font-extrabold text-[#0A1E4A] leading-snug">
                  {registro.solucao_recomendada || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-4">
                <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider mb-2">
                  Temperatura do lead
                </p>
                <span
                  className={
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ' +
                    (TEMPERATURA_STYLES[temperatura] ||
                      'bg-slate-100 text-slate-700 border-slate-300')
                  }
                >
                  {temperatura}
                </span>
              </div>
            </div>

            {/* 10 notas de gestão */}
            <div className="mb-8">
              <div className="rounded-lg bg-[#0A1E4A] px-4 py-2.5 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Notas de gestão (0–10)
                </h3>
              </div>
              <div className="space-y-3">
                {NOTAS_GESTAO_LABELS.map((item) => {
                  const valor = notas?.[item.key]
                  const nota = typeof valor === 'number' ? valor : 0
                  const pct = Math.max(0, Math.min(10, nota)) * 10
                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-[#2D3748]">
                          {item.label}
                        </span>
                        <span className="text-xs font-bold text-[#0A1E4A]">
                          {String(nota).replace('.', ',')}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className={'h-full rounded-full ' + corBarraNota(nota)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Principal dor + Desejo de transformação */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HeartCrack className="w-4 h-4 text-rose-500" />
                  <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider">
                    Principal dor relatada
                  </p>
                </div>
                <p className="text-sm text-[#2D3748] leading-relaxed">
                  {registro.dor_principal || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#B69D64]" />
                  <p className="text-[10px] font-bold text-[#5A6E85] uppercase tracking-wider">
                    Desejo de transformação
                  </p>
                </div>
                <p className="text-sm text-[#2D3748] leading-relaxed">
                  {registro.desejo_transformacao || '-'}
                </p>
              </div>
            </div>

            {/* Botão de download do PDF */}
            <Button
              onClick={handleDownloadPdf}
              className="w-full bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white font-bold rounded-xl px-6 py-3 shadow-md shadow-[#0A1E4A]/15 border border-[#B69D64]/40 hover:border-[#B69D64] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 mr-2 text-[#B69D64]" />
              Baixar meu diagnóstico em PDF
            </Button>
          </div>
        </div>

        {/* Tagline de impacto */}
        <div className="w-full mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] border border-[#B69D64]/40 shadow-xl text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-[#B69D64]">
            <Bird className="w-5 h-5 stroke-[2]" />
            <span className="text-xs uppercase tracking-widest font-bold">
              DIRECIONAMENTO ESTRATÉGICO
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
            &ldquo;Clareza para decidir. Estrutura para crescer. Direção para gerar novos
            resultados.&rdquo;
          </p>
        </div>

        {/* Rodapé */}
        <footer className="mt-10 pt-6 border-t border-white/15 text-center">
          <p className="text-xs text-[#B69D64] font-bold tracking-widest uppercase">
            EDVANCED &middot; SOLUÇÕES EMPRESARIAIS
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar à página inicial
          </Link>
        </footer>
      </main>
    </div>
  )
}

export default DiagnosticoResultado
