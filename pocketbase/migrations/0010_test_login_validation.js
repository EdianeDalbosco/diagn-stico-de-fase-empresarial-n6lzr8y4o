migrate(
  (app) => {
    const url = $os.getenv('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    const secretPass = $os.getenv('DASHBOARD_PASSWORD')
    const adminEmail = $os.getenv('ADMIN_EMAIL')

    console.log('[0010_test] Executando validação de login real contra /backend/v1/dashboard-login')
    console.log(
      '[0010_test] DASHBOARD_PASSWORD presente:',
      !!secretPass,
      'ADMIN_EMAIL presente:',
      !!adminEmail,
    )

    // Teste 1: senha correta 'Diag09161012*'
    const resCorrect = $http.send({
      url: url + '/backend/v1/dashboard-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Diag09161012*' }),
      timeout: 10,
    })

    console.log(
      '[0010_test] Teste senha correta: status =',
      resCorrect.statusCode,
      'body =',
      resCorrect.raw,
    )

    if (resCorrect.statusCode !== 200) {
      throw new Error(
        'Falha no login com senha correta. Status: ' +
          resCorrect.statusCode +
          ' Corpo: ' +
          resCorrect.raw,
      )
    }

    const jsonCorrect = resCorrect.json || {}
    if (!jsonCorrect.success) {
      throw new Error(
        'Login com senha correta não retornou success: true. Corpo: ' + resCorrect.raw,
      )
    }

    // Teste 2: senha errada 'senha_errada_123'
    const resWrong = $http.send({
      url: url + '/backend/v1/dashboard-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'senha_errada_123' }),
      timeout: 10,
    })

    console.log(
      '[0010_test] Teste senha errada: status =',
      resWrong.statusCode,
      'body =',
      resWrong.raw,
    )

    if (resWrong.statusCode !== 401) {
      throw new Error(
        'Falha no login com senha errada. Esperava 401, recebeu: ' + resWrong.statusCode,
      )
    }

    console.log(
      '[0010_test] Todos os testes do endpoint /backend/v1/dashboard-login passaram com sucesso!',
    )
  },
  () => {},
)
