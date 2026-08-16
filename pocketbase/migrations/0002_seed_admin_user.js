migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Idempotente: pular se já existir
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'edianedalbosco@gmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('edianedalbosco@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Ediane Dalbosco')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'edianedalbosco@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
