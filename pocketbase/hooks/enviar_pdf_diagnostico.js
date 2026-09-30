// Endpoint público para envio do PDF do diagnóstico por e-mail ao lead
// e uma cópia para a administradora (Ediane Dalbosco).
// Recebe multipart/form-data ou json com: nome, email, whatsapp, solucao, temperatura e pdf.
// Constrói o e-mail com resumo + PDF em anexo e dispara via PocketBase.
// Um hook por arquivo — toda a lógica fica inline no callback.
//
// Observação: o envio depende de SMTP configurado na instância PocketBase.
// Caso o SMTP não esteja configurado, retorna 503 com mensagem clara e registra
// nos logs para diagnóstico fácil pelo time/administrador, sem quebrar o fluxo.
routerAdd('POST', '/backend/v1/enviar-pdf-diagnostico', (e) => {
  const body = e.requestInfo().body || {}
  const nome = (body.nome || '').toString()
  const emailDestino = (body.email || '').toString().trim().toLowerCase()
  const whatsapp = (body.whatsapp || '').toString()
  const solucao = (body.solucao || '').toString()
  const temperatura = (body.temperatura || '').toString()

  if (!emailDestino || emailDestino.indexOf('@') < 0) {
    return e.json(400, { ok: false, error: 'E-mail do lead inválido.' })
  }

  // Verifica configuração de SMTP no PocketBase
  let smtpConfigurado = false
  try {
    const settings = $app.settings()
    if (settings && settings.smtp && settings.smtp.enabled && settings.smtp.host) {
      smtpConfigurado = true
    }
  } catch (_) {
    smtpConfigurado = false
  }

  if (!smtpConfigurado) {
    console.log(
      '[enviar_pdf_diagnostico] [AVISO] Servidor SMTP não está configurado no backend PocketBase ($app.settings().smtp.enabled = false ou host ausente). ' +
        'O e-mail para o lead (' +
        emailDestino +
        ') e cópia para o admin não foram enviados.',
    )
    return e.json(503, {
      ok: false,
      error:
        'Servidor de e-mail (SMTP) não configurado na plataforma. O lead e admin não receberam o e-mail.',
      smtpConfigured: false,
    })
  }

  // Recupera o PDF enviado (campo "pdf") se houver
  let pdfFile = null
  try {
    const uploaded = e.findUploadedFiles('pdf') || []
    if (uploaded.length > 0) pdfFile = uploaded[0]
  } catch (err) {
    pdfFile = null
  }

  // E-mail da administradora: obtém via $os.getenv ou collection app_config ou fallback
  let adminEmail = ($os.getenv('ADMIN_EMAIL') || '').toString().trim().toLowerCase()
  if (!adminEmail) {
    try {
      const configRecord = $app.findFirstRecordByData('app_config', 'chave', 'admin_email')
      if (configRecord) {
        adminEmail = configRecord.getString('valor').trim().toLowerCase()
      }
    } catch (_) {}
  }
  if (!adminEmail) {
    adminEmail = 'edianedalbosco@gmail.com'
  }

  const senderAddress = $app.settings().meta.senderAddress || 'no-reply@edvanced.com.br'
  const senderName = $app.settings().meta.senderName || 'Edvanced'

  // Escapa texto simples para uso seguro dentro de HTML
  const esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // Link público do dashboard
  const siteUrl = ($os.getenv('SITE_URL') || '').toString().replace(/\/+$/, '')
  const dashboardUrl = siteUrl ? siteUrl + '/dashboard' : '/dashboard'

  // ---------- E-mail do lead ----------
  const htmlLead =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a202c;">' +
    '<div style="background:#0A1E4A;padding:24px 28px;border-bottom:4px solid #B69D64;">' +
    '<span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">EDVANCED</span><br/>' +
    '<span style="color:#D4B97A;font-size:11px;font-weight:600;letter-spacing:1px;">HUB DE DESENVOLVIMENTO &amp; SOLUÇÕES EMPRESARIAIS</span>' +
    '</div>' +
    '<div style="padding:28px;background:#ffffff;">' +
    '<h1 style="font-size:18px;color:#0A1E4A;margin:0 0 12px;">Seu Diagnóstico de Fase Empresarial</h1>' +
    '<p style="font-size:14px;line-height:1.6;color:#4A5568;margin:0 0 16px;">Olá, <strong>' +
    esc(nome) +
    '</strong>! Obrigado por concluir seu diagnóstico. Em anexo segue o mini-relatório em PDF com o resumo da sua análise.</p>' +
    '<table style="width:100%;font-size:14px;border-collapse:collapse;margin:0 0 16px;">' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Solução recomendada</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(solucao) +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Temperatura do lead</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(temperatura) +
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

  // ---------- E-mail da administradora ----------
  const htmlAdmin =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1a202c;">' +
    '<div style="background:#0A1E4A;padding:24px 28px;border-bottom:4px solid #B69D64;">' +
    '<span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">EDVANCED</span><br/>' +
    '<span style="color:#D4B97A;font-size:11px;font-weight:600;letter-spacing:1px;">NOVO DIAGNÓSTICO RECEBIDO</span>' +
    '</div>' +
    '<div style="padding:28px;background:#ffffff;">' +
    '<h1 style="font-size:18px;color:#0A1E4A;margin:0 0 12px;">Novo Diagnóstico — ' +
    esc(nome) +
    '</h1>' +
    '<p style="font-size:14px;line-height:1.6;color:#4A5568;margin:0 0 16px;">Um novo diagnóstico de fase empresarial foi concluído. Veja abaixo o resumo do lead e o PDF em anexo.</p>' +
    '<table style="width:100%;font-size:14px;border-collapse:collapse;margin:0 0 16px;">' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;width:40%;">Nome</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(nome) +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">WhatsApp</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(whatsapp) +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">E-mail</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(emailDestino) +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Solução recomendada</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(solucao) +
    '</td></tr>' +
    '<tr><td style="padding:8px 0;color:#5A6E85;font-weight:600;">Temperatura do lead</td><td style="padding:8px 0;color:#0A1E4A;font-weight:bold;">' +
    esc(temperatura) +
    '</td></tr>' +
    '</table>' +
    '<p style="font-size:14px;line-height:1.6;color:#4A5568;margin:0 0 16px;">Acesse o dashboard para ver todos os detalhes:<br/>' +
    '<a href="' +
    esc(dashboardUrl) +
    '" style="color:#0A1E4A;font-weight:bold;">' +
    esc(dashboardUrl) +
    '</a></p>' +
    '</div>' +
    '<div style="background:#F8F9FA;padding:16px 28px;text-align:center;font-size:11px;color:#718096;">' +
    'EDVANCED © ' +
    new Date().getFullYear() +
    ' · Soluções Empresariais' +
    '</div>' +
    '</div>'

  const mailClient = $app.newMailClient()

  // ----- Envio para o lead -----
  let leadSent = true
  let leadError = ''
  let leadReader = null
  try {
    const leadMessage = new MailerMessage({
      from: { address: senderAddress, name: senderName },
      to: [{ address: emailDestino }],
      subject: 'Seu Diagnóstico de Fase Empresarial — Edvanced',
      html: htmlLead,
      attachments: {},
    })
    if (pdfFile) {
      leadReader = pdfFile.reader.open()
      leadMessage.attachments[pdfFile.name] = leadReader
    }
    mailClient.send(leadMessage)
  } catch (err) {
    leadSent = false
    leadError = err && err.message ? err.message : String(err)
    console.log(
      '[enviar_pdf_diagnostico] Erro ao enviar PDF para o lead (' +
        emailDestino +
        '): ' +
        leadError,
    )
  } finally {
    if (leadReader) {
      try {
        leadReader.close()
      } catch (_) {}
    }
  }

  // ----- Envio para a administradora (cópia) -----
  let adminSent = true
  let adminError = ''
  let adminReader = null
  if (adminEmail) {
    try {
      const adminMessage = new MailerMessage({
        from: { address: senderAddress, name: senderName },
        to: [{ address: adminEmail }],
        subject: 'Novo Diagnóstico — ' + (nome || 'Lead'),
        html: htmlAdmin,
        attachments: {},
      })
      if (pdfFile) {
        adminReader = pdfFile.reader.open()
        adminMessage.attachments[pdfFile.name] = adminReader
      }
      mailClient.send(adminMessage)
    } catch (err) {
      adminSent = false
      adminError = err && err.message ? err.message : String(err)
      console.log(
        '[enviar_pdf_diagnostico] Erro ao enviar cópia para o admin (' +
          adminEmail +
          '): ' +
          adminError,
      )
    } finally {
      if (adminReader) {
        try {
          adminReader.close()
        } catch (_) {}
      }
    }
  }

  if (leadSent) {
    console.log(
      '[enviar_pdf_diagnostico] E-mail enviado com sucesso para lead ' +
        emailDestino +
        (adminSent ? ' e cópia para ' + adminEmail : ''),
    )
    return e.json(200, { ok: true, adminSent: adminSent })
  }

  return e.json(500, {
    ok: false,
    error: 'Falha no envio de e-mail: ' + leadError,
  })
})
