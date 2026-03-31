import Constants from 'expo-constants'

// 開発時: MetroのホストIPを使って自動でサーバーURLを解決する
// - iOS シミュレーター → localhost
// - Android エミュレーター → 10.0.2.2 (Metroが自動で解決)
// - 実機 → PCのLAN IP (MetroのhostUriから取得)
// 本番時: EXPO_PUBLIC_API_URL を使用
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri
    const host = hostUri ? hostUri.split(':')[0] : 'localhost'
    return `http://${host}:8787`
  }
  return 'http://localhost:8787'
}

const BASE_URL = getBaseUrl()

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
