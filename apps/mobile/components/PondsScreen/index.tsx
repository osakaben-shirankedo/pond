import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePonds } from '@/controllers/usePonds';
import { PondsHeader } from './components/PondsHeader';
import { EmptyPondsState } from './components/EmptyPondsState';
import { PondCard } from './components/PondCard';
import { ExploreFieldsSection } from './components/ExploreFieldsSection';

const { width } = Dimensions.get('window');

export function PondsScreen() {
  const {
    ponds,
    unreadPondIds,
    LEVEL_ORDER,
    unexploredFields,
    handleAddPond,
    handleReassess,
    handleOpenChat,
    handleExplore,
  } = usePonds();

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <PondsHeader onAddPond={handleAddPond} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ponds.length === 0 ? (
          <EmptyPondsState onAddPond={handleAddPond} />
        ) : (
          <>
            {ponds.map((pond) => (
              <PondCard
                key={pond.pondId}
                pond={pond}
                levelOrder={LEVEL_ORDER}
                unread={unreadPondIds.includes(pond.pondId)}
                onOpen={handleOpenChat}
                onReassess={handleReassess}
              />
            ))}

            <ExploreFieldsSection fieldIds={unexploredFields} onExplore={handleExplore} />
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  blob: { position: 'absolute', borderRadius: Radius.full, opacity: 0.3 },
  blob1: {
    top: -60,
    right: -40,
    width: width * 0.55,
    height: width * 0.55,
    backgroundColor: Colors.primaryFixed,
  },
  blob2: {
    bottom: 100,
    left: -50,
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: Colors.secondaryFixed,
  },
  content: { padding: Spacing.lg, gap: Spacing.md },
  bottomSpacer: { height: 100 },
});
