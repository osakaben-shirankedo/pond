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
  pond: {
    all: () => ['pond'] as const,
    list: () => ['pond', 'list'] as const,
    members: (pondId: string) => ['pond', pondId, 'members'] as const,
    chat: (pondId: string) => ['pond', pondId, 'chat'] as const,
  },
  profile: {
    all: () => ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },
} as const
