import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'pond_token'
const USER_ID_KEY = 'pond_user_id'

export const authStorage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY)
  },
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  },
  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(USER_ID_KEY)
  },
  async setUserId(id: string): Promise<void> {
    await AsyncStorage.setItem(USER_ID_KEY, id)
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY])
  },
}
