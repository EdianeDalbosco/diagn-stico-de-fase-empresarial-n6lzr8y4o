import React from 'react'
import { Bell, Flame, CheckCheck, Clock, ExternalLink } from 'lucide-react'
import { DiagnosticoRecord } from '@/types/diagnostico'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  leadsNaoVistos: DiagnosticoRecord[]
  contadorNaoVistos: number
  temNovosQuentes: boolean
  onMarcarTodosComoVistos: () => void
  onSelecionarLead?: (lead: DiagnosticoRecord) => void
}

const formatarTempoRelativo = (iso?: string): string => {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diffSegundos = Math.floor((Date.now() - t) / 1000)

  if (diffSegundos < 60) return 'Agora mesmo'
  const diffMinutos = Math.floor(diffSegundos / 60)
  if (diffMinutos < 60) return `Há ${diffMinutos} min`
  const diffHoras = Math.floor(diffMinutos / 60)
  if (diffHoras < 24) return `Há ${diffHoras}h`
  const diffDias = Math.floor(diffHoras / 24)
  if (diffDias === 1) return 'Ontem'
  if (diffDias < 7) return `Há ${diffDias} dias`

  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  leadsNaoVistos,
  contadorNaoVistos,
  temNovosQuentes,
  onMarcarTodosComoVistos,
  onSelecionarLead,
}) => {
  const [aberto, setAberto] = React.useState(false)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notificações: ${contadorNaoVistos} leads novos`}
          className={cn(
            'relative p-2.5 rounded-xl border transition-all cursor-pointer outline-none',
            'bg-white/5 hover:bg-white/10 active:scale-95',
            temNovosQuentes
              ? 'border-rose-500/60 text-rose-300 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
              : contadorNaoVistos > 0
                ? 'border-[#B69D64]/60 text-[#D4B97A] ring-1 ring-[#B69D64]/30'
                : 'border-white/15 text-white/70 hover:text-white',
          )}
        >
          <Bell
            className={cn(
              'w-5 h-5 transition-transform',
              contadorNaoVistos > 0 && 'animate-[wiggle_1s_ease-in-out_infinite]',
            )}
          />

          {/* Badge do contador */}
          {contadorNaoVistos > 0 && (
            <span
              className={cn(
                'absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center',
                'text-[10px] font-black leading-none text-white shadow-md border',
                temNovosQuentes
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 border-rose-300 animate-pulse'
                  : 'bg-gradient-to-r from-[#B69D64] to-[#A8884F] border-[#D4B97A]',
              )}
            >
              {contadorNaoVistos > 99 ? '99+' : contadorNaoVistos}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[400px] p-0 bg-[#0A1E4A] border border-[#B69D64]/40 rounded-2xl shadow-2xl text-white overflow-hidden z-50 backdrop-blur-md"
      >
        {/* Topo do painel */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B69D64]/15 border border-[#B69D64]/40 flex items-center justify-center text-[#D4B97A]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">Leads Novos</h4>
                {contadorNaoVistos > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider',
                      temNovosQuentes
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                        : 'bg-[#B69D64]/20 text-[#D4B97A] border border-[#B69D64]/40',
                    )}
                  >
                    {contadorNaoVistos} não {contadorNaoVistos === 1 ? 'visto' : 'vistos'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50">Chegadas em tempo real</p>
            </div>
          </div>

          {contadorNaoVistos > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onMarcarTodosComoVistos()
              }}
              className="text-xs text-[#D4B97A] hover:text-white hover:bg-[#B69D64]/20 h-8 px-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar como vistos
            </Button>
          )}
        </div>

        {/* Lista de leads não vistos */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
          {leadsNaoVistos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-white/30 border border-white/10">
                <CheckCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white/80">Tudo em dia!</p>
              <p className="text-xs text-white/50 mt-1 max-w-[240px] mx-auto">
                Nenhum lead novo pendente de visualização no momento.
              </p>
            </div>
          ) : (
            leadsNaoVistos.map((lead) => {
              const isQuente = (lead.temperatura_lead || '').trim().toLowerCase() === 'quente'
              const isMorno = (lead.temperatura_lead || '').trim().toLowerCase() === 'morno'

              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    if (onSelecionarLead) {
                      onSelecionarLead(lead)
                      setAberto(false)
                    }
                  }}
                  className={cn(
                    'p-3.5 transition-colors cursor-pointer group',
                    isQuente
                      ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-2 border-l-rose-500'
                      : 'hover:bg-white/5 border-l-2 border-l-transparent hover:border-l-[#B69D64]',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isQuente && (
                        <Flame className="w-4 h-4 text-rose-400 fill-rose-400/30 shrink-0 animate-pulse" />
                      )}
                      <span className="text-sm font-bold text-white truncate group-hover:text-[#D4B97A] transition-colors">
                        {lead.nome || 'Lead sem nome'}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border',
                        isQuente
                          ? 'bg-rose-500/25 text-rose-300 border-rose-400/50'
                          : isMorno
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-400/40',
                      )}
                    >
                      {lead.temperatura_lead || 'Frio'}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mt-1 line-clamp-1">
                    <span className="text-white/40 font-medium">Solução: </span>
                    {lead.solucao_recomendada || 'Não informada'}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 text-[11px] text-white/50 border-t border-white/5">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-white/40" />
                      {formatarTempoRelativo(lead.created)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-[#D4B97A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver no dashboard
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé do popover com ação de marcar */}
        {leadsNaoVistos.length > 0 && (
          <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs">
            <span className="text-white/50 text-[11px]">
              {leadsNaoVistos.length} {leadsNaoVistos.length === 1 ? 'registro' : 'registros'}
            </span>
            <button
              type="button"
              onClick={() => {
                onMarcarTodosComoVistos()
              }}
              className="text-[#D4B97A] hover:text-white font-bold cursor-pointer transition-colors"
            >
              Marcar todos como vistos
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
