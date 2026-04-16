import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthToken } from '../useAuthToken'
import { queryKeys } from '../queryKeys'
import {
  fetchTimeline,
  postTimelinePost,
  likePost,
  unlikePost,
  replyToPost,
} from '../endpoints/timeline'

// ─────────────────────────────────────────
// Queries
// ─────────────────────────────────────────

export function useTimelineQuery(categories: string) {
  const { token, isLoaded } = useAuthToken()
  return useQuery({
    queryKey: queryKeys.timeline.list(categories),
    queryFn: () => fetchTimeline(categories, token!),
    enabled: isLoaded && !!token,
    staleTime: 30_000,
  })
}

// ─────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────

export function usePostTimelineMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { ike_id: string; ike_category: string; content: string }) =>
      postTimelinePost(body, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.timeline.all() })
    },
  })
}

export function useLikePostMutation() {
  const { token } = useAuthToken()
  return useMutation({
    mutationFn: (postId: string) => likePost(postId, token!),
  })
}

export function useUnlikePostMutation() {
  const { token } = useAuthToken()
  return useMutation({
    mutationFn: (postId: string) => unlikePost(postId, token!),
  })
}

export function useReplyToPostMutation() {
  const { token } = useAuthToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      replyToPost(postId, content, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.timeline.all() })
    },
  })
}
