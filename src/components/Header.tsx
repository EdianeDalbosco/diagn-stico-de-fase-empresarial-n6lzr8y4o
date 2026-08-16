import React from 'react'
import { Sparkles, Compass } from 'lucide-react'

interface HeaderProps {
  currentStep: number
  totalSteps: number
  isStarted: boolean
  isCompleted: boolean
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  isStarted,
  isCompleted,
}) => {
  const progress = isCompleted ? 100 : isStarted ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Marca */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  EDVANCED
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DIAGNÓSTICO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Diagnóstico de Fase Empresarial
              </p>
            </div>
          </div>

          {/* Indicador de progresso se o formulário estiver ativo */}
          {isStarted && !isCompleted && (
            <div className="flex items-center gap-2 text-right">
              <div className="text-right">
                <span className="text-xs font-semibold text-white block">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span className="text-[10px] text-indigo-400 font-medium">
                  {progress}% concluído
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Progresso Interativa */}
        {isStarted && !isCompleted && (
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </header>
  )
}
