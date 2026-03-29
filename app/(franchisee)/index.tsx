import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { useOrdersStore } from '../../src/store/orders.store';
import { supabase } from '../../src/services/supabase';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../src/types';

interface BizStats {
  total_revenue: number;
  total_orders: number;
  completed_orders: number;
  active_orders: number;
}

function formatRevenue(n: number) {
  if (n >= 1000000) return `₸${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₸${(n / 1000).toFixed(0)}K`;
  return `₸${n}`;
}

export default function FranchiseeDashboard() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { orders, fetchOrders, subscribeToOrders, unsubscribe } = useOrdersStore();
  const [stats, setStats] = useState<BizStats | null>(null);

  useEffect(() => {
    fetchOrders('franchisee');
    subscribeToOrders('franchisee');

    if (profile?.id) {
      supabase.rpc('get_franchisee_stats', { franchisee_uuid: profile.id }).then(({ data }) => {
        if (data) setStats(data as BizStats);
      });
    }

    return () => unsubscribe();
  }, [profile?.id]);

  const recentOrders = orders.slice(0, 3);
  const completionRate = stats && stats.total_orders > 0
    ? Math.round((stats.completed_orders / stats.total_orders) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>AVISHU</Text>
          <TouchableOpacity>
            <Bell size={22} color={colors.foreground.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerCaption}>ПАНЕЛЬ УПРАВЛЕНИЯ</Text>
          <Text style={styles.headerTitle}>ФРАНШИЗА</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats ? formatRevenue(stats.total_revenue) : '—'}</Text>
              <Text style={styles.statLabel}>ВЫРУЧКА</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.total_orders ?? '—'}</Text>
              <Text style={styles.statLabel}>ЗАКАЗОВ</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.active_orders ?? '—'}</Text>
              <Text style={styles.statLabel}>В РАБОТЕ</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>ВЫПОЛНЕНО</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.ordersSectionTitle}>ПОСЛЕДНИЕ ЗАКАЗЫ</Text>
            <TouchableOpacity onPress={() => router.push('/(franchisee)/orders')}>
              <Text style={styles.ordersAll}>ВСЕ →</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length === 0 && (
            <Text style={styles.emptyText}>Нет заказов</Text>
          )}
          {recentOrders.map((order) => {
            const customer = order.customer as any;
            const statusColor = ORDER_STATUS_COLORS[order.status] || colors.foreground.secondary;
            return (
              <View key={order.id} style={styles.orderRow}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderRowId}>{order.order_number}</Text>
                  <Text style={styles.orderRowClient}>
                    {customer?.full_name || 'Клиент'} · {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderRowAmount}>₸ {order.total_amount.toLocaleString()}</Text>
                  <Text style={[styles.orderRowStatus, { color: statusColor }]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.heading, fontSize: 22, letterSpacing: 3, color: colors.foreground.primary },
  header: { gap: 4 },
  headerCaption: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.secondary },
  headerTitle: { fontFamily: fonts.heading, fontSize: 36, letterSpacing: 2, color: colors.foreground.primary },
  statsGrid: { gap: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface.card, padding: 16, gap: 6 },
  statValue: { fontFamily: fonts.heading, fontSize: 32, color: colors.foreground.primary },
  statLabel: { fontFamily: fonts.caption, fontSize: 8, letterSpacing: 1, color: colors.foreground.secondary },
  ordersSection: { gap: 16 },
  ordersSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ordersSectionTitle: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.tertiary },
  ordersAll: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  orderLeft: { gap: 4, flex: 1 },
  orderRowId: { fontFamily: fonts.captionMedium, fontSize: 12, color: colors.foreground.primary },
  orderRowClient: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderRowAmount: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.primary },
  orderRowStatus: { fontFamily: fonts.caption, fontSize: 9, letterSpacing: 1 },
});
