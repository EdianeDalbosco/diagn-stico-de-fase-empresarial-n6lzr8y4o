import React from 'react'
import { FormStepData } from '@/types/diagnostico'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepProps {
  formData: FormStepData
  updateFormData: (patch: Partial<FormStepData>) => void
  error?: string | null
}

// Option item helper component
const RadioOption: React.FC<{
  label: string
  selected: boolean
  onClick: () => void
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full p-3.5 sm:p-4 text-left rounded-xl border transition-all duration-150 flex items-start justify-between gap-3 text-sm sm:text-base font-normal',
      selected
        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
        : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 hover:text-white',
    )}
  >
    <span className="flex-1 leading-snug">{label}</span>
    <div
      className={cn(
        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
        selected
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-700 bg-slate-950/50',
      )}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </button>
)

// Checkbox item helper component
const CheckboxOption: React.FC<{
  label: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}> = ({ label, selected, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    className={cn(
      'w-full p-3 sm:p-3.5 text-left rounded-xl border transition-all duration-150 flex items-start justify-between gap-3 text-sm font-normal',
      selected
        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/50'
        : disabled
          ? 'opacity-40 bg-slate-900/30 border-slate-800/40 text-slate-500 cursor-not-allowed'
          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700 hover:text-white',
    )}
  >
    <span className="flex-1 leading-snug">{label}</span>
    <div
      className={cn(
        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
        selected
          ? 'border-indigo-500 bg-indigo-600 text-white'
          : 'border-slate-700 bg-slate-950/50',
      )}
    >
      {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </div>
  </button>
)

// -------------------------------------------------------------
// ETAPA 1: QUEM É VOCÊ?
// -------------------------------------------------------------
export const Step1: React.FC<StepProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome" className="text-sm font-medium text-slate-200">
          Nome completo <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="nome"
          type="text"
          placeholder="Digite seu nome completo"
          value={formData.nome}
          onChange={(e) => updateFormData({ nome: e.target.value })}
          className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp" className="text-sm font-medium text-slate-200">
          WhatsApp com DDD <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="whatsapp"
          type="tel"
          placeholder="(00) 00000-0000"
          value={formData.whatsapp}
          onChange={(e) => updateFormData({ whatsapp: e.target.value })}
          className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate-200">
          E-mail principal <span className="text-rose-400">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-11"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="instagram" className="text-sm font-medium text-slate-200">
            Instagram <span className="text-xs text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="instagram"
            type="text"
            placeholder="@seu.perfil"
            value={formData.instagram}
            onChange={(e) => updateFormData({ instagram: e.target.value })}
            className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cidade_estado" className="text-sm font-medium text-slate-200">
            Cidade / Estado <span className="text-xs text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="cidade_estado"
            type="text"
            placeholder="Ex: São Paulo / SP"
            value={formData.cidade_estado}
            onChange={(e) => updateFormData({ cidade_estado: e.target.value })}
            className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-11"
          />
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 2: QUAL É O SEU MOMENTO ATUAL?
// -------------------------------------------------------------
export const Step2: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Tenho conhecimento/experiência, mas ainda não transformei isso em um produto ou negócio',
    'Estou começando a empreender',
    'Já tenho um negócio, mas ainda funciona de forma muito improvisada',
    'Meu negócio está estruturado, mas quero crescer',
    'Meu negócio cresceu e agora preciso organizar a gestão',
    'Tenho equipe e quero desenvolver minha liderança',
    'Sou líder/gestor dentro de uma empresa',
    'Quero aumentar meu faturamento e gerar novos resultados',
    'Quero ampliar meu networking e estar próximo de outros empresários',
    'Outro',
  ]

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.momento_atual === opt}
          onClick={() => updateFormData({ momento_atual: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 3: SOBRE O SEU NEGÓCIO
// -------------------------------------------------------------
export const Step3: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const statusNegocio = ['Sim', 'Não', 'Estou estruturando'] as const

  const tempoOptions = [
    'Menos de 1 ano',
    '1 a 3 anos',
    '4 a 6 anos',
    '7 a 10 anos',
    'Mais de 10 anos',
  ]

  const equipeOptions = ['Somente eu', '1 a 3', '4 a 10', '11 a 20', '21 a 50', 'Mais de 50']

  const faturamentoOptions = [
    'Ainda não faturo',
    'Até R$ 10 mil',
    'De R$ 10 mil a R$ 30 mil',
    'De R$ 30 mil a R$ 50 mil',
    'De R$ 50 mil a R$ 100 mil',
    'De R$ 100 mil a R$ 300 mil',
    'Acima de R$ 300 mil',
    'Prefiro não informar',
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-200">
          Você possui um negócio atualmente? <span className="text-rose-400">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {statusNegocio.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateFormData({ tem_negocio: item })}
              className={cn(
                'p-3 text-center rounded-xl border text-sm font-medium transition-all',
                formData.tem_negocio === item
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Se SIM ou se ESTOU ESTRUTURANDO, mostrar detalhes adicionais */}
      {formData.tem_negocio === 'Sim' && (
        <div className="space-y-5 pt-4 border-t border-slate-800/80 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome_empresa" className="text-xs font-medium text-slate-300">
                Nome da empresa
              </Label>
              <Input
                id="nome_empresa"
                placeholder="Ex: Minha Empresa"
                value={formData.nome_empresa}
                onChange={(e) => updateFormData({ nome_empresa: e.target.value })}
                className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="segmento" className="text-xs font-medium text-slate-300">
                Segmento de atuação
              </Label>
              <Input
                id="segmento"
                placeholder="Ex: Consultoria, Saúde, Varejo, etc."
                value={formData.segmento}
                onChange={(e) => updateFormData({ segmento: e.target.value })}
                className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-300">
              Há quanto tempo a empresa existe?
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tempoOptions.map((tempo) => (
                <button
                  key={tempo}
                  type="button"
                  onClick={() => updateFormData({ tempo_empresa: tempo })}
                  className={cn(
                    'p-2.5 text-xs text-center rounded-lg border transition-all',
                    formData.tempo_empresa === tempo
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800',
                  )}
                >
                  {tempo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-300">
              Quantas pessoas fazem parte da equipe?
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equipeOptions.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => updateFormData({ tamanho_equipe: eq })}
                  className={cn(
                    'p-2.5 text-xs text-center rounded-lg border transition-all',
                    formData.tamanho_equipe === eq
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800',
                  )}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-300">
              Qual é aproximadamente o faturamento médio mensal atual?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {faturamentoOptions.map((fat) => (
                <button
                  key={fat}
                  type="button"
                  onClick={() => updateFormData({ faixa_faturamento: fat })}
                  className={cn(
                    'p-2.5 text-xs text-left rounded-lg border transition-all flex items-center justify-between',
                    formData.faixa_faturamento === fat
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800',
                  )}
                >
                  <span>{fat}</span>
                  {formData.faixa_faturamento === fat && (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 4: EM QUAL ÁREA VOCÊ MAIS PRECISA AVANÇAR? (Max 3)
// -------------------------------------------------------------
export const Step4: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Clareza sobre o negócio e o próximo passo',
    'Estruturação do modelo de negócio',
    'Organização financeira',
    'Separação das finanças pessoais e empresariais',
    'Fluxo de caixa e controle financeiro',
    'Precificação e margem de contribuição',
    'Processos e organização interna',
    'Definição de funções e responsabilidades',
    'Gestão da equipe',
    'Desenvolvimento de líderes',
    'Comunicação e liderança',
    'Planejamento estratégico',
    'Metas e indicadores',
    'Vendas',
    'Posicionamento',
    'Construção de produto ou serviço',
    'Transformar conhecimento em uma oferta vendável',
    'Criar um método próprio',
    'Aumentar faturamento',
    'Gerar novas fontes de receita',
    'Ter mais previsibilidade',
    'Networking e conexões empresariais',
    'Sair do operacional',
    'Ter mais tempo e autonomia',
    'Outro',
  ]

  const toggleOption = (item: string) => {
    const current = formData.areas_avancar || []
    if (current.includes(item)) {
      updateFormData({ areas_avancar: current.filter((x) => x !== item) })
    } else {
      if (current.length < 3) {
        updateFormData({ areas_avancar: [...current, item] })
      }
    }
  }

  const selectedCount = formData.areas_avancar?.length || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-400">Selecione até 3 opções</span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full font-medium',
            selectedCount === 3
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : selectedCount > 0
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {selectedCount} de 3 selecionadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
        {options.map((opt) => {
          const isSelected = formData.areas_avancar?.includes(opt) || false
          const isDisabled = !isSelected && selectedCount >= 3
          return (
            <CheckboxOption
              key={opt}
              label={opt}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => toggleOption(opt)}
            />
          )
        })}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 5: QUAL É A SUA PRINCIPAL DOR HOJE?
// -------------------------------------------------------------
export const Step5: React.FC<StepProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Seja o mais específico(a) possível. Isso nos ajuda a entender a urgência e o tamanho do
        gargalo.
      </p>
      <Textarea
        placeholder="Descreva aqui o principal obstáculo ou dor que você gostaria de ver superado nos próximos 3 meses..."
        rows={6}
        value={formData.dor_principal}
        onChange={(e) => updateFormData({ dor_principal: e.target.value })}
        className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 resize-none text-sm leading-relaxed p-4 rounded-xl"
      />
      <div className="text-right text-[11px] text-slate-500">
        {formData.dor_principal.length} caracteres
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 6: O QUE MAIS SE PARECE COM A SUA REALIDADE?
// -------------------------------------------------------------
export const Step6: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Tenho conhecimento, mas não consigo transformar isso em uma oferta clara',
    'Tenho muitas ideias, mas não sei qual caminho priorizar',
    'Meu negócio funciona, mas depende demais de mim',
    'Trabalho muito, mas não tenho clareza dos números',
    'Tenho faturamento, mas não sei exatamente quanto sobra',
    'Minha empresa cresceu sem estrutura',
    'Tenho dificuldade para organizar processos',
    'Minha equipe depende de mim para praticamente tudo',
    'Tenho líderes, mas eles ainda não estão preparados para liderar',
    'Quero crescer, mas não sei qual é o próximo movimento',
    'Meu faturamento estagnou',
    'Quero criar novas fontes de receita',
    'Preciso me posicionar melhor para vender mais',
    'Quero estar próximo de empresários que também estão crescendo',
    'Tenho estrutura, mas quero acelerar meus resultados',
  ]

  return (
    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.realidade === opt}
          onClick={() => updateFormData({ realidade: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 7: COMO ESTÁ A GESTÃO DO SEU NEGÓCIO HOJE? (Sliders 0 a 10)
// -------------------------------------------------------------
export const Step7: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const areas: Array<{
    key: keyof FormStepData['notas_gestao']
    label: string
    description: string
  }> = [
    {
      key: 'clareza_estrategica',
      label: 'Clareza estratégica',
      description: 'Visão do futuro e prioridades definidas',
    },
    {
      key: 'gestao_financeira',
      label: 'Gestão financeira',
      description: 'Controle de custos, margem e fluxo de caixa',
    },
    {
      key: 'processos',
      label: 'Processos',
      description: 'Rotinas mapeadas, padronizadas e eficientes',
    },
    { key: 'vendas', label: 'Vendas', description: 'Canal de atração e conversão contínuo' },
    {
      key: 'gestao_pessoas',
      label: 'Gestão de pessoas',
      description: 'Alinhamento, engajamento e retenção',
    },
    { key: 'lideranca', label: 'Liderança', description: 'Capacidade de delegar e formar time' },
    {
      key: 'planejamento_metas',
      label: 'Planejamento e metas',
      description: 'Metas claras e planos de ação seguidos',
    },
    {
      key: 'indicadores_resultados',
      label: 'Indicadores e acompanhamento',
      description: 'Métricas e acompanhamento periódico',
    },
    {
      key: 'posicionamento_comunicacao',
      label: 'Posicionamento e comunicação',
      description: 'Reconhecimento e atração do público ideal',
    },
    {
      key: 'capacidade_crescer_sem_depender',
      label: 'Capacidade de crescer sem depender de você',
      description: 'Autonomia da empresa no dia a dia',
    },
  ]

  const handleSliderChange = (key: keyof FormStepData['notas_gestao'], value: number) => {
    updateFormData({
      notas_gestao: {
        ...formData.notas_gestao,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
      <p className="text-xs text-slate-400">
        Dê uma nota sincera de 0 (muito fraco / inexistente) a 10 (excelente / estruturado):
      </p>

      {areas.map((area) => {
        const val = formData.notas_gestao?.[area.key] ?? 5
        return (
          <div
            key={area.key}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{area.label}</h4>
                <p className="text-[11px] text-slate-400">{area.description}</p>
              </div>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0',
                  val >= 8
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : val >= 5
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
                )}
              >
                {val}
              </div>
            </div>

            <div className="pt-1">
              <Slider
                value={[val]}
                min={0}
                max={10}
                step={1}
                onValueChange={([newVal]) => handleSliderChange(area.key, newVal)}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 px-0.5">
                <span>0 (Crítico)</span>
                <span>5 (Médio)</span>
                <span>10 (Excelente)</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 8: SOBRE LIDERANÇA
// -------------------------------------------------------------
export const Step8: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const lideraOptions = [
    'Sim, sou empresário(a) e lidero minha equipe',
    'Sim, sou gestor(a)/líder dentro de uma empresa',
    'Ainda não, mas estou me preparando para isso',
    'Não',
  ]

  const desafios = [
    'Delegar',
    'Dar feedback',
    'Cobrar resultados',
    'Engajar a equipe',
    'Desenvolver pessoas',
    'Lidar com conflitos',
    'Comunicar com clareza',
    'Organizar e acompanhar metas',
    'Parar de centralizar tudo',
    'Entender melhor o perfil das pessoas',
    'Assumir postura de liderança',
    'Outro',
  ]

  const isLider =
    formData.lidera_pessoas === 'Sim, sou empresário(a) e lidero minha equipe' ||
    formData.lidera_pessoas === 'Sim, sou gestor(a)/líder dentro de uma empresa'

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-slate-200">
          Hoje você lidera pessoas? <span className="text-rose-400">*</span>
        </Label>
        {lideraOptions.map((opt) => (
          <RadioOption
            key={opt}
            label={opt}
            selected={formData.lidera_pessoas === opt}
            onClick={() => updateFormData({ lidera_pessoas: opt })}
          />
        ))}
      </div>

      {isLider && (
        <div className="space-y-3 pt-4 border-t border-slate-800 animate-fade-in">
          <Label className="text-sm font-medium text-slate-200">
            Qual é hoje o seu maior desafio como líder?
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1">
            {desafios.map((desafio) => (
              <RadioOption
                key={desafio}
                label={desafio}
                selected={formData.desafio_lideranca === desafio}
                onClick={() => updateFormData({ desafio_lideranca: desafio })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 9: SOBRE SEU CONHECIMENTO E EXPERIÊNCIA
// -------------------------------------------------------------
export const Step9: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options1 = [
    'Sim, mas ainda não sei como estruturar',
    'Sim, já tenho algo estruturado, mas preciso melhorar',
    'Sim, já vendo e quero escalar',
    'Não tenho certeza',
    'Não',
  ]

  const options2 = ['Sim', 'Talvez', 'Não']

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-slate-200 leading-snug">
          Você possui algum conhecimento, experiência ou metodologia que poderia se transformar em
          um produto, serviço, mentoria, treinamento ou nova fonte de receita?{' '}
          <span className="text-rose-400">*</span>
        </Label>
        {options1.map((opt) => (
          <RadioOption
            key={opt}
            label={opt}
            selected={formData.conhecimento_experiencia === opt}
            onClick={() => updateFormData({ conhecimento_experiencia: opt })}
          />
        ))}
      </div>

      <div className="space-y-2.5 pt-4 border-t border-slate-800">
        <Label className="text-sm font-medium text-slate-200">
          Você gostaria de transformar sua experiência em uma oferta mais clara e comercializável?
        </Label>
        <div className="grid grid-cols-3 gap-2.5">
          {options2.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateFormData({ transformar_oferta: opt })}
              className={cn(
                'p-3 text-center rounded-xl border text-sm font-medium transition-all',
                formData.transformar_oferta === opt
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 10: ONDE VOCÊ QUER CHEGAR?
// -------------------------------------------------------------
export const Step10: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Estruturar meu negócio',
    'Ter controle financeiro',
    'Organizar processos',
    'Desenvolver minha equipe',
    'Me tornar um líder melhor',
    'Aumentar faturamento',
    'Criar novas fontes de receita',
    'Transformar meu conhecimento em produto',
    'Criar ou melhorar minha oferta',
    'Sair do operacional',
    'Ter mais previsibilidade',
    'Crescer com mais segurança',
    'Ampliar meu networking',
    'Construir um negócio que dependa menos de mim',
    'Outro',
  ]

  return (
    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.desejo_transformacao === opt}
          onClick={() => updateFormData({ desejo_transformacao: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 11: SEU OBJETIVO FINANCEIRO
// -------------------------------------------------------------
export const Step11: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Até R$ 10 mil',
    'R$ 10 mil a R$ 30 mil',
    'R$ 30 mil a R$ 50 mil',
    'R$ 50 mil a R$ 100 mil',
    'R$ 100 mil a R$ 300 mil',
    'R$ 300 mil a R$ 500 mil',
    'Acima de R$ 500 mil',
    'Meu objetivo principal não é financeiro neste momento',
  ]

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.objetivo_financeiro === opt}
          onClick={() => updateFormData({ objetivo_financeiro: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 12: O QUE ESTÁ IMPEDINDO VOCÊ DE CHEGAR LÁ?
// -------------------------------------------------------------
export const Step12: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Falta de clareza',
    'Falta de conhecimento',
    'Falta de método',
    'Falta de organização',
    'Falta de tempo',
    'Falta de equipe',
    'Falta de liderança',
    'Falta de estratégia',
    'Falta de vendas',
    'Falta de dinheiro para investir',
    'Excesso de operação',
    'Dificuldade para tomar decisões',
    'Não sei exatamente o que está me travando',
    'Outro',
  ]

  const toggleOption = (item: string) => {
    const current = formData.impedimentos || []
    if (current.includes(item)) {
      updateFormData({ impedimentos: current.filter((x) => x !== item) })
    } else {
      updateFormData({ impedimentos: [...current, item] })
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Pode marcar quantos você identificar:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
        {options.map((opt) => {
          const isSelected = formData.impedimentos?.includes(opt) || false
          return (
            <CheckboxOption
              key={opt}
              label={opt}
              selected={isSelected}
              onClick={() => toggleOption(opt)}
            />
          )
        })}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 13: QUAL TIPO DE APOIO FAZ MAIS SENTIDO PARA VOCÊ?
// -------------------------------------------------------------
export const Step13: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Quero aprender e aplicar com orientação',
    'Quero acompanhamento próximo',
    'Quero alguém analisando meu negócio comigo',
    'Preciso de uma consultoria mais estruturada',
    'Quero desenvolver minha liderança',
    'Quero transformar meu conhecimento em produto e receita',
    'Quero participar de um grupo de empresários e ampliar conexões',
    'Ainda não sei qual solução seria melhor',
  ]

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.tipo_apoio === opt}
          onClick={() => updateFormData({ tipo_apoio: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 14: NÍVEL DE PRIORIDADE
// -------------------------------------------------------------
export const Step14: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Apenas uma ideia para o futuro',
    'Algo que quero resolver nos próximos 6 meses',
    'Uma prioridade para os próximos 90 dias',
    'Uma prioridade imediata',
  ]

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.nivel_prioridade === opt}
          onClick={() => updateFormData({ nivel_prioridade: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 15: INVESTIMENTO
// -------------------------------------------------------------
export const Step15: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const options = [
    'Sim, quero entender as possibilidades',
    'Depende da solução',
    'Ainda estou pesquisando',
    'Não neste momento',
  ]

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <RadioOption
          key={opt}
          label={opt}
          selected={formData.disposicao_investimento === opt}
          onClick={() => updateFormData({ disposicao_investimento: opt })}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------------
// ETAPA 16: ÚLTIMA PERGUNTA
// -------------------------------------------------------------
export const Step16: React.FC<StepProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        O que muda na sua vida, no seu negócio ou na sua carreira quando esse problema for
        resolvido?
      </p>
      <Textarea
        placeholder="Compartilhe o impacto que essa mudança trará..."
        rows={6}
        value={formData.porque_importante}
        onChange={(e) => updateFormData({ porque_importante: e.target.value })}
        className="bg-slate-900/70 border-slate-800 focus:border-indigo-500 text-white placeholder:text-slate-500 resize-none text-sm leading-relaxed p-4 rounded-xl"
      />
      <div className="text-right text-[11px] text-slate-500">
        {formData.porque_importante.length} caracteres
      </div>
    </div>
  )
}
