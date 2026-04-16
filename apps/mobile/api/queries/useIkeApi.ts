import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthToken } from '../useAuthToken'
import { queryKeys } from '../queryKeys'
import {
  fetchIkeList,
  fetchIkeMembers,
  fetchIkeChat,
  sendMessage,
  editMessage,
  replyToMessage,
  deleteMessage,
  joinIke,
  leaveIke,
  applyIke,
  callAiFish,
} from '../endpoints/ike'

// ─────────────────────────────────────────
// Queries
// ─────────────────────────────────────────

export function useIkeListQuery() {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.ike.list(),
    queryFn: () => fetchIkeList(token!),
    enabled: isLoaded && !!token,
    staleTime: 60_000,
  })
}

export function useIkeMembersQuery(ikeId: string, enabled = true) {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.ike.members(ikeId),
    queryFn: () => fetchIkeMembers(ikeId, token!),
    enabled: isLoaded && !!token && !!ikeId && enabled,
    staleTime: 60_000,
  })
}

/** チャットは 5 秒ポーリング */
export function useIkeChatQuery(ikeId: string, enabled = true) {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.ike.chat(ikeId),
    queryFn: () => fetchIkeChat(ikeId, token!),
    enabled: isLoaded && !!token && !!ikeId && enabled,
    refetchInterval: 5_000,
    staleTime: 0,
  })
}

// ─────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────

export function useSendMessageMutation(ikeId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ content, publicRange }: { content: string; publicRange?: string }) =>
      sendMessage(ikeId, content, token!, publicRange),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.chat(ikeId) })
    },
  })
}

export function useEditMessageMutation(ikeId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(ikeId, messageId, content, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.chat(ikeId) })
    },
  })
}

export function useReplyToMessageMutation(ikeId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      replyToMessage(ikeId, messageId, content, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.chat(ikeId) })
    },
  })
}

export function useDeleteMessageMutation(ikeId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(ikeId, messageId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.chat(ikeId) })
    },
  })
}

export function useJoinIkeMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ikeId: string) => joinIke(ikeId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.all() })
    },
  })
}

export function useLeaveIkeMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ikeId: string) => leaveIke(ikeId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.all() })
    },
  })
}

export function useApplyIkeMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { field: string; level: string; purpose: string }) =>
      applyIke(params.field, params.level, params.purpose, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ike.all() })
    },
  })
}

export function useAiFishMutation() {
  return useMutation({
    mutationFn: (params: {
      field: string
      level: string
      recentMessages?: string[]
      memberCount?: number
      userMessageCount?: number
    }) => callAiFish(params),
  })
}
