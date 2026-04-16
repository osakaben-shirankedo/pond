/**
 * AsyncStorage のトークン/userId を React state に橋渡しするフック
 * - undefined: ロード中 (enabled: false にすることでクエリ待機できる)
 * - null: 未ログイン
 * - string: ログイン済みトークン
 */
import { useState, useEffect } from 'react'
import { authStorage } from '@/services/auth'

type AuthState = {
  token: string | null | undefined
  userId: string | null | undefined
  isLoaded: boolean
}

export function useAuthToken(): AuthState {
  const [state, setState] = useState<AuthState>({
    token: undefined,
    userId: undefined,
    isLoaded: false,
  })

  useEffect(() => {
    Promise.all([authStorage.getToken(), authStorage.getUserId()]).then(([token, userId]) => {
      setState({ token, userId, isLoaded: true })
    })
  }, [])

  return state
}
