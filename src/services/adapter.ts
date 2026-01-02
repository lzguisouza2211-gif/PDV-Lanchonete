// Adapter para centralizar chamadas de API e transformar respostas.
// Substituir por implementações que usam `supabaseClient`.

export async function fetchAdapter<T>(fn: () => Promise<any>): Promise<T> {
  try {
    const res = await fn()
    return res as T
  } catch (err) {
    throw err
  }
}
