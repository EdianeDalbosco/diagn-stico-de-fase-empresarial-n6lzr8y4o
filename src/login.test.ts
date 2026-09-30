import { describe, it, expect } from 'vitest'

describe('Dashboard Login Endpoint Test', () => {
  const backendUrl = 'https://diagnostico-de-fase-empresarial-53ceb.shrd00.internal.goskip.dev'

  it('valida senha correta retornando 200/sucesso', async () => {
    const res = await fetch(`${backendUrl}/backend/v1/dashboard-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Diag09161012*' }),
    })
    const data = (await res.json()) as { success: boolean }
    if (res.status !== 200) {
      throw new Error(
        `Falha no login com senha correta! Status: ${res.status}, body: ${JSON.stringify(data)}`,
      )
    }
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('valida senha incorreta retornando 401', async () => {
    const res = await fetch(`${backendUrl}/backend/v1/dashboard-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'senha_errada_xyz' }),
    })
    const data = (await res.json()) as { success: boolean }
    if (res.status !== 401) {
      throw new Error(
        `Falha no login com senha incorreta! Esperava 401, obteve: ${res.status}, body: ${JSON.stringify(data)}`,
      )
    }
    expect(res.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('teste proposital de falha', () => {
    expect(1 + 1).toBe(3)
  })
})
