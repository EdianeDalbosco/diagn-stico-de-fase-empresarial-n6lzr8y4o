migrate(
  (app) => {
    const url = $os.getenv('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    const expectedPass = $os.getenv('DASHBOARD_PASSWORD') || ''

    console.log('[TEST] Iniciando teste de endpoints de dashboard-login...')
    console.log('[TEST] URL base:', url)
    console.log('[TEST] DASHBOARD_PASSWORD presente:', !!expectedPass)

    // 1. Teste com /backend/v1/dashboard-login
    try {
      const resCorrect = $http.send({
        url: url + '/backend/v1/dashboard-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: expectedPass }),
      })
      console.log(
        '[TEST] POST /backend/v1/dashboard-login (senha correta) -> status:',
        resCorrect.statusCode,
        'body:',
        resCorrect.raw,
      )
    } catch (err) {
      console.log('[TEST] POST /backend/v1/dashboard-login (senha correta) ERRO:', err)
    }

    try {
      const resWrong = $http.send({
        url: url + '/backend/v1/dashboard-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'senha_incorreta_xyz' }),
      })
      console.log(
        '[TEST] POST /backend/v1/dashboard-login (senha errada) -> status:',
        resWrong.statusCode,
        'body:',
        resWrong.raw,
      )
    } catch (err) {
      console.log('[TEST] POST /backend/v1/dashboard-login (senha errada) ERRO:', err)
    }

    // 2. Teste também com /api/dashboard-login
    try {
      const resApi = $http.send({
        url: url + '/api/dashboard-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: expectedPass }),
      })
      console.log(
        '[TEST] POST /api/dashboard-login -> status:',
        resApi.statusCode,
        'body:',
        resApi.raw,
      )
    } catch (err) {
      console.log('[TEST] POST /api/dashboard-login ERRO:', err)
    }
  },
  () => {},
)
