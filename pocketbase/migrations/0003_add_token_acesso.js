// Adiciona o campo `token_acesso` à coleção `diagnosticos`.
// Esse token protege o acesso à página pública /diagnostico/:id — apenas
// quem possui o token (gerado no momento da criação do registro) consegue
// visualizar o resultado. O dashboard continua acessando os registros
// normalmente, pois a proteção é feita no frontend da página pública.
//
// Registros já existentes recebem um token retroativo para não ficarem
// "trancados" (o dashboard os abre sem token; a página pública passará a
// exigir, e o admin pode copiar o link com token direto do registro).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('diagnosticos')

    if (!col.fields.getByName('token_acesso')) {
      col.fields.add(
        new TextField({
          name: 'token_acesso',
          required: false,
          hidden: true,
        }),
      )
    }

    // Índice para validação rápida do token na página pública
    col.addIndex('idx_diag_token', false, 'token_acesso', '')

    app.save(col)

    // Backfill: gera um token para registros já existentes que ainda não têm.
    const existing = app.findRecordsByFilter('diagnosticos', "token_acesso = ''", '-created', 0, 0)
    for (let i = 0; i < existing.length; i++) {
      const rec = existing[i]
      rec.set('token_acesso', $security.randomString(40))
      app.save(rec)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diagnosticos')
    const field = col.fields.getByName('token_acesso')
    if (field) col.fields.remove(field)
    col.removeIndex('idx_diag_token')
    app.save(col)
  },
)
