// Corretivo da migration 0003: o campo `token_acesso` foi criado com
// `hidden: true`, o que o omite das respostas da API. O frontend precisa
// receber o token no momento da criação do diagnóstico para montar a URL
// de resultado protegida (/diagnostico/:id?token=...). Ajustamos para não
// oculto, sem tocar nos dados já existentes (apenas mutamos a propriedade
// do campo — não removemos/recriamos, o que apagaria os tokens retroativos).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('diagnosticos')
    const f = col.fields.getByName('token_acesso')
    if (f) {
      f.hidden = false
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diagnosticos')
    const f = col.fields.getByName('token_acesso')
    if (f) {
      f.hidden = true
    }
    app.save(col)
  },
)
