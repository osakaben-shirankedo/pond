import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type TabIconProps = {
  focused: boolean;
  label: string;
  children: React.ReactNode;
};

function TabIcon({ focused, label, children }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={{ opacity: focused ? 1 : 0.4 }}>{children}</View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="タイムライン">
              <Ionicons name="water" size={24} color={focused ? Colors.primary : Colors.onSurfaceVariant} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="ponds"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="マイ池">
              <MaterialCommunityIcons name="fishbowl-outline" size={24} color={focused ? Colors.primary : Colors.onSurfaceVariant} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="チャレンジ">
              <Ionicons name="flash" size={24} color={focused ? Colors.primary : Colors.onSurfaceVariant} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="プロフィール">
              <Ionicons name="person" size={24} color={focused ? Colors.primary : Colors.onSurfaceVariant} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 80 : 64,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
