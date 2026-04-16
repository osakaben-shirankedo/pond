import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthToken } from '../useAuthToken'
import { queryKeys } from '../queryKeys'
import { fetchProfile, editProfile } from '../endpoints/profile'

// ─────────────────────────────────────────
// Queries
// ─────────────────────────────────────────

export function useProfileQuery() {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => fetchProfile(token!),
    enabled: isLoaded && !!token,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      // プロフィール未作成時は再試行しない
      if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') return false
      return failureCount < 2
    },
  })
}

// ─────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────

export function useEditProfileMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; bio?: string; avatar?: string }) =>
      editProfile(body, token!),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.profile.me(), updated)
    },
  })
}
