import React, { useMemo, useState } from 'react'
import { initialFormData, FormStepData } from '@/types/diagnostico'
import { submitDiagnostico, enviarPdfPorEmail } from '@/services/diagnostico'
import { calculateSolucaoRecomendada, calculateTemperaturaLead } from '@/types/scoring'
import { gerarPdfDiagnostico } from '@/lib/pdfDiagnostico'
import { Header } from '@/components/Header'
import { LandingView } from '@/components/LandingView'
import { CompletionView } from '@/components/CompletionView'
import { Button } from '@/components/ui/button'
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
  Step8,
  Step9,
  Step10,
  Step11,
  Step12,
  Step13,
  Step14,
  Step15,
  Step16,
} from '@/components/FormSteps'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const MultiStepForm: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormStepData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null)
  const [savedTokenAcesso, setSavedTokenAcesso] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { toast } = useToast()
  const totalSteps = 16

  const updateFormData = (patch: Partial<FormStepData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
    if (errorMessage) setErrorMessage(null)
  }

  const handleStart = () => {
    setHasStarted(true)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestart = () => {
    setFormData(initialFormData)
    setIsCompleted(false)
    setSavedRecordId(null)
    setSavedTokenAcesso(null)
    setHasStarted(false)
    setCurrentStep(1)
    setErrorMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Validação por etapa
  const validateStep = (step: number): boolean => {
    setErrorMessage(null)

    switch (step) {
      case 1: {
        if (!formData.nome.trim()) {
          setErrorMessage('Por favor, informe seu nome completo.')
          return false
        }
        if (!formData.whatsapp.trim()) {
          setErrorMessage('Por favor, informe seu WhatsApp com DDD.')
          return false
        }
        const whatsappDigits = formData.whatsapp.replace(/\D/g, '')
        if (whatsappDigits.length !== 10 && whatsappDigits.length !== 11) {
          setErrorMessage('Por favor, insira um WhatsApp válido com DDD (10 ou 11 dígitos).')
          return false
        }
        if (!formData.email.trim()) {
          setErrorMessage('Por favor, informe seu e-mail.')
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
          setErrorMessage('Por favor, informe um e-mail válido.')
          return false
        }
        if (!formData.instagram.trim()) {
          setErrorMessage('Por favor, informe seu Instagram.')
          return false
        }
        if (!formData.cidade_estado.trim()) {
          setErrorMessage('Por favor, informe sua cidade e estado.')
          return false
        }
        return true
      }
      case 2: {
        if (!formData.momento_atual) {
          setErrorMessage('Por favor, selecione qual opção melhor representa seu momento atual.')
          return false
        }
        return true
      }
      case 3: {
        if (!formData.tem_negocio) {
          setErrorMessage('Por favor, informe se você possui um negócio atualmente.')
          return false
        }
        return true
      }
      case 4: {
        if (!formData.areas_avancar || formData.areas_avancar.length === 0) {
          setErrorMessage('Por favor, marque pelo menos 1 opção (máximo de 3).')
          return false
        }
        if (formData.areas_avancar.length > 3) {
          setErrorMessage('Você pode marcar no máximo 3 opções.')
          return false
        }
        return true
      }
      case 5: {
        if (!formData.dor_principal.trim()) {
          setErrorMessage('Por favor, compartilhe sua principal dor ou problema a resolver.')
          return false
        }
        return true
      }
      case 6: {
        if (!formData.realidade) {
          setErrorMessage('Por favor, escolha a frase que mais representa sua realidade.')
          return false
        }
        return true
      }
      case 7: {
        // Sliders possuem valor padrão (5), sempre válido
        return true
      }
      case 8: {
        if (!formData.lidera_pessoas) {
          setErrorMessage('Por favor, responda se você lidera pessoas hoje.')
          return false
        }
        return true
      }
      case 9: {
        if (!formData.conhecimento_experiencia) {
          setErrorMessage('Por favor, responda sobre seu conhecimento e experiência.')
          return false
        }
        return true
      }
      case 10: {
        if (!formData.desejo_transformacao) {
          setErrorMessage('Por favor, selecione a transformação que mais deseja viver.')
          return false
        }
        return true
      }
      case 11: {
        if (!formData.objetivo_financeiro) {
          setErrorMessage('Por favor, selecione seu objetivo financeiro.')
          return false
        }
        return true
      }
      case 12: {
        if (!formData.impedimentos || formData.impedimentos.length === 0) {
          setErrorMessage('Por favor, selecione ao menos 1 fator que está impedindo você.')
          return false
        }
        return true
      }
      case 13: {
        if (!formData.tipo_apoio) {
          setErrorMessage('Por favor, selecione o tipo de apoio que faz mais sentido.')
          return false
        }
        return true
      }
      case 14: {
        if (!formData.nivel_prioridade) {
          setErrorMessage('Por favor, indique seu nível de prioridade.')
          return false
        }
        return true
      }
      case 15: {
        if (!formData.disposicao_investimento) {
          setErrorMessage('Por favor, informe sua disposição para investir.')
          return false
        }
        return true
      }
      case 16: {
        if (!formData.porque_importante.trim()) {
          setErrorMessage(
            'Por favor, responda por que resolver esse problema é importante para você agora.',
          )
          return false
        }
        return true
      }
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Atenção',
        description: errorMessage || 'Preencha os campos obrigatórios antes de avançar.',
        variant: 'destructive',
      })
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Submissão final
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setErrorMessage(null)
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Calcula solução e temperatura uma vez por renderização para reutilizar nos handlers e na tela de conclusão
  const solucaoRecomendada = useMemo(() => calculateSolucaoRecomendada(formData), [formData])
  const temperaturaLead = useMemo(() => calculateTemperaturaLead(formData), [formData])

  const handleDownloadPdf = () => {
    try {
      gerarPdfDiagnostico({
        nome: formData.nome,
        data: new Date().toISOString(),
        solucao_recomendada: solucaoRecomendada,
        temperatura_lead: temperaturaLead,
        notas_gestao: formData.notas_gestao,
        dor_principal: formData.dor_principal,
        desejo_transformacao: formData.desejo_transformacao,
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

  const handleSendEmail = async () => {
    return enviarPdfPorEmail({
      nome: formData.nome,
      email: formData.email,
      solucao_recomendada: solucaoRecomendada,
      temperatura_lead: temperaturaLead,
      notas_gestao: formData.notas_gestao,
      dor_principal: formData.dor_principal,
      desejo_transformacao: formData.desejo_transformacao,
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const record = await submitDiagnostico(formData)
      setSavedRecordId(record?.id ?? null)
      setSavedTokenAcesso(record?.token_acesso ?? null)
      setIsCompleted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      console.error('Erro ao enviar diagnóstico:', err)
      const msg =
        err instanceof Error ? err.message : 'Falha ao salvar diagnóstico. Tente novamente.'
      setErrorMessage(`Erro ao enviar: ${msg}`)
      toast({
        title: 'Erro na conexão',
        description:
          'Não foi possível salvar suas respostas. Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Textos dos títulos e subtítulos de cada etapa
  const stepHeadings: Record<number, { title: string; subtitle: string }> = {
    1: {
      title: '1. Quem é você?',
      subtitle: 'Informe seus dados de contato para que possamos personalizar sua análise.',
    },
    2: {
      title: '2. Qual é o seu momento atual?',
      subtitle: 'Hoje, qual dessas opções melhor representa você?',
    },
    3: {
      title: '3. Sobre o seu negócio',
      subtitle: 'Conte-nos um pouco sobre a estrutura da sua empresa.',
    },
    4: {
      title: '4. Em qual área você mais precisa avançar?',
      subtitle: 'Marque até 3 opções que mais representam seu momento atual.',
    },
    5: {
      title: '5. Qual é a sua principal dor hoje?',
      subtitle:
        'Se pudesse resolver apenas UM problema no seu negócio ou carreira nos próximos 90 dias, qual seria?',
    },
    6: {
      title: '6. O que mais se parece com a sua realidade?',
      subtitle: 'Escolha a frase que mais representa seu momento atual.',
    },
    7: {
      title: '7. Como está a gestão do seu negócio hoje?',
      subtitle: 'Dê uma nota sincera de 0 a 10 para cada uma das áreas abaixo.',
    },
    8: {
      title: '8. Sobre liderança',
      subtitle: 'Identifique sua atuação e desafios na condução de pessoas.',
    },
    9: {
      title: '9. Sobre seu conhecimento e experiência',
      subtitle: 'Descubra o potencial de monetização da sua expertise.',
    },
    10: {
      title: '10. Onde você quer chegar?',
      subtitle: 'Qual transformação você mais deseja viver nos próximos 6 a 12 meses?',
    },
    11: {
      title: '11. Seu objetivo financeiro',
      subtitle: 'Qual faturamento mensal você gostaria de alcançar nos próximos 12 meses?',
    },
    12: {
      title: '12. O que está impedindo você de chegar lá?',
      subtitle: 'Marque todas as opções que se aplicam ao seu momento.',
    },
    13: {
      title: '13. Qual tipo de apoio faz mais sentido para você?',
      subtitle: 'Selecione o formato mais compatível com sua necessidade.',
    },
    14: {
      title: '14. Nível de prioridade',
      subtitle: 'Resolver isso hoje é:',
    },
    15: {
      title: '15. Investimento',
      subtitle: 'Se identificarmos uma solução adequada, hoje você estaria disposto(a) a investir?',
    },
    16: {
      title: '16. Última pergunta',
      subtitle: 'Por que resolver esse problema é importante para você agora?',
    },
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 4:
        return <Step4 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 5:
        return <Step5 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 6:
        return <Step6 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 7:
        return <Step7 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 8:
        return <Step8 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 9:
        return <Step9 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 10:
        return <Step10 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 11:
        return <Step11 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 12:
        return <Step12 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 13:
        return <Step13 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 14:
        return <Step14 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 15:
        return <Step15 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      case 16:
        return <Step16 formData={formData} updateFormData={updateFormData} error={errorMessage} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1E4A] text-white flex flex-col justify-between">
      {/* Header Fixo */}
      <Header
        currentStep={currentStep}
        totalSteps={totalSteps}
        isStarted={hasStarted}
        isCompleted={isCompleted}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 px-4">
        {!hasStarted ? (
          <LandingView onStart={handleStart} />
        ) : isCompleted ? (
          <CompletionView
            solucaoRecomendada={solucaoRecomendada}
            diagnosticoId={savedRecordId}
            tokenAcesso={savedTokenAcesso}
            onRestart={handleRestart}
            onDownloadPdf={handleDownloadPdf}
            onSendEmail={handleSendEmail}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto animate-fade-in flex flex-col justify-between">
            {/* Cabeçalho da Etapa Atual */}
            <div className="mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider mb-1 uppercase">
                <span className="text-[#B69D64]">
                  ETAPA {currentStep} DE {totalSteps}
                </span>
                <span className="font-semibold text-[#B69D64]">
                  {Math.round((currentStep / totalSteps) * 100)}% CONCLUÍDO
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {stepHeadings[currentStep]?.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-medium mt-1.5 leading-relaxed">
                {stepHeadings[currentStep]?.subtitle}
              </p>
            </div>

            {/* Mensagem de Erro de Validação */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-2.5 text-xs sm:text-sm text-rose-200 font-medium animate-fade-in shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Componente Dinâmico da Etapa */}
            <div className="my-2">{renderCurrentStep()}</div>

            {/* Controles de Navegação (Voltar / Avançar / Enviar) */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="px-5 h-11 rounded-xl border-[#B69D64]/40 text-white hover:bg-[#0D224A] hover:text-white hover:border-[#B69D64] font-semibold bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Voltar
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="ml-auto px-7 h-11 rounded-xl bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white font-bold shadow-md shadow-black/30 border border-[#B69D64]/40 hover:border-[#B69D64] active:scale-[0.98] transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#B69D64]" />
                    Enviando Diagnóstico...
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    Enviar Diagnóstico
                    <ArrowRight className="w-4 h-4 ml-1.5 text-[#B69D64]" />
                  </>
                ) : (
                  <>
                    Avançar
                    <ArrowRight className="w-4 h-4 ml-1.5 text-[#B69D64]" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Minimalista */}
      <footer className="py-4 text-center text-xs text-white/40 font-medium border-t border-white/10">
        <p>
          EDVANCED &copy; {new Date().getFullYear()} &middot; Hub de Desenvolvimento &amp; Soluções
          Empresariais
        </p>
      </footer>
    </div>
  )
}
