import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { Colors, Radius } from '@/constants/theme';
import { useChallenges } from '@/controllers/useChallenges';

// 切り出したコンポーネントたち
import { ChallengesHeader } from './components/ChallengesHeader';
import { ChallengesTabs } from './components/ChallengesTabs';
import { ActiveChallengesList } from './components/ActiveChallengesList';
import { ChallengeBanner } from './components/ChallengeBanner';
import { ChallengeCard } from './components/ChallengeCard';
import { ChallengesEmptyState } from './components/ChallengesEmptyState';

const { width } = Dimensions.get('window');

export default function ChallengesScreen() {
  const { challenges, pastChallenges, joinChallenge, leaveChallenge } = useChallenges();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const displayChallenges = tab === 'active' ? challenges : pastChallenges;
  const joiningChallenges = challenges.filter((c) => c.joined && !c.passed);

  return (
    <View style={styles.container}>
      {/* 元のファイルにあった背景装飾 */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ChallengesHeader week={12} />
      
      <ChallengesTabs 
        activeTab={tab} 
        onTabChange={setTab} 
        pastCount={pastChallenges.length} 
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'active' && (
          <>
            <ActiveChallengesList items={joiningChallenges} />
            <ChallengeBanner />
          </>
        )}

        {tab === 'past' && pastChallenges.length === 0 && <ChallengesEmptyState />}

        {displayChallenges.map((ch) => (
          <ChallengeCard 
            key={ch.id} 
            challenge={ch} 
            isPast={tab === 'past'}
            onJoin={() => joinChallenge(ch.id)}
            onLeave={() => leaveChallenge(ch.id)}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 16, gap: 16 },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: { top: -40, left: -40, width: width * 0.5, height: width * 0.5, backgroundColor: Colors.primaryFixed },
  blob2: { bottom: 200, right: -50, width: width * 0.45, height: width * 0.45, backgroundColor: Colors.secondaryFixed },
});