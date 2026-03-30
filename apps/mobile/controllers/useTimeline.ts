import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { type Post, SEED_POSTS, TIMELINE_FILTERS } from '@/models/timeline';

export function useTimeline() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('pond_user_posts').then((stored) => {
      const userPosts: Post[] = stored ? JSON.parse(stored) : [];
      setPosts([...userPosts, ...SEED_POSTS]);
    });
  }, []));

  const filtered = activeFilter === 'all'
    ? posts
    : posts.filter((p) => p.field === activeFilter);

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleNewPost = () => router.push('/new-post');

  return {
    filters: TIMELINE_FILTERS,
    filtered,
    activeFilter,
    setActiveFilter,
    toggleLike,
    handleNewPost,
  };
}
