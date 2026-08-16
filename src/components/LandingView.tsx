import React from 'react'
import { Compass, Sparkles, Building2, TrendingUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingViewProps {
  onStart: () => void
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Badge topo */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Diagnóstico Estratégico &middot; Gratuito e Confidencial</span>
      </div>

      {/* Título Principal */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight sm:leading-tight">
        Diagnóstico de Fase Empresarial
      </h1>

      {/* Subtítulo */}
      <p className="text-lg sm:text-xl font-medium text-indigo-200/90 mb-4 max-w-lg">
        Descubra qual é o próximo passo para o seu negócio, sua carreira ou sua liderança.
      </p>

      {/* Texto de apoio */}
      <p className="text-sm sm:text-base text-slate-300/80 mb-8 max-w-md leading-relaxed">
        Em poucos minutos, responda às perguntas e identifique quais pontos hoje mais limitam o seu
        crescimento. Ao final, suas respostas nos ajudarão a entender seu momento e indicar o
        caminho mais adequado para você.
      </p>

      {/* Benefícios rápidos */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Clareza</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Visão exata dos seus gargalos atuais
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Estrutura</h4>
            <p className="text-[11px] text-slate-400 leading-snug">Gestão, liderança e processos</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Direção</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Próximos passos para gerar resultados
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-md space-y-3">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full text-base font-semibold py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 border-0 transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
        >
          Começar Diagnóstico
          <span className="ml-2 font-mono text-lg">&rarr;</span>
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Leva apenas 3 a 5 minutos &middot; Seguro e sem custo</span>
        </div>
      </div>

      {/* Assinatura / Rodapé da landing */}
      <div className="mt-12 pt-6 border-t border-slate-800/60 w-full max-w-xs text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
          Edvanced &middot; Desenvolvimento Empresarial
        </p>
      </div>
    </div>
  )
}
