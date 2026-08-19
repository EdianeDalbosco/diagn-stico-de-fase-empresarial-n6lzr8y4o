import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Building2, TrendingUp, ShieldCheck, Compass, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingViewProps {
  onStart: () => void
}

const BACKGROUND_IMAGE_URL =
  'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/69a031e2-0cd6-444c-9f68-7c8b87933930/edvanced-fundo-eb0a4.png'

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-between px-4 py-8 sm:py-12 animate-fade-in text-white overflow-hidden"
      style={{ backgroundImage: `url("${BACKGROUND_IMAGE_URL}")` }}
    >
      {/* Dark overlay to guarantee maximum legibility over photo faces and elements */}
      <div
        className="absolute inset-0 bg-[#0A1E4A]/30 bg-black/20 backdrop-blur-[1px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto">
        {/* Badge topo */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A1E4A]/80 border border-[#B69D64]/60 text-[#F3E5AB] text-xs sm:text-sm font-semibold mb-6 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#D4B97A]" />
          <span>Diagnóstico Estratégico &middot; Gratuito e Confidencial</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 leading-tight sm:leading-tight text-white drop-shadow-md">
          Diagnóstico de Fase Empresarial
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-lg font-semibold text-[#D4B97A] mb-4 max-w-lg tracking-wide uppercase drop-shadow">
          Hub de Desenvolvimento &amp; Soluções Empresariais
        </p>

        {/* Texto de apoio */}
        <p className="text-sm sm:text-base text-white/90 mb-8 max-w-lg leading-relaxed font-normal drop-shadow">
          Descubra qual é o próximo passo para o seu negócio, sua carreira ou sua liderança. Em
          poucos minutos, identifique quais pontos hoje mais limitam o seu crescimento e receba a
          orientação estratégica ideal.
        </p>

        {/* Benefícios rápidos */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left">
          <div className="p-4 rounded-xl bg-[#0A1E4A]/75 backdrop-blur-md border border-[#B69D64]/40 shadow-lg hover:shadow-xl hover:border-[#B69D64]/80 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#102A6B] text-[#D4B97A] shrink-0 border border-[#B69D64]/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Clareza</h4>
              <p className="text-[11px] text-white/80 leading-snug">
                Visão exata dos seus gargalos atuais
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1E4A]/75 backdrop-blur-md border border-[#B69D64]/40 shadow-lg hover:shadow-xl hover:border-[#B69D64]/80 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#102A6B] text-[#D4B97A] shrink-0 border border-[#B69D64]/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Estrutura</h4>
              <p className="text-[11px] text-white/80 leading-snug">
                Gestão, liderança e processos
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1E4A]/75 backdrop-blur-md border border-[#B69D64]/40 shadow-lg hover:shadow-xl hover:border-[#B69D64]/80 transition-all flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#102A6B] text-[#D4B97A] shrink-0 border border-[#B69D64]/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Direção</h4>
              <p className="text-[11px] text-white/80 leading-snug">
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
            className="w-full text-base font-bold py-6 rounded-xl bg-gradient-to-r from-[#B69D64] via-[#D4B97A] to-[#B69D64] hover:from-[#c2a86f] hover:to-[#c2a86f] text-[#0A1E4A] shadow-2xl shadow-black/40 border border-[#FFF8DC]/60 transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
          >
            Começar Diagnóstico
            <span className="ml-2 font-mono text-lg text-[#0A1E4A]">&rarr;</span>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-white/90 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#D4B97A]" />
            <span>Leva apenas 3 a 5 minutos &middot; Seguro e sem custo</span>
          </div>
        </div>

        {/* Assinatura / Rodapé da landing */}
        <div className="mt-12 pt-6 border-t border-white/20 w-full max-w-xs text-center">
          <p className="text-xs text-[#D4B97A] font-bold tracking-widest uppercase">
            EDVANCED &middot; SOLUÇÕES EMPRESARIAIS
          </p>
        </div>

        {/* Acesso discreto à área administrativa */}
        <Link
          to="/dashboard"
          aria-label="Área administrativa"
          title="Área administrativa"
          className="mt-5 inline-flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/80 transition-colors font-medium tracking-wide"
        >
          <Lock className="w-3 h-3" aria-hidden="true" />
          <span>Área administrativa</span>
        </Link>
      </div>
    </div>
  )
}
