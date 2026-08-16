import React from 'react'
import { CheckCircle2, Sparkles, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompletionViewProps {
  onRestart?: () => void
}

export const CompletionView: React.FC<CompletionViewProps> = ({ onRestart }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Ícone de Sucesso */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Diagnóstico Enviado com Sucesso</span>
      </div>

      {/* Mensagens Oficiais Conforme Requisitos */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
        Obrigada por responder ao Diagnóstico de Fase Empresarial.
      </h2>

      <div className="space-y-4 max-w-lg text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
        <p className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-slate-300 text-left">
          Suas respostas nos ajudam a compreender não apenas onde você está, mas principalmente qual
          pode ser o próximo passo para chegar onde deseja.
        </p>

        <p className="text-slate-400 text-xs sm:text-sm">
          A equipe <span className="text-indigo-400 font-semibold">Edvanced</span> poderá entrar em
          contato caso identifique uma solução compatível com o seu momento.
        </p>
      </div>

      {/* Tagline de Impacto */}
      <div className="w-full max-w-lg p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/30 border border-indigo-500/20 shadow-xl mb-8">
        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
          <Compass className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-bold">
            Direcionamento Estratégico
          </span>
        </div>
        <p className="text-base sm:text-lg font-semibold text-white tracking-tight">
          &ldquo;Clareza para decidir. Estrutura para crescer. Direção para gerar novos
          resultados.&rdquo;
        </p>
      </div>

      {/* Ação secundária para caso queira responder novamente */}
      {onRestart && (
        <Button
          variant="outline"
          onClick={onRestart}
          className="text-xs text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900 rounded-lg px-4 py-2"
        >
          Preencher outro diagnóstico
        </Button>
      )}

      {/* Rodapé */}
      <div className="mt-10 pt-6 border-t border-slate-800/60 w-full max-w-xs text-center">
        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
          Edvanced &middot; Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
