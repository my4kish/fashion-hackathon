import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../../constants/tokens';
import type { LucideIcon } from 'lucide-react-native';

export interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Icon
                size={18}
                color={isActive ? colors.foreground.primary : colors.foreground.inverse}
                strokeWidth={2}
              />
              <Text
                style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    paddingTop: 12,
    paddingHorizontal: 21,
    paddingBottom: 21,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.surface.inverse,
    borderRadius: 36,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 26,
  },
  tabActive: {
    backgroundColor: colors.surface.primary,
  },
  tabLabel: {
    fontFamily: fonts.captionMedium,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.foreground.primary,
  },
  tabLabelInactive: {
    color: colors.foreground.inverse,
  },
});
