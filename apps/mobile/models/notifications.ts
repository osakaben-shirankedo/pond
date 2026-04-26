export const NOTIFICATIONS_KEY = 'pond_notifications';
export const POND_UNREAD_KEY = 'pond_unread_ponds';

export type NotificationType = 'like' | 'comment' | 'challenge_join' | 'challenge_pass';

export type Notification = {
  id: string;
  type: NotificationType;
  fromUser: string;
  fromAvatarId: string;
  text: string;
  time: string;
  read: boolean;
};

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'seed-1',
    type: 'like',
    fromUser: 'かわうそ太郎',
    fromAvatarId: 'otter',
    text: 'あなたの投稿にいいねしました',
    time: '5分前',
    read: false,
  },
  {
    id: 'seed-2',
    type: 'comment',
    fromUser: 'めだか花子',
    fromAvatarId: 'fishbowl',
    text: 'あなたの投稿にコメントしました',
    time: '12分前',
    read: false,
  },
  {
    id: 'seed-3',
    type: 'challenge_join',
    fromUser: 'サクラ鯛',
    fromAvatarId: 'seahorse',
    text: 'チャレンジに参加しました',
    time: '1時間前',
    read: true,
  },
];
