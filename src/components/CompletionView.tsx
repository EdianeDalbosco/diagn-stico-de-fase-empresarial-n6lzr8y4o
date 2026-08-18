import React, { useState } from 'react'
import {
  CheckCircle2,
  Sparkles,
  Bird,
  FileDown,
  Mail,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompletionViewProps {
  onRestart?: () => void
  onDownloadPdf?: () => void
  onSendEmail?: () => Promise<{ ok: boolean; error?: string }>
}

type EmailStatus = 'idle' | 'sending' | 'sent' | 'error'

export const CompletionView: React.FC<CompletionViewProps> = ({
  onRestart,
  onDownloadPdf,
  onSendEmail,
}) => {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [emailError, setEmailError] = useState<string | null>(null)

  const handleSendEmail = async () => {
    if (!onSendEmail || emailStatus === 'sending' || emailStatus === 'sent') return
    setEmailStatus('sending')
    setEmailError(null)
    try {
      const res = await onSendEmail()
      if (res.ok) {
        setEmailStatus('sent')
      } else {
        setEmailStatus('error')
        setEmailError(res.error || 'Não foi possível enviar o e-mail.')
      }
    } catch (err) {
      setEmailStatus('error')
      setEmailError(err instanceof Error ? err.message : 'Falha inesperada ao enviar o e-mail.')
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Ícone de Sucesso Dourado / Marinho */}
      <div className="w-20 h-20 rounded-full bg-[#B69D64]/15 border-2 border-[#B69D64] flex items-center justify-center text-[#8C753E] mb-6 shadow-xl shadow-[#0A1E4A]/10">
        <CheckCircle2 className="w-10 h-10 text-[#0A1E4A]" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B69D64]/10 border border-[#B69D64]/30 text-[#8C753E] text-xs font-bold mb-4 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#B69D64]" />
        <span>Diagnóstico Enviado com Sucesso</span>
      </div>

      {/* Mensagens Oficiais Conforme Requisitos */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
        Obrigada por responder ao Diagnóstico de Fase Empresarial.
      </h2>

      <div className="space-y-4 max-w-lg text-[#4A5568] text-sm sm:text-base leading-relaxed mb-8">
        <p className="bg-white p-4 sm:p-5 rounded-xl border border-[#E2E8F0] shadow-sm text-[#2D3748] text-left font-medium">
          Suas respostas nos ajudam a compreender não apenas onde você está, mas principalmente qual
          pode ser o próximo passo para chegar onde deseja.
        </p>

        <p className="text-white/60 text-xs sm:text-sm font-medium">
          A equipe <span className="text-[#B69D64] font-bold">Edvanced</span> poderá entrar em
          contato caso identifique uma solução compatível com o seu momento.
        </p>
      </div>

      {/* Tagline de Impacto com estilo Executivo Premium */}
      <div className="w-full max-w-lg p-6 rounded-2xl bg-gradient-to-br from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] border border-[#B69D64]/40 shadow-xl mb-8 text-white">
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

      {/* Ações: baixar PDF + enviar por e-mail */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg mb-2">
        {onDownloadPdf && (
          <Button
            onClick={onDownloadPdf}
            className="flex-1 bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white font-bold rounded-xl px-6 py-3 shadow-md shadow-[#0A1E4A]/15 border border-[#B69D64]/40 hover:border-[#B69D64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 mr-2 text-[#B69D64]" />
            Baixar PDF
          </Button>
        )}

        {onSendEmail && (
          <Button
            onClick={handleSendEmail}
            disabled={emailStatus === 'sending' || emailStatus === 'sent'}
            variant="outline"
            className="flex-1 bg-white/5 border-[#B69D64]/50 text-white hover:bg-white/10 hover:text-white font-bold rounded-xl px-6 py-3 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {emailStatus === 'sending' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#B69D64]" />
                Enviando...
              </>
            ) : emailStatus === 'sent' ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                E-mail enviado
              </>
            ) : emailStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 text-rose-400" />
                Tentar novamente
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2 text-[#B69D64]" />
                Enviar PDF por e-mail
              </>
            )}
          </Button>
        )}
      </div>

      {/* Feedback do envio por e-mail */}
      {emailStatus === 'sent' && (
        <p className="text-xs text-emerald-300/80 font-medium mb-4">
          Enviamos o PDF do seu diagnóstico para o e-mail informado. Verifique também sua caixa de
          spam.
        </p>
      )}
      {emailStatus === 'error' && (
        <p className="text-xs text-rose-300/80 font-medium mb-4">
          {emailError || 'Não foi possível enviar o e-mail agora. Você ainda pode baixar o PDF.'}
        </p>
      )}

      {/* Ação secundária para caso queira responder novamente */}
      {onRestart && (
        <Button
          variant="outline"
          onClick={onRestart}
          className="text-xs font-semibold text-[#0A1E4A] hover:bg-[#F8F9FA] border-[#CBD5E0] rounded-xl px-5 py-2.5 shadow-sm"
        >
          Preencher outro diagnóstico
        </Button>
      )}

      {/* Rodapé */}
      <div className="mt-10 pt-6 border-t border-white/20 w-full max-w-xs text-center">
        <p className="text-xs text-[#B69D64] font-bold tracking-widest uppercase">
          EDVANCED &middot; SOLUÇÕES EMPRESARIAIS
        </p>
      </div>
    </div>
  )
}
