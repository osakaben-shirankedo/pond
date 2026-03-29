import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LikeButton } from '@/components/like-button';

const { width } = Dimensions.get('window');

type Post = {
  id: string;
  user: string;
  avatar: string;
  pond: string;
  level: string;
  field: string;
  content: string;
  likes: number;
  time: string;
  liked: boolean;
};

const SEED_POSTS: Post[] = [
  {
    id: '1',
    user: 'かわうそ太郎',
    avatar: 'か',
    pond: 'プログラミング',
    level: '碧の池',
    field: 'programming',
    content: 'TypeScriptのジェネリクス、ようやく理解できた！型推論が気持ちいい。同じ池の人でTSやってる人いたら話しましょ',
    likes: 12,
    time: '3分前',
    liked: false,
  },
  {
    id: '2',
    user: 'めだか花子',
    avatar: 'め',
    pond: '数学',
    level: '澄み池',
    field: 'math',
    content: '二次方程式の解の公式、やっとスラスラ言えるようになった！\nx = (-b ± √(b²-4ac)) / 2a\n同じく苦手な人、一緒に頑張ろう',
    likes: 8,
    time: '15分前',
    liked: false,
  },
  {
    id: '3',
    user: 'フナ次郎',
    avatar: 'ふ',
    pond: '英語',
    level: '深碧池',
    field: 'english',
    content: 'TOEIC 750点突破した！リスニング対策はPodcastを1.5倍速で聴くのが効いた気がする。次は800点目指すぞ',
    likes: 24,
    time: '1時間前',
    liked: true,
  },
  {
    id: '4',
    user: 'コイ子',
    avatar: 'こ',
    pond: 'アート',
    level: '碧の池',
    field: 'art',
    content: '今週のチャレンジ「影の描き方」、初めてちゃんと立体感出せた気がする！光源を意識するだけでこんなに変わるんだね',
    likes: 19,
    time: '2時間前',
    liked: false,
  },
  {
    id: '5',
    user: 'サクラ鯛',
    avatar: 'さ',
    pond: 'プログラミング',
    level: '澄み池',
    field: 'programming',
    content: 'Pythonで初めてスクレイピングした！requestsとBeautifulSoup使ったら思ったより簡単だった。次は自動化に挑戦する',
    likes: 15,
    time: '3時間前',
    liked: false,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  '澄み池': Colors.primaryFixed,
  '碧の池': Colors.primaryFixedDim,
  '深碧池': Colors.primaryContainer,
  '蒼淵': Colors.primary,
};

export default function TimelineScreen() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('pond_user_posts').then((stored) => {
      const userPosts: Post[] = stored ? JSON.parse(stored) : [];
      setPosts([...userPosts, ...SEED_POSTS]);
    });
  }, []));

  const filters = [
    { id: 'all', label: 'すべて' },
    { id: 'programming', label: 'プログラミング' },
    { id: 'math', label: '数学' },
    { id: 'english', label: '英語' },
    { id: 'art', label: 'アート' },
  ];

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

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <BlurView intensity={20} tint="light" style={styles.header}>
        <Ionicons name="water" size={22} color={Colors.primary} />
        <Text style={styles.headerTitle}>Pond</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </BlurView>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setActiveFilter(f.id)}
            style={[styles.chip, activeFilter === f.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((post) => (
          <View key={post.id} style={styles.card}>
            {/* Post header */}
            <View style={styles.postHeader}>
              <LinearGradient
                colors={[Colors.primaryFixed, Colors.surfaceContainerHigh]}
                style={styles.avatarContainer}
              >
                <Text style={styles.avatar}>{post.avatar}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.user}</Text>
                <View style={styles.badges}>
                  <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[post.level] ?? Colors.primaryFixed }]}>
                    <Text style={styles.levelBadgeText}>{post.level}</Text>
                  </View>
                  <Text style={styles.pondBadgeText}>{post.pond}</Text>
                </View>
              </View>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>

            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Actions */}
            <View style={styles.actions}>
              <LikeButton
                liked={post.liked}
                count={post.likes}
                onPress={() => toggleLike(post.id)}
              />
              <TouchableOpacity style={styles.commentBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB - New Post */}
      <TouchableOpacity
        onPress={() => router.push('/new-post')}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryContainer]}
          style={styles.fabGradient}
        >
          <Ionicons name="pencil" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  blob: {
    position: 'absolute',
    borderRadius: Radius.full,
    opacity: 0.35,
  },
  blob1: {
    top: -50,
    left: -40,
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: Colors.primaryFixed,
  },
  blob2: {
    top: 200,
    right: -60,
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: Colors.secondaryFixed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  headerLogo: {
    fontSize: 22,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    fontSize: 18,
  },
  filterRow: {
    flexGrow: 0,
    paddingVertical: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: {
    backgroundColor: Colors.primaryFixed,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  levelBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
  pondBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  postTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.outlineVariant,
  },
  postContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  likeIcon: {
    fontSize: 18,
  },
  likeIconActive: {},
  likeCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  likeCountActive: {
    color: Colors.primary,
  },
  commentBtn: {
    padding: 4,
  },
  commentIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: 100,
    borderRadius: Radius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 22,
  },
});
