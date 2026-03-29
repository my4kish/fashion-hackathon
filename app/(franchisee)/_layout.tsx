import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { TabBar, TabItem } from '../../src/components/ui/TabBar';
import { House, Package, BarChart3, User } from 'lucide-react-native';

const tabs: TabItem[] = [
  { key: '/(franchisee)', label: 'ГЛАВНАЯ', icon: House },
  { key: '/(franchisee)/orders', label: 'ЗАКАЗЫ', icon: Package },
  { key: '/(franchisee)/analytics', label: 'АНАЛИТИКА', icon: BarChart3 },
  { key: '/(franchisee)/profile', label: 'ПРОФИЛЬ', icon: User },
];

export default function FranchiseeLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.includes('/orders')) return '/(franchisee)/orders';
    if (pathname.includes('/analytics')) return '/(franchisee)/analytics';
    if (pathname.includes('/profile')) return '/(franchisee)/profile';
    return '/(franchisee)';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <TabBar
        tabs={tabs}
        activeKey={getActiveKey()}
        onTabPress={(key) => router.push(key as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
