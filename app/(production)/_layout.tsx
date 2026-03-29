import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { TabBar, TabItem } from '../../src/components/ui/TabBar';
import { House, ListOrdered, User } from 'lucide-react-native';

const tabs: TabItem[] = [
  { key: '/(production)', label: 'ГЛАВНАЯ', icon: House },
  { key: '/(production)/orders', label: 'ОЧЕРЕДЬ', icon: ListOrdered },
  { key: '/(production)/profile', label: 'ПРОФИЛЬ', icon: User },
];

export default function ProductionLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.includes('/orders')) return '/(production)/orders';
    if (pathname.includes('/profile')) return '/(production)/profile';
    return '/(production)';
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
