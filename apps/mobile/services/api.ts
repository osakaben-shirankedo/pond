import Constants from 'expo-constants'
import { hc } from 'hono/client'
import type { AppType } from 'server'

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

export const client = hc<AppType>(getBaseUrl())

export function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function toResult<T>(resPromise: Promise<Response>): Promise<ApiResult<T>> {
  try {
    const res = await resPromise
    const json = await res.json()
    if (!res.ok) {
      return { data: null, error: (json as { error?: string }).error ?? 'UNKNOWN_ERROR' }
    }
    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'NETWORK_ERROR' }
  }
}
