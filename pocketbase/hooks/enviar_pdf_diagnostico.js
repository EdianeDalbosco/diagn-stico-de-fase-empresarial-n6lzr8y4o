// Endpoint público para envio do PDF do diagnóstico por e-mail ao lead.
// Recebe multipart/form-data com: nome, email, solucao, temperatura e pdf.
// Constrói o e-mail com resumo + PDF em anexo e dispara via PocketBase.
// Um hook por arquivo — toda a lógica fica inline no callback.
//
// Observação: o envio depende do SMTP configurado na instância PocketBase
// (Admin > Settings > Mail). Se não estiver configurado, retorna 503 e o
// frontend exibe um aviso — sem bloquear o fluxo de sucesso do diagnóstico.
routerAdd('POST', '/api/enviar-pdf-diagnostico', (e) => {
  const body = e.requestInfo().body || {}
  const nome = (body.nome || '').toString()
  const emailDestino = (body.email || '').toString().trim().toLowerCase()
  const solucao = (body.solucao || '').toString()
  const temperatura = (body.temperatura || '').toString()

  if (!emailDestino || emailDestino.indexOf('@') < 0) {
    return e.json(400, { ok: false, error: 'E-mail do lead inválido.' })
  }

  // Recupera o PDF enviado (campo "pdf")
  let pdfFile = null
  try {
    const uploaded = e.findUploadedFiles('pdf') || []
    if (uploaded.length > 0) pdfFile = uploaded[0]
  } catch (err) {
    pdfFile = null
  }

  const senderAddress = $app.settings().meta.senderAddress || 'no-reply@edvanced.com.br'
  const senderName = $app.settings().meta.senderName || 'Edvanced'

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a202c;">' +
    '<div style="background:#0A1E4A;padding:24px 28px;border-bottom:4px solid #B69D64;">' +
    '<span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">EDVANCED</span><br/>' +
    '<span style="color:#D4B97A;font-size:11px;font-weight:600;letter-spacing:1px;">HUB DE DESENVOLVIMENTO &amp; SOLUÇÕES EMPRESARIAIS</span>' +
    '</div>' +
    '<div style="padding:28px;background:#ffffff;">' +
    '<h1 style="font-size:18px;color:#0A1E4A;margin:0 0 12px;">Seu Diagnóstico de Fase Empresarial</h1>' +
    '<p style="font-size:14px;line-height:1.6;color:#4A5568;margin:0 0 16px;">Olá, <strong>' +
    nome.replace(/</g, '&lt;') +
    '</strong>! Obrigado por concluir seu diagnóstico. Em anexo segue o mini-relatório em PDF com o resumo da sua análise.</p>' +
    '<table style="width:100%;font-size:14px;border-collapse:collapse;margin:0 0 16px;">' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Solução recomendada</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    solucao.replace(/</g, '&lt;') +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Temperatura do lead</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    temperatura.replace(/</g, '&lt;') +
    '</td></tr>' +
    '</table>' +
    '<p style="font-size:13px;line-height:1.6;color:#5A6E85;margin:0 0 8px;">Clareza para decidir. Estrutura para crescer. Direção para gerar novos resultados.</p>' +
    '</div>' +
    '<div style="background:#F8F9FA;padding:16px 28px;text-align:center;font-size:11px;color:#718096;">' +
    'EDVANCED © ' +
    new Date().getFullYear() +
    ' · Soluções Empresariais' +
    '</div>' +
    '</div>'

  const message = new MailerMessage({
    from: { address: senderAddress, name: senderName },
    to: [{ address: emailDestino }],
    subject: 'Seu Diagnóstico de Fase Empresarial — Edvanced',
    html: html,
    // attachments é um map nome -> io.Reader; inicializar vazio
    attachments: {},
  })

  let reader = null
  try {
    if (pdfFile) {
      reader = pdfFile.reader.open()
      message.attachments[pdfFile.name] = reader
    }
    $app.newMailClient().send(message)
    return e.json(200, { ok: true })
  } catch (err) {
    console.log('Erro ao enviar PDF por e-mail: ' + (err && err.message ? err.message : err))
    return e.json(503, {
      ok: false,
      error: 'Não foi possível enviar o e-mail neste momento. O SMTP pode não estar configurado.',
    })
  } finally {
    if (reader) {
      try {
        reader.close()
      } catch (_) {}
    }
  }
})
