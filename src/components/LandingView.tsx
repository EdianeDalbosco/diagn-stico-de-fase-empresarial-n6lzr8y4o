import React from 'react'
import { Link } from 'react-router-dom'
import { Bird, Sparkles, Building2, TrendingUp, ShieldCheck, Compass, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingViewProps {
  onStart: () => void
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Badge topo */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B69D64]/15 border border-[#B69D64]/40 text-[#D4B97A] text-xs sm:text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-[#B69D64]" />
        <span>Diagnóstico Estratégico &middot; Gratuito e Confidencial</span>
      </div>

      {/* Título Principal */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight sm:leading-tight">
        Diagnóstico de Fase Empresarial
      </h1>

      {/* Subtítulo */}
      <p className="text-base sm:text-lg font-medium text-[#D4B87A] mb-4 max-w-lg tracking-wide uppercase font-semibold">
        Hub de Desenvolvimento &amp; Soluções Empresariais
      </p>

      {/* Texto de apoio */}
      <p className="text-sm sm:text-base text-white/70 mb-8 max-w-lg leading-relaxed">
        Descubra qual é o próximo passo para o seu negócio, sua carreira ou sua liderança. Em poucos
        minutos, identifique quais pontos hoje mais limitam o seu crescimento e receba a orientação
        estratégica ideal.
      </p>

      {/* Benefícios rápidos */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left">
        <div className="p-4 rounded-xl bg-white border border-[#B69D64]/30 shadow-sm hover:shadow-md hover:border-[#B69D64]/60 transition-all flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#0A1E4A] text-[#B69D64] shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0A1E4A]">Clareza</h4>
            <p className="text-[11px] text-[#4A5568] leading-snug">
              Visão exata dos seus gargalos atuais
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#B69D64]/30 shadow-sm hover:shadow-md hover:border-[#B69D64]/60 transition-all flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#0A1E4A] text-[#B69D64] shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0A1E4A]">Estrutura</h4>
            <p className="text-[11px] text-[#4A5568] leading-snug">Gestão, liderança e processos</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#B69D64]/30 shadow-sm hover:shadow-md hover:border-[#B69D64]/60 transition-all flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#0A1E4A] text-[#B69D64] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0A1E4A]">Direção</h4>
            <p className="text-[11px] text-[#4A5568] leading-snug">
              Próximos passos para gerar resultados
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button com Gradiente Marinho Metálico e Borda Dourada */}
      <div className="w-full max-w-md space-y-3.5">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full text-base font-bold py-6 rounded-xl bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white shadow-xl shadow-[#0A1E4A]/20 border border-[#B69D64]/50 hover:border-[#B69D64] transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
        >
          Começar Diagnóstico
          <span className="ml-2 font-mono text-lg text-[#B69D64]">&rarr;</span>
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-white/60 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#B69D64]" />
          <span>Leva apenas 3 a 5 minutos &middot; Seguro e sem custo</span>
        </div>
      </div>

      {/* Assinatura / Rodapé da landing */}
      <div className="mt-12 pt-6 border-t border-white/15 w-full max-w-xs text-center">
        <p className="text-xs text-[#B69D64] font-bold tracking-widest uppercase">
          EDVANCED &middot; SOLUÇÕES EMPRESARIAIS
        </p>
      </div>

      {/* Acesso discreto à área administrativa (visível só para quem procura) */}
      <Link
        to="/dashboard"
        aria-label="Área administrativa"
        title="Área administrativa"
        className="mt-5 inline-flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/55 transition-colors font-medium tracking-wide"
      >
        <Lock className="w-3 h-3" aria-hidden="true" />
        <span>Área administrativa</span>
      </Link>
    </div>
  )
}
