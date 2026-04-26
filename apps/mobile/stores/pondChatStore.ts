import { create } from 'zustand';
import type { ChatMessage } from '@/models/pond-chat';

type PondChatStore = {
  text: string;
  replyingTo: ChatMessage | null;
  editingMsg: ChatMessage | null;
  localChatMsgs: ChatMessage[];
  deletedLocalIds: Set<string>;
  setText: (text: string) => void;
  setReplyingTo: (msg: ChatMessage | null) => void;
  setEditingMsg: (msg: ChatMessage | null) => void;
  setLocalChatMsgs: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addDeletedId: (id: string) => void;
  reset: () => void;
};

export const usePondChatStore = create<PondChatStore>((set) => ({
  text: '',
  replyingTo: null,
  editingMsg: null,
  localChatMsgs: [],
  deletedLocalIds: new Set(),
  setText: (text) => set({ text }),
  setReplyingTo: (replyingTo) => set({ replyingTo }),
  setEditingMsg: (editingMsg) => set({ editingMsg }),
  setLocalChatMsgs: (msgs) =>
    set((s) => ({
      localChatMsgs: typeof msgs === 'function' ? msgs(s.localChatMsgs) : msgs,
    })),
  addDeletedId: (id) =>
    set((s) => ({ deletedLocalIds: new Set([...s.deletedLocalIds, id]) })),
  reset: () =>
    set({ text: '', replyingTo: null, editingMsg: null, localChatMsgs: [], deletedLocalIds: new Set() }),
}));
