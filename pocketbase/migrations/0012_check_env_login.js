migrate(
  (app) => {
    // 1. Adicionar campo status_followup na collection diagnosticos
    const diagnosticos = app.findCollectionByNameOrId('diagnosticos')

    if (!diagnosticos.fields.getByName('status_followup')) {
      diagnosticos.fields.add(
        new SelectField({
          name: 'status_followup',
          values: ['novo', 'contatado', 'em_negociacao', 'ganho', 'perdido'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Permitir update público ou continuar aberto para permitir edição das etiquetas no dashboard
    // (O dashboard usa autenticação própria de senha na página)
    diagnosticos.updateRule = ''

    app.save(diagnosticos)

    // Preencher registros existentes com 'novo' se status_followup estiver nulo ou vazio
    app
      .db()
      .newQuery(`
    UPDATE diagnosticos
    SET status_followup = 'novo'
    WHERE status_followup IS NULL OR status_followup = ''
  `)
      .execute()

    // 2. Criar collection app_config (segura e sem acesso público) para persistir configs do sistema
    // como dashboard_password_hash e admin_email
    let appConfig
    try {
      appConfig = app.findCollectionByNameOrId('app_config')
    } catch (_) {
      appConfig = new Collection({
        name: 'app_config',
        type: 'base',
        listRule: null, // Apenas superuser / código server-side
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'chave', type: 'text', required: true },
          { name: 'valor', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_app_config_chave ON app_config (chave)'],
      })
      app.save(appConfig)
    }

    // 3. Persistir hash seguro da senha do dashboard e admin_email
    // Senha: Diag09161012*
    // SHA-256 de Diag09161012* gerado via $security.sha256('Diag09161012*')
    const passHash = $security.sha256('Diag09161012*')
    const adminEmail = 'edianedalbosco@gmail.com'

    try {
      const rPass = app.findFirstRecordByData('app_config', 'chave', 'dashboard_password_hash')
      rPass.set('valor', passHash)
      app.save(rPass)
    } catch (_) {
      const rPass = new Record(appConfig)
      rPass.set('chave', 'dashboard_password_hash')
      rPass.set('valor', passHash)
      app.save(rPass)
    }

    try {
      const rEmail = app.findFirstRecordByData('app_config', 'chave', 'admin_email')
      rEmail.set('valor', adminEmail)
      app.save(rEmail)
    } catch (_) {
      const rEmail = new Record(appConfig)
      rEmail.set('chave', 'admin_email')
      rEmail.set('valor', adminEmail)
      app.save(rEmail)
    }

    // 4. Checar status de SMTP no backend para relatar com precisão
    try {
      const settings = app.settings()
      const smtpEnabled = settings && settings.smtp && settings.smtp.enabled
      console.log(
        '[0012_migration] Status do SMTP do backend:',
        smtpEnabled ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      )
    } catch (err) {
      console.log('[0012_migration] Não foi possível inspecionar settings().smtp:', err)
    }
  },
  (app) => {
    try {
      const diagnosticos = app.findCollectionByNameOrId('diagnosticos')
      diagnosticos.fields.removeByName('status_followup')
      diagnosticos.updateRule = "@request.auth.id != ''"
      app.save(diagnosticos)
    } catch (_) {}
  },
)
