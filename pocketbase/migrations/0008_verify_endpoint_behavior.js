migrate(
  (app) => {
    const url = $os.getenv('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'

    const resCorrect = $http.send({
      url: url + '/backend/v1/dashboard-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Diag09161012*' }),
      timeout: 5,
    })

    const resWrong = $http.send({
      url: url + '/backend/v1/dashboard-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'senha_errada_xyz' }),
      timeout: 5,
    })

    if (resCorrect.statusCode !== 200) {
      throw new Error('Falha no teste de senha correta. Status recebido: ' + resCorrect.statusCode)
    }

    if (resWrong.statusCode !== 401) {
      throw new Error('Falha no teste de senha errada. Status recebido: ' + resWrong.statusCode)
    }
  },
  () => {},
)
