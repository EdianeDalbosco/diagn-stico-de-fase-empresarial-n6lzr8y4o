// Notificação automática: sempre que um novo diagnóstico é salvo com sucesso,
// dispara uma notificação server-side com os dados do lead.
// Um hook por arquivo — toda a lógica fica inline no callback.
onRecordAfterCreateSuccess((e) => {
  const r = e.record

  const nome = r.getString('nome')
  const whatsapp = r.getString('whatsapp')
  const email = r.getString('email')
  const temperatura = r.getString('temperatura_lead')
  const solucao = r.getString('solucao_recomendada')
  const fase = r.getString('momento_atual')

  const linha = '============================================='
  console.log(linha)
  console.log('🔔  NOVO LEAD DO DIAGNÓSTICO DE FASE EMPRESARIAL')
  console.log(linha)
  console.log('Nome:                  ' + nome)
  console.log('WhatsApp:              ' + whatsapp)
  console.log('E-mail:                ' + email)
  console.log('Temperatura do lead:   ' + temperatura)
  console.log('Solução recomendada:   ' + solucao)
  console.log('Fase atual:            ' + fase)
  console.log('Enviado em:            ' + r.getCreated().toString())
  console.log(linha)

  e.next()
}, 'diagnosticos')
