// Rota pública de autenticação simples para o Dashboard de leads.
// A senha é lida da variável de ambiente DASHBOARD_PASSWORD (gerenciada via set_env).
// Um hook por arquivo — toda a lógica fica inline no callback.
routerAdd('POST', '/api/dashboard-login', (e) => {
  const body = e.requestInfo().body || {}
  const provided = (body.password || '').toString()
  const expected = $os.getenv('DASHBOARD_PASSWORD') || ''

  if (!expected || provided !== expected) {
    return e.json(401, { ok: false, error: 'Senha inválida.' })
  }

  return e.json(200, { ok: true })
})
