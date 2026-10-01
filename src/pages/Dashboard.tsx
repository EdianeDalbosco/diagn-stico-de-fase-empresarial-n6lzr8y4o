import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import {
  DiagnosticoRecord,
  TemperaturaLead,
  SolucaoRecomendada,
  StatusFollowup,
  STATUS_FOLLOWUP_LABELS,
} from '@/types/diagnostico'
import { updateStatusFollowup } from '@/services/diagnostico'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import {
  Bird,
  Lock,
  ArrowLeft,
  Loader2,
  Download,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Search,
  ArrowUp,
  ArrowDown,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportarDiagnosticosCsv } from '@/lib/csvExport'
import { NotificationBell } from '@/components/NotificationBell'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

const STORAGE_KEY_ULTIMA_VISUALIZACAO = 'edvanced_dashboard_ultima_visualizacao_ts'

// Lista fixa de soluções recomendadas possíveis (espelha src/types/diagnostico.ts)
const SOLUCOES: SolucaoRecomendada[] = [
  'Contato comercial prioritário',
  'Trajetória de Valor 5D',
  'Consultoria Empresarial',
  'Consultoria / solução de gestão',
  'Jornada Líder 360',
  'Edvanced Business Club',
  'Business Club',
  'Conteúdo / evento / Experience / produto de entrada',
]

const TEMPERATURAS: TemperaturaLead[] = ['Quente', 'Morno', 'Frio']

const STATUS_FOLLOWUP_OPTIONS: StatusFollowup[] = [
  'novo',
  'contatado',
  'em_negociacao',
  'ganho',
  'perdido',
]

// Paleta Executive Luxury — navy, dourado, off-white e acentos por temperatura
const CHART_COLORS = {
  navy: '#0A1E4A',
  navyMid: '#1A3A8A',
  gold: '#B69D64',
  goldLight: '#D4B97A',
  offWhite: '#F8F9FA',
  quente: '#F43F5E',
  morno: '#F59E0B',
  frio: '#38BDF8',
}

const TEMPERATURA_COR: Record<string, string> = {
  Quente: CHART_COLORS.quente,
  Morno: CHART_COLORS.morno,
  Frio: CHART_COLORS.frio,
}

// Paleta cíclica para barras de "solução recomendada" e "fase atual"
const BAR_PALETTE = [
  CHART_COLORS.gold,
  CHART_COLORS.navyMid,
  CHART_COLORS.goldLight,
  '#6B8FD8',
  '#A8884F',
  '#3E5C9E',
  '#E0C790',
  '#7B9AE0',
]

// Estilo visual por temperatura do lead
const temperaturaStyles: Record<string, string> = {
  Quente:
    'bg-gradient-to-r from-rose-500/25 to-amber-500/25 text-rose-200 border-rose-400/60 shadow-sm shadow-rose-950/40 font-extrabold ring-1 ring-rose-400/30',
  Morno: 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold',
  Frio: 'bg-sky-500/15 text-sky-300 border-sky-500/40 font-semibold',
}

// Estilo visual por status de follow-up (novo = azul, contatado = dourado, em negociação = âmbar, ganho = verde, perdido = cinza/vermelho)
const followupStyles: Record<StatusFollowup, string> = {
  novo: 'bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25',
  contatado: 'bg-[#B69D64]/20 text-[#D4B97A] border-[#B69D64]/50 hover:bg-[#B69D64]/30',
  em_negociacao: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
  ganho: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
  perdido: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
}

const formatarData = (iso?: string): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatarWhatsapp = (digits: string): string => {
  const clean = (digits || '').replace(/\D/g, '')
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  }
  return digits || '-'
}

// Marca/Topo compartilhado entre as telas do dashboard
interface DashboardHeaderProps {
  rightElement?: React.ReactNode
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ rightElement }) => (
  <div className="flex items-center justify-between gap-3 mb-8">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102A6B] via-[#1A3A8A] to-[#102A6B] flex items-center justify-center text-[#B69D64] shadow-md shadow-black/20 border border-[#B69D64]/40 shrink-0">
        <Bird className="w-5 h-5 stroke-[2]" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-black text-base sm:text-lg tracking-widest text-white uppercase">
            EDVANCED
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#B69D64]/20 text-[#D4B97A] border border-[#B69D64]/40">
            DASHBOARD
          </span>
        </div>
        <p className="text-[11px] sm:text-xs font-medium text-white/60 tracking-wide">
          Hub de Desenvolvimento &amp; Soluções Empresariais
        </p>
      </div>
    </div>
    {rightElement && <div>{rightElement}</div>}
  </div>
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

  // Estado da lista
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRecord[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)

  // Timestamp da última visualização para controle de novidades (persistido em localStorage)
  const [ultimaVisualizacao, setUltimaVisualizacao] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_ULTIMA_VISUALIZACAO)
      if (salvo) {
        const parsed = parseInt(salvo, 10)
        if (!Number.isNaN(parsed)) return parsed
      }
    } catch {
      // Ignora erro em ambientes restritos de localStorage
    }
    return 0
  })

  // Filtros
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>('todas')
  const [filtroSolucao, setFiltroSolucao] = useState<string>('todas')
  const [filtroFollowup, setFiltroFollowup] = useState<string>('todos')
  const [buscaNome, setBuscaNome] = useState('')
  const [atualizandoStatusId, setAtualizandoStatusId] = useState<string | null>(null)

  // Ordenação da tabela
  // sortKey = null => estado original (ordem de chegada, -created)
  // dir = 'asc' | 'desc'
  type SortKey = 'data' | 'nome' | 'temperatura' | 'followup'
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const ORDENACAO_TEMPERATURA: Record<string, number> = { Quente: 0, Morno: 1, Frio: 2 }
  const alternarOrdenacao = (coluna: SortKey) => {
    if (sortKey !== coluna) {
      setSortKey(coluna)
      setSortDir('asc')
      return
    }
    // mesma coluna: asc -> desc -> original
    if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
      setSortDir('asc')
    }
  }

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroLista(null)
    try {
      const resultado = await pb.collection('diagnosticos').getFullList<DiagnosticoRecord>({
        sort: '-created',
      })
      setDiagnosticos(resultado)
    } catch (err) {
      console.error('Erro ao carregar diagnósticos:', err)
      setErroLista('Não foi possível carregar os diagnósticos. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (autenticado) {
      carregar()
    }
  }, [autenticado, carregar])

  // Polling leve a cada 20s como garantia de conectividade além do realtime
  useEffect(() => {
    if (!autenticado) return
    const intervalo = setInterval(() => {
      carregar()
    }, 20000)
    return () => clearInterval(intervalo)
  }, [autenticado, carregar])

  // Callback realtime para inserções e atualizações na collection diagnosticos
  const handleRealtimeRecord = useCallback(
    (e: { action: string; record: any }) => {
      if (!autenticado) return
      const { action, record } = e
      const leadRecord = record as DiagnosticoRecord

      if (action === 'create') {
        setDiagnosticos((prev) => {
          // Evita duplicar se já estiver na lista
          if (prev.some((d) => d.id === leadRecord.id)) return prev
          return [leadRecord, ...prev]
        })

        const isQuente = (leadRecord.temperatura_lead || '').trim().toLowerCase() === 'quente'
        toast({
          title: isQuente
            ? `🔥 NOVO LEAD QUENTE — ${leadRecord.nome || 'Lead'}`
            : `Novo diagnóstico recebido — ${leadRecord.nome || 'Lead'}`,
          description: `${leadRecord.solucao_recomendada || 'Solução calculada'} · Temperatura: ${leadRecord.temperatura_lead || 'Frio'}`,
          className: isQuente
            ? 'bg-[#0A1E4A] border-2 border-rose-500 text-white shadow-2xl shadow-rose-950/50'
            : 'bg-[#0A1E4A] border border-[#B69D64] text-white shadow-xl',
        })
      } else if (action === 'update') {
        setDiagnosticos((prev) =>
          prev.map((item) => (item.id === leadRecord.id ? { ...item, ...leadRecord } : item)),
        )
      } else if (action === 'delete') {
        setDiagnosticos((prev) => prev.filter((item) => item.id !== leadRecord.id))
      }
    },
    [autenticado, toast],
  )

  useRealtime('diagnosticos', handleRealtimeRecord, autenticado)

  // Marcar todos os leads como vistos pelo admin
  const handleMarcarTodosComoVistos = useCallback(() => {
    const agora = Date.now()
    setUltimaVisualizacao(agora)
    try {
      localStorage.setItem(STORAGE_KEY_ULTIMA_VISUALIZACAO, String(agora))
    } catch {
      // Ignora erro de localStorage
    }
  }, [])

  // Leads novos não vistos:
  // Critério: status_followup === 'novo' E (se ultimaVisualizacao estiver setada, criado após ela OU primeira vez sem timestamp)
  const leadsNaoVistos = useMemo(() => {
    return diagnosticos.filter((d) => {
      const isNovo = (d.status_followup || 'novo') === 'novo'
      if (!isNovo) return false
      if (!ultimaVisualizacao) return true
      const createdTs = d.created ? new Date(d.created).getTime() : 0
      return createdTs > ultimaVisualizacao
    })
  }, [diagnosticos, ultimaVisualizacao])

  const contadorNaoVistos = leadsNaoVistos.length
  const temNovosQuentes = useMemo(() => {
    return leadsNaoVistos.some((d) => (d.temperatura_lead || '').trim().toLowerCase() === 'quente')
  }, [leadsNaoVistos])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEntrando(true)
    setErroLogin(null)
    try {
      let res = await fetch(`${pb.baseUrl}/backend/v1/dashboard-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: senha }),
      })
      if (res.status === 404) {
        // Fallback de rota caso o ambiente sirva em /api/
        res = await fetch(`${pb.baseUrl}/api/dashboard-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: senha }),
        })
      }
      if (res.ok) {
        setAutenticado(true)
      } else {
        setErroLogin('Senha inválida. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro no login do dashboard:', err)
      setErroLogin('Erro ao validar a senha. Verifique sua conexão.')
    } finally {
      setEntrando(false)
    }
  }

  const handleLogout = () => {
    setAutenticado(false)
    setSenha('')
    setDiagnosticos([])
    setFiltroTemperatura('todas')
    setFiltroSolucao('todas')
    setFiltroFollowup('todos')
    setBuscaNome('')
  }

  // Ao clicar em um lead na notificação, filtra por ele ou localiza na tabela
  const handleSelecionarLeadNotificacao = useCallback((lead: DiagnosticoRecord) => {
    if (lead.nome) {
      setBuscaNome(lead.nome)
    }
    setFiltroTemperatura('todas')
    setFiltroSolucao('todas')
    setFiltroFollowup('todos')
  }, [])

  const handleUpdateStatus = async (id: string, novoStatus: StatusFollowup) => {
    setAtualizandoStatusId(id)
    try {
      await updateStatusFollowup(id, novoStatus)
      setDiagnosticos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status_followup: novoStatus } : item)),
      )
    } catch (err) {
      console.error('Erro ao atualizar status de follow-up:', err)
      alert('Não foi possível atualizar o status. Tente novamente.')
    } finally {
      setAtualizandoStatusId(null)
    }
  }

  const handleExportCsv = () => {
    exportarDiagnosticosCsv(diagnosticosFiltrados)
  }

  // Aplica filtros localmente (temperatura + solução + status + busca por nome — AND lógico)
  const termoBusca = buscaNome.trim().toLowerCase()
  const diagnosticosFiltrados = diagnosticos.filter((d) => {
    if (filtroTemperatura !== 'todas' && d.temperatura_lead !== filtroTemperatura) return false
    if (filtroSolucao !== 'todas' && d.solucao_recomendada !== filtroSolucao) return false
    const statusAtual = d.status_followup || 'novo'
    if (filtroFollowup !== 'todos' && statusAtual !== filtroFollowup) return false
    if (termoBusca && !(d.nome || '').toLowerCase().includes(termoBusca)) return false
    return true
  })

  // Aplica ordenação da tabela (mantém a ordem original quando sortKey === null)
  const diagnosticosOrdenados = useMemo(() => {
    if (!sortKey) return diagnosticosFiltrados
    const arr = [...diagnosticosFiltrados]
    const dirMult = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      if (sortKey === 'data') {
        const ta = a.created ? new Date(a.created).getTime() : 0
        const tb = b.created ? new Date(b.created).getTime() : 0
        return (ta - tb) * dirMult
      }
      if (sortKey === 'nome') {
        const na = (a.nome || '').toLowerCase()
        const nb = (b.nome || '').toLowerCase()
        return na.localeCompare(nb, 'pt-BR') * dirMult
      }
      if (sortKey === 'followup') {
        const fa = a.status_followup || 'novo'
        const fb = b.status_followup || 'novo'
        return fa.localeCompare(fb, 'pt-BR') * dirMult
      }
      // temperatura
      const va = a.temperatura_lead ? (ORDENACAO_TEMPERATURA[a.temperatura_lead] ?? 99) : 99
      const vb = b.temperatura_lead ? (ORDENACAO_TEMPERATURA[b.temperatura_lead] ?? 99) : 99
      return (va - vb) * dirMult
    })
    return arr
  }, [diagnosticosFiltrados, sortKey, sortDir])

  // Evolução diária do número de diagnósticos (respeita os filtros ativos)
  const dadosEvolucaoDiaria = useMemo(() => {
    const counts: Record<string, number> = {}
    diagnosticosFiltrados.forEach((d) => {
      if (!d.created) return
      const dt = new Date(d.created)
      if (Number.isNaN(dt.getTime())) return
      const chave = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(
        2,
        '0',
      )}`
      counts[chave] = (counts[chave] || 0) + 1
    })
    return Object.entries(counts)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [da, ma] = a.data.split('/').map(Number)
        const [db, mb] = b.data.split('/').map(Number)
        if (ma !== mb) return ma - mb
        return da - db
      })
  }, [diagnosticosFiltrados])

  // Dados agregados para os gráficos (respondem aos filtros ativos)
  const dadosTemperatura = useMemo(() => {
    const counts: Record<string, number> = { Quente: 0, Morno: 0, Frio: 0 }
    diagnosticosFiltrados.forEach((d) => {
      const t = d.temperatura_lead
      if (t && counts[t] !== undefined) counts[t] += 1
    })
    return (Object.keys(counts) as TemperaturaLead[]).map((t) => ({
      name: t,
      value: counts[t],
    }))
  }, [diagnosticosFiltrados])

  const dadosSolucao = useMemo(() => {
    const counts: Record<string, number> = {}
    diagnosticosFiltrados.forEach((d) => {
      const s = d.solucao_recomendada || 'Não definida'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [diagnosticosFiltrados])

  const dadosFase = useMemo(() => {
    const counts: Record<string, number> = {}
    diagnosticosFiltrados.forEach((d) => {
      const f = d.momento_atual || 'Não informada'
      counts[f] = (counts[f] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [diagnosticosFiltrados])

  const temDadosParaGraficos = diagnosticosFiltrados.length > 0

  // -------- KPIs do dashboard --------
  // Total geral (KPI fixo), taxa de conclusão e leads nos últimos 30 dias.
  // O diagnóstico só é salvo quando concluído, então todo registro salvo é
  // considerado concluído (taxa de conclusão = 100% dos que iniciaram e salvaram).
  const totalDiagnosticos = diagnosticos.length

  const taxaConclusao = useMemo(() => {
    // Todo registro salvo representa um diagnóstico concluído.
    if (totalDiagnosticos === 0) return 0
    return 100
  }, [totalDiagnosticos])

  const leadsUltimos30Dias = useMemo(() => {
    const limite = Date.now() - 30 * 24 * 60 * 60 * 1000
    return diagnosticos.filter((d) => {
      if (!d.created) return false
      const t = new Date(d.created).getTime()
      return !Number.isNaN(t) && t >= limite
    }).length
  }, [diagnosticos])

  // Contagem de leads quentes (total e pendentes de contato)
  const leadsQuentesTotal = useMemo(() => {
    return diagnosticos.filter((d) => (d.temperatura_lead || '').trim().toLowerCase() === 'quente')
      .length
  }, [diagnosticos])

  const leadsQuentesNovos = useMemo(() => {
    return diagnosticos.filter((d) => {
      const isQ = (d.temperatura_lead || '').trim().toLowerCase() === 'quente'
      const isNovo = (d.status_followup || 'novo') === 'novo'
      return isQ && isNovo
    }).length
  }, [diagnosticos])

  // -------- TELA DE LOGIN --------
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0A1E4A] text-white flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <DashboardHeader />
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30 border border-[#B69D64]/30"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#0A1E4A] flex items-center justify-center text-[#B69D64] mb-4 border border-[#B69D64]/40">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A1E4A] tracking-tight">
                Acesso Restrito
              </h1>
              <p className="text-sm text-[#5A6E85] font-medium mt-1">
                Informe a senha para visualizar o dashboard de leads.
              </p>
            </div>

            <div className="space-y-1.5 mb-4">
              <Label htmlFor="senha-dashboard" className="text-sm font-bold text-[#0A1E4A]">
                Senha
              </Label>
              <Input
                id="senha-dashboard"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha de acesso"
                autoFocus
                className="bg-white border-[#E2E8F0] focus:border-[#B69D64] focus:ring-[#B69D64] text-[#0A1E4A] placeholder:text-[#A0AEC0] h-11 rounded-xl shadow-sm"
              />
            </div>

            {erroLogin && (
              <p className="text-sm text-rose-600 font-medium mb-4 text-center">{erroLogin}</p>
            )}

            <Button
              type="submit"
              disabled={entrando || !senha.trim()}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0A1E4A] via-[#102A6B] to-[#0A1E4A] hover:from-[#0d2663] hover:to-[#08173d] text-white font-bold shadow-md shadow-[#0A1E4A]/15 border border-[#B69D64]/40 hover:border-[#B69D64] transition-all cursor-pointer"
            >
              {entrando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#B69D64]" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full mt-4 text-xs text-[#5A6E85] hover:text-[#0A1E4A] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao diagnóstico
            </button>
          </form>
        </div>
      </div>
    )
  }

  // -------- DASHBOARD --------
  return (
    <div className="min-h-screen bg-[#0A1E4A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <DashboardHeader
          rightElement={
            <div className="flex items-center gap-2">
              <NotificationBell
                leadsNaoVistos={leadsNaoVistos}
                contadorNaoVistos={contadorNaoVistos}
                temNovosQuentes={temNovosQuentes}
                onMarcarTodosComoVistos={handleMarcarTodosComoVistos}
                onSelecionarLead={handleSelecionarLeadNotificacao}
              />
            </div>
          }
        />

        {/* Barra superior do dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard de Leads
            </h1>
            <p className="text-sm text-white/60 font-medium mt-1">
              {diagnosticosFiltrados.length} de {diagnosticos.length} diagnóstico(s) exibido(s)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleExportCsv}
              disabled={diagnosticosFiltrados.length === 0}
              className="bg-gradient-to-r from-[#B69D64] to-[#A8884F] hover:from-[#C2A872] hover:to-[#B69D64] text-white font-bold rounded-xl shadow-md shadow-black/20 border border-[#D4B97A]/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Diagnóstico
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-[#B69D64]/40 text-[#D4B97A] hover:bg-[#B69D64]/10 hover:text-[#D4B97A] rounded-xl font-semibold"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Banner de Alerta de Lead Quente no Topo (caso haja leads quentes pendentes de contato) */}
        {leadsQuentesNovos > 0 && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-rose-900/30 to-[#0A1E4A] border-2 border-rose-500/60 shadow-xl shadow-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-900/50 ring-2 ring-rose-400/40 animate-pulse">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase text-rose-300">
                    ALERTA DE LEAD QUENTE
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white tracking-wide uppercase">
                    Prioridade Alta
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {leadsQuentesNovos === 1
                    ? 'Há 1 lead quente aguardando seu primeiro contato!'
                    : `Há ${leadsQuentesNovos} leads quentes aguardando seu primeiro contato!`}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  Leads quentes possuem alta urgência e prontidão comercial. Entre em contato rápido
                  via WhatsApp para maximizar a conversão.
                </p>
              </div>
            </div>
            {filtroTemperatura !== 'Quente' && (
              <Button
                type="button"
                onClick={() => {
                  setFiltroTemperatura('Quente')
                  setFiltroFollowup('todos')
                }}
                className="shrink-0 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold rounded-xl px-4 py-2 text-xs shadow-md shadow-rose-950/40 border border-amber-300/40 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 mr-1.5" />
                Filtrar Leads Quentes
              </Button>
            )}
          </div>
        )}

        {/* Cards de métricas (KPIs) — Executive Luxury */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold text-[#5A6E85] uppercase tracking-wider">
                  Total de diagnósticos
                </p>
                <p className="text-3xl font-extrabold text-[#0A1E4A] mt-1.5 leading-none">
                  {totalDiagnosticos}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#B69D64]/10 text-[#B69D64]">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#5A6E85] font-medium">Todos os registros salvos</p>
          </div>

          <div
            onClick={() =>
              setFiltroTemperatura(filtroTemperatura === 'Quente' ? 'todas' : 'Quente')
            }
            className={cn(
              'bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:border-[#B69D64]',
              leadsQuentesTotal > 0
                ? 'border-rose-300 ring-2 ring-rose-500/20'
                : 'border-[#E2E8F0]',
            )}
            title="Clique para filtrar apenas leads quentes"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                    Leads Quentes
                  </p>
                  {leadsQuentesNovos > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <p className="text-3xl font-extrabold text-rose-600 mt-1.5 leading-none flex items-center gap-2">
                  {leadsQuentesTotal}
                  {leadsQuentesNovos > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                      {leadsQuentesNovos} novos
                    </span>
                  )}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#5A6E85] font-medium">
              {filtroTemperatura === 'Quente'
                ? 'Filtro ativo — clique para limpar'
                : 'Prioridade alta de contato'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold text-[#5A6E85] uppercase tracking-wider">
                  Taxa de conclusão
                </p>
                <p className="text-3xl font-extrabold text-[#0A1E4A] mt-1.5 leading-none">
                  {taxaConclusao}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#B69D64]/10 text-[#B69D64]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#5A6E85] font-medium">Diagnósticos finalizados</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold text-[#5A6E85] uppercase tracking-wider">
                  Leads (últimos 30 dias)
                </p>
                <p className="text-3xl font-extrabold text-[#0A1E4A] mt-1.5 leading-none">
                  {leadsUltimos30Dias}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#B69D64]/10 text-[#B69D64]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-[#5A6E85] font-medium">Novos diagnósticos no período</p>
          </div>
        </div>

        {/* Gráfico de evolução de leads por dia — Executive Luxury (ouro) */}
        {!carregando && !erroLista && temDadosParaGraficos && dadosEvolucaoDiaria.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-6">
            <h3 className="text-xs font-bold text-[#5A6E85] uppercase tracking-wider mb-4">
              Evolução de diagnósticos por dia
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosEvolucaoDiaria}
                  margin={{ top: 8, right: 16, bottom: 0, left: -12 }}
                >
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B69D64" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#B69D64" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="data"
                    tick={{ fill: '#5A6E85', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#5A6E85', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0A1E4A',
                      border: '1px solid #B69D64',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#D4B97A' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="quantidade"
                    stroke="#B69D64"
                    strokeWidth={2.5}
                    fill="url(#gradLeads)"
                    dot={{ fill: '#B69D64', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filtros + busca por nome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Buscar por nome
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <Input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-9 bg-white/5 border-white/15 text-white rounded-xl h-11 focus:border-[#B69D64] focus:ring-[#B69D64] placeholder:text-white/40"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Temperatura do lead
            </Label>
            <Select value={filtroTemperatura} onValueChange={setFiltroTemperatura}>
              <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-xl h-11 focus:border-[#B69D64] focus:ring-[#B69D64]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as temperaturas</SelectItem>
                {TEMPERATURAS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Solução recomendada
            </Label>
            <Select value={filtroSolucao} onValueChange={setFiltroSolucao}>
              <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-xl h-11 focus:border-[#B69D64] focus:ring-[#B69D64]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as soluções</SelectItem>
                {SOLUCOES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Status Follow-up
            </Label>
            <Select value={filtroFollowup} onValueChange={setFiltroFollowup}>
              <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-xl h-11 focus:border-[#B69D64] focus:ring-[#B69D64]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {STATUS_FOLLOWUP_OPTIONS.map((st) => (
                  <SelectItem key={st} value={st}>
                    {STATUS_FOLLOWUP_LABELS[st]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gráficos — distribuição por temperatura, solução e fase */}
        {!carregando && !erroLista && temDadosParaGraficos && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Pizza: distribuição por temperatura */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                Distribuição por temperatura
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosTemperatura}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="#0A1E4A"
                    >
                      {dadosTemperatura.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={TEMPERATURA_COR[entry.name] || CHART_COLORS.gold}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0A1E4A',
                        border: '1px solid #B69D64',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#D4B97A' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                {dadosTemperatura.map((t) => (
                  <div key={t.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: TEMPERATURA_COR[t.name] || CHART_COLORS.gold }}
                    />
                    <span className="text-[11px] text-white/70 font-medium">
                      {t.name} ({t.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barras horizontais: distribuição por solução recomendada */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                Por solução recomendada
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosSolucao}
                    layout="vertical"
                    margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        background: '#0A1E4A',
                        border: '1px solid #B69D64',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#D4B97A' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                      {dadosSolucao.map((_, i) => (
                        <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Barras horizontais: distribuição por fase/momento atual */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                Por fase / momento atual
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosFase}
                    layout="vertical"
                    margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 9 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        background: '#0A1E4A',
                        border: '1px solid #B69D64',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#D4B97A' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {dadosFase.map((_, i) => (
                        <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Estados: carregando / erro / vazia / tabela */}
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/70">
            <Loader2 className="w-8 h-8 animate-spin text-[#B69D64] mb-3" />
            <p className="text-sm font-medium">Carregando diagnósticos...</p>
          </div>
        ) : erroLista ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center">
            <p className="text-sm text-rose-300 font-medium">{erroLista}</p>
            <Button
              variant="outline"
              onClick={carregar}
              className="mt-4 border-rose-500/40 text-rose-300 hover:bg-rose-500/10 rounded-xl font-semibold"
            >
              Tentar novamente
            </Button>
          </div>
        ) : diagnosticosFiltrados.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-white/60 font-medium">
              {diagnosticos.length === 0
                ? 'Nenhum diagnóstico cadastrado ainda.'
                : 'Nenhum diagnóstico corresponde aos filtros selecionados.'}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0A1E4A] border-b border-white/15 text-left">
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alternarOrdenacao('nome')}
                        className="inline-flex items-center gap-1 cursor-pointer hover:text-[#D4B97A] transition-colors"
                      >
                        Nome
                        {sortKey === 'nome' &&
                          (sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[#B69D64]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#B69D64]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      WhatsApp
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      E-mail
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      Fase atual
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alternarOrdenacao('temperatura')}
                        className="inline-flex items-center gap-1 cursor-pointer hover:text-[#D4B97A] transition-colors"
                      >
                        Temperatura
                        {sortKey === 'temperatura' &&
                          (sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[#B69D64]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#B69D64]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      Solução recomendada
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alternarOrdenacao('followup')}
                        className="inline-flex items-center gap-1 cursor-pointer hover:text-[#D4B97A] transition-colors"
                      >
                        Follow-up
                        {sortKey === 'followup' &&
                          (sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[#B69D64]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#B69D64]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alternarOrdenacao('data')}
                        className="inline-flex items-center gap-1 cursor-pointer hover:text-[#D4B97A] transition-colors"
                      >
                        Data de envio
                        {sortKey === 'data' &&
                          (sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-[#B69D64]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#B69D64]" />
                          ))}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticosOrdenados.map((d) => {
                    const statusAtual: StatusFollowup =
                      (d.status_followup as StatusFollowup) || 'novo'
                    const estaAtualizando = atualizandoStatusId === d.id
                    const isQuente = (d.temperatura_lead || '').trim().toLowerCase() === 'quente'

                    return (
                      <tr
                        key={d.id}
                        className={cn(
                          'border-b transition-colors',
                          isQuente
                            ? 'bg-gradient-to-r from-rose-950/25 via-amber-950/15 to-transparent border-rose-500/30 hover:bg-rose-950/40'
                            : 'border-white/5 hover:bg-white/5',
                        )}
                      >
                        <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isQuente && (
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white shrink-0 shadow-sm shadow-rose-950/50"
                                title="Lead Quente — Prioridade Máxima"
                              >
                                <Flame className="w-3 h-3" />
                              </span>
                            )}
                            <span className={cn(isQuente && 'font-bold text-white')}>
                              {d.nome || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap font-mono text-xs">
                          {d.whatsapp ? (
                            <a
                              href={`https://wa.me/55${(d.whatsapp || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'hover:underline transition-colors',
                                isQuente
                                  ? 'text-emerald-300 font-semibold hover:text-emerald-200'
                                  : 'text-white/80 hover:text-white',
                              )}
                              title="Abrir no WhatsApp"
                            >
                              {formatarWhatsapp(d.whatsapp)}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                          {d.email || '-'}
                        </td>
                        <td className="px-4 py-3 text-white/70 max-w-[200px]">
                          <span className="line-clamp-2">{d.momento_atual || '-'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border',
                              temperaturaStyles[d.temperatura_lead] ||
                                'bg-white/10 text-white/70 border-white/20',
                            )}
                          >
                            {isQuente && (
                              <Flame className="w-3 h-3 text-rose-300 fill-rose-300/30" />
                            )}
                            {d.temperatura_lead || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/80 max-w-[220px]">
                          <span className="line-clamp-2">{d.solucao_recomendada || '-'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {d.id ? (
                            <Select
                              value={statusAtual}
                              disabled={estaAtualizando}
                              onValueChange={(val) =>
                                handleUpdateStatus(d.id!, val as StatusFollowup)
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  'h-7 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer min-w-[125px]',
                                  followupStyles[statusAtual],
                                )}
                              >
                                {estaAtualizando ? (
                                  <span className="inline-flex items-center gap-1 text-[11px]">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Salvando...
                                  </span>
                                ) : (
                                  <SelectValue>{STATUS_FOLLOWUP_LABELS[statusAtual]}</SelectValue>
                                )}
                              </SelectTrigger>
                              <SelectContent className="bg-[#0A1E4A] border border-[#B69D64]/40 text-white">
                                {STATUS_FOLLOWUP_OPTIONS.map((st) => (
                                  <SelectItem
                                    key={st}
                                    value={st}
                                    className="text-xs hover:bg-white/10 focus:bg-white/15 focus:text-white cursor-pointer"
                                  >
                                    <span className="inline-flex items-center gap-1.5">
                                      <span
                                        className={cn(
                                          'w-2 h-2 rounded-full',
                                          st === 'novo' && 'bg-sky-400',
                                          st === 'contatado' && 'bg-[#D4B97A]',
                                          st === 'em_negociacao' && 'bg-amber-400',
                                          st === 'ganho' && 'bg-emerald-400',
                                          st === 'perdido' && 'bg-rose-400',
                                        )}
                                      />
                                      {STATUS_FOLLOWUP_LABELS[st]}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-white/50">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                          {formatarData(d.created)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <footer className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/50 font-medium">
            EDVANCED &copy; {new Date().getFullYear()} &middot; Hub de Desenvolvimento &amp;
            Soluções Empresariais
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard
