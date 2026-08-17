import React from 'react'
import { Sparkles, Compass } from 'lucide-react'

interface HeaderProps {
  currentStep: number
  totalSteps: number
  isStarted: boolean
  isCompleted: boolean
}

import { Bird } from 'lucide-react'

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  isStarted,
  isCompleted,
}) => {
  const progress = isCompleted ? 100 : isStarted ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] flex items-center justify-center text-[#B69D64] shadow-md shadow-[#0A1E4A]/15 border border-[#B69D64]/30 shrink-0">
              <Bird className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-widest text-[#0A1E4A] uppercase">
                  EDVANCED
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#B69D64]/15 text-[#8C753E] border border-[#B69D64]/30">
                  DIAGNÓSTICO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-[#5A6E85] tracking-wide">
                Hub de Desenvolvimento &amp; Soluções Empresariais
              </p>
            </div>
          </div>

          {/* Indicador de progresso se o formulário estiver ativo */}
          {isStarted && !isCompleted && (
            <div className="flex items-center gap-2 text-right">
              <div className="text-right">
                <span className="text-xs font-bold text-[#0A1E4A] block">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span className="text-[11px] text-[#B69D64] font-semibold">
                  {progress}% concluído
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Progresso Interativa */}
        {isStarted && !isCompleted && (
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mt-2.5">
            <div
              className="h-full bg-gradient-to-r from-[#0A1E4A] via-[#B69D64] to-[#D4AF37] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </header>
  )
}
