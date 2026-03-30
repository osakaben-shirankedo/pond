// EXPO_PUBLIC_API_URL を .env に設定してください
// Android エミュレーター: http://10.0.2.2:8787
// iOS シミュレーター / 実機: http://<PCのIP>:8787
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787'

type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

async function request<T>(
  path: string,
  options: RequestInit,
  token?: string,
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    const json = await res.json()

    if (!res.ok) {
      return { data: null, error: (json as { error?: string }).error ?? 'UNKNOWN_ERROR' }
    }
    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'NETWORK_ERROR' }
  }
}

export const api = {
  get<T>(path: string, token?: string): Promise<ApiResult<T>> {
    return request<T>(path, { method: 'GET' }, token)
  },
  post<T>(path: string, body: unknown, token?: string): Promise<ApiResult<T>> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token)
  },
}
