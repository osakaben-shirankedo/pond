import type { LevelKey } from '@/constants/theme';
import { FIELD_LABELS } from '@/models/field';

export const MAX_CHARS = 280;

export type PondEntry = {
  field: string;
  level: LevelKey;
};

export function buildNewPost(content: string, pond: PondEntry) {
  return {
    id: `user-${Date.now()}`,
    user: 'あなた',
    avatar: 'あ',
    pond: FIELD_LABELS[pond.field] ?? pond.field,
    level: pond.level,
    field: pond.field,
    content: content.trim(),
    likes: 0,
    time: 'たった今',
    liked: false,
  };
}
