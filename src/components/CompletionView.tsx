import React from 'react'
import { CheckCircle2, Sparkles, Bird } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompletionViewProps {
  onRestart?: () => void
}

export const CompletionView: React.FC<CompletionViewProps> = ({ onRestart }) => {
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
