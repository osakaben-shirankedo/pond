import { create } from 'zustand';
import type { Post } from '@/models/timeline';

type TimelineStore = {
  localPosts: Post[];
  activeFilter: string;
  commentPostId: string | null;
  menuPostId: string | null;
  editingPost: Post | null;
  setLocalPosts: (posts: Post[] | ((prev: Post[]) => Post[])) => void;
  setActiveFilter: (filter: string) => void;
  setCommentPostId: (id: string | null) => void;
  setMenuPostId: (id: string | null) => void;
  setEditingPost: (post: Post | null) => void;
};

export const useTimelineStore = create<TimelineStore>((set) => ({
  localPosts: [],
  activeFilter: 'all',
  commentPostId: null,
  menuPostId: null,
  editingPost: null,
  setLocalPosts: (posts) =>
    set((s) => ({ localPosts: typeof posts === 'function' ? posts(s.localPosts) : posts })),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setCommentPostId: (commentPostId) => set({ commentPostId }),
  setMenuPostId: (menuPostId) => set({ menuPostId }),
  setEditingPost: (editingPost) => set({ editingPost }),
}));
