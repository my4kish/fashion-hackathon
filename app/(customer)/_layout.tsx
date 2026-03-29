import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { TabBar, TabItem } from '../../src/components/ui/TabBar';
import {
  House,
  Heart,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react-native';

const tabs: TabItem[] = [
  { key: '/(customer)', label: 'ГЛАВНАЯ', icon: House },
  { key: '/(customer)/favorites', label: 'ИЗБРАННОЕ', icon: Heart },
  { key: '/(customer)/catalog', label: 'КАТАЛОГ', icon: ShoppingBag },
  { key: '/(customer)/cart', label: 'КОРЗИНА', icon: ShoppingCart },
  { key: '/(customer)/profile', label: 'ПРОФИЛЬ', icon: User },
];

export default function CustomerLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname.startsWith('/(customer)/catalog') || pathname.startsWith('/catalog')) return '/(customer)/catalog';
    if (pathname.startsWith('/(customer)/favorites') || pathname.startsWith('/favorites')) return '/(customer)/favorites';
    if (pathname.startsWith('/(customer)/cart') || pathname.startsWith('/cart')) return '/(customer)/cart';
    if (pathname.startsWith('/(customer)/profile') || pathname.startsWith('/profile')) return '/(customer)/profile';
    return '/(customer)';
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
