import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { DiagnosticoRecord, TemperaturaLead, SolucaoRecomendada } from '@/types/diagnostico'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportarDiagnosticosCsv } from '@/lib/csvExport'

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
  Quente: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  Morno: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Frio: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
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
const DashboardHeader: React.FC = () => (
  <div className="flex items-center gap-3 mb-8">
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
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

  // Estado da lista
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoRecord[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)

  // Filtros
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>('todas')
  const [filtroSolucao, setFiltroSolucao] = useState<string>('todas')

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEntrando(true)
    setErroLogin(null)
    try {
      const res = await fetch(`${pb.baseUrl}/api/dashboard-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: senha }),
      })
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
  }

  const handleExportCsv = () => {
    exportarDiagnosticosCsv(diagnosticosFiltrados)
  }

  // Aplica filtros localmente
  const diagnosticosFiltrados = diagnosticos.filter((d) => {
    if (filtroTemperatura !== 'todas' && d.temperatura_lead !== filtroTemperatura) return false
    if (filtroSolucao !== 'todas' && d.solucao_recomendada !== filtroSolucao) return false
    return true
  })

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
        <DashboardHeader />

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

        {/* Cards de métricas (KPIs) — Executive Luxury */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {' '}
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
                      Nome
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
                      Temperatura
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      Solução recomendada
                    </th>
                    <th className="px-4 py-3.5 font-bold text-white/80 uppercase tracking-wider text-xs whitespace-nowrap">
                      Data de envio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticosFiltrados.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                        {d.nome || '-'}
                      </td>
                      <td className="px-4 py-3 text-white/80 whitespace-nowrap font-mono text-xs">
                        {formatarWhatsapp(d.whatsapp)}
                      </td>
                      <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                        {d.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-white/70 max-w-[220px]">
                        <span className="line-clamp-2">{d.momento_atual || '-'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
                            temperaturaStyles[d.temperatura_lead] ||
                              'bg-white/10 text-white/70 border-white/20',
                          )}
                        >
                          {d.temperatura_lead || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/80 max-w-[260px]">
                        <span className="line-clamp-2">{d.solucao_recomendada || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap text-xs">
                        {formatarData(d.created)}
                      </td>
                    </tr>
                  ))}
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
