import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthToken } from '../useAuthToken'
import { queryKeys } from '../queryKeys'
import {
  fetchPondList,
  fetchPondMembers,
  fetchPondChat,
  sendMessage,
  editMessage,
  replyToMessage,
  deleteMessage,
  joinPond,
  leavePond,
  applyPond,
  callAiFish,
} from '../endpoints/pond'

// ─────────────────────────────────────────
// Queries
// ─────────────────────────────────────────

export function usePondListQuery() {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.pond.list(),
    queryFn: () => fetchPondList(token!),
    enabled: isLoaded && !!token,
    staleTime: 60_000,
  })
}

export function usePondMembersQuery(pondId: string, enabled = true) {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.pond.members(pondId),
    queryFn: () => fetchPondMembers(pondId, token!),
    enabled: isLoaded && !!token && !!pondId && enabled,
    staleTime: 60_000,
  })
}

/** チャットは 5 秒ポーリング */
export function usePondChatQuery(pondId: string, enabled = true) {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.pond.chat(pondId),
    queryFn: () => fetchPondChat(pondId, token!),
    enabled: isLoaded && !!token && !!pondId && enabled,
    refetchInterval: 5_000,
    staleTime: 0,
  })
}

// ─────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────

export function useSendMessageMutation(pondId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ content, publicRange }: { content: string; publicRange?: string }) =>
      sendMessage(pondId, content, token!, publicRange),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.chat(pondId) })
    },
  })
}

export function useEditMessageMutation(pondId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(pondId, messageId, content, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.chat(pondId) })
    },
  })
}

export function useReplyToMessageMutation(pondId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      replyToMessage(pondId, messageId, content, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.chat(pondId) })
    },
  })
}

export function useDeleteMessageMutation(pondId: string) {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(pondId, messageId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.chat(pondId) })
    },
  })
}

export function useJoinPondMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pondId: string) => joinPond(pondId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.all() })
    },
  })
}

export function useLeavePondMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pondId: string) => leavePond(pondId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.all() })
    },
  })
}

export function useApplyPondMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { field: string; level: string; purpose: string }) =>
      applyPond(params.field, params.level, params.purpose, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pond.all() })
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
