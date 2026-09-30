// Rota pública de autenticação para o Dashboard de leads.
// A senha é validada prioritariamente via env DASHBOARD_PASSWORD (se disponível via $os.getenv).
// Como redundância e segurança caso o ambiente não injete env vars no runtime do pb_hooks,
// valida também contra o hash SHA-256 armazenado na collection interna `app_config`
// (criada na migration 0012, com acesso superuser/server-side apenas).
// Nenhuma senha em texto puro fica hardcoded neste código.
// Um hook por arquivo — toda a lógica fica inline no callback.
routerAdd('POST', '/backend/v1/dashboard-login', (e) => {
  const body = e.requestInfo().body || {}
  const provided = (body.password || '').toString()

  if (!provided) {
    return e.json(401, { success: false, error: 'Senha não informada' })
  }

  const envPassword = $os.getenv('DASHBOARD_PASSWORD')
  const envAdminEmail = $os.getenv('ADMIN_EMAIL')

  console.log(
    '[dashboard_login] Tentativa de login recebida. DASHBOARD_PASSWORD no env:',
    Boolean(envPassword),
    'ADMIN_EMAIL no env:',
    Boolean(envAdminEmail),
  )

  // 1. Verificação por env var direta (se estiver presente)
  if (envPassword && provided === envPassword) {
    return e.json(200, { success: true })
  }

  // 2. Verificação via hash SHA-256 seguro da collection app_config
  try {
    const configRecord = $app.findFirstRecordByData(
      'app_config',
      'chave',
      'dashboard_password_hash',
    )
    const storedHash = configRecord ? configRecord.getString('valor') : ''

    if (storedHash) {
      const providedHash = $security.sha256(provided)
      if (providedHash === storedHash) {
        return e.json(200, { success: true })
      }
    }
  } catch (err) {
    console.log(
      '[dashboard_login] Erro ao consultar app_config:',
      err && err.message ? err.message : String(err),
    )
  }

  return e.json(401, { success: false, error: 'Credenciais inválidas' })
})
