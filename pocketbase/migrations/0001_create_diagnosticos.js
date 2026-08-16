migrate(
  (app) => {
    const collection = new Collection({
      name: 'diagnosticos',
      type: 'base',
      listRule: '', // público ou admin para visualização
      viewRule: '',
      createRule: '', // público para leads do Instagram enviarem o formulário
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'whatsapp', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'instagram', type: 'text' },
        { name: 'cidade_estado', type: 'text' },

        // Etapa 2
        { name: 'momento_atual', type: 'text' },

        // Etapa 3
        { name: 'tem_negocio', type: 'text' },
        { name: 'nome_empresa', type: 'text' },
        { name: 'segmento', type: 'text' },
        { name: 'tempo_empresa', type: 'text' },
        { name: 'tamanho_equipe', type: 'text' },
        { name: 'faixa_faturamento', type: 'text' },

        // Etapa 4
        { name: 'areas_avancar', type: 'json' },

        // Etapa 5
        { name: 'dor_principal', type: 'text' },

        // Etapa 6
        { name: 'realidade', type: 'text' },

        // Etapa 7
        { name: 'notas_gestao', type: 'json' },

        // Etapa 8
        { name: 'lidera_pessoas', type: 'text' },
        { name: 'desafio_lideranca', type: 'text' },

        // Etapa 9
        { name: 'conhecimento_experiencia', type: 'text' },
        { name: 'transformar_oferta', type: 'text' },

        // Etapa 10
        { name: 'desejo_transformacao', type: 'text' },

        // Etapa 11
        { name: 'objetivo_financeiro', type: 'text' },

        // Etapa 12
        { name: 'impedimentos', type: 'json' },

        // Etapa 13
        { name: 'tipo_apoio', type: 'text' },

        // Etapa 14
        { name: 'nivel_prioridade', type: 'text' },

        // Etapa 15
        { name: 'disposicao_investimento', type: 'text' },

        // Etapa 16
        { name: 'porque_importante', type: 'text' },

        // Campos calculados para CRM
        { name: 'solucao_recomendada', type: 'text' },
        { name: 'temperatura_lead', type: 'text' },

        // Autodate
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_diag_email ON diagnosticos (email)',
        'CREATE INDEX idx_diag_created ON diagnosticos (created DESC)',
        'CREATE INDEX idx_diag_temperatura ON diagnosticos (temperatura_lead)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('diagnosticos')
    app.delete(collection)
  },
)
