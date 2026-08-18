// Gera o `token_acesso` no momento da criação de cada diagnóstico.
// Esse token protege o acesso à página pública /diagnostico/:id — apenas
// quem o possui consegue visualizar o resultado. O dashboard continua
// acessando os registros normalmente (a validação do token é feita no
// frontend da página pública).
//
// Um hook por arquivo — toda a lógica fica inline no callback.
// onRecordCreate é um model hook "antes de salvar": mutar e.record aqui
// persiste o valor e o retorna na resposta da API de criação.
onRecordCreate((e) => {
  const rec = e.record
  const atual = rec.getString('token_acesso')
  if (!atual) {
    rec.set('token_acesso', $security.randomString(40))
  }
  e.next()
}, 'diagnosticos')
