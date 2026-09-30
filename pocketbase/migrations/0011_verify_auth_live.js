migrate(
  (app) => {
    const url = $os.getenv('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
    const res = $http.send({
      url: url + '/backend/v1/check-auth-live',
      method: 'GET',
      timeout: 5,
    })

    console.log('[0011_check] Resultado da verificação:', res.raw)
    const data = res.json || {}
    if (data.test_correct && data.test_correct.status !== 200) {
      throw new Error('Falha no teste: senha correta não retornou 200: ' + res.raw)
    }
    if (data.test_wrong && data.test_wrong.status !== 401) {
      throw new Error('Falha no teste: senha errada não retornou 401: ' + res.raw)
    }
  },
  () => {},
)
