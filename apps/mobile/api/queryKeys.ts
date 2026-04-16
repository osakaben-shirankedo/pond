/**
 * TanStack Query のキャッシュキー一元管理
 * - タプル形式で階層構造を表現
 * - `queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all() })` で
 *   timeline 配下を一括無効化できる
 */
export const queryKeys = {
  timeline: {
    all: () => ['timeline'] as const,
    list: (categories: string) => ['timeline', 'list', categories] as const,
  },
  ike: {
    all: () => ['ike'] as const,
    list: () => ['ike', 'list'] as const,
    members: (ikeId: string) => ['ike', ikeId, 'members'] as const,
    chat: (ikeId: string) => ['ike', ikeId, 'chat'] as const,
  },
  profile: {
    all: () => ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },
} as const
