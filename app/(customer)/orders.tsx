import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useOrdersStore } from '../../src/store/orders.store';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../src/types';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const { orders, fetchOrders, subscribeToOrders, unsubscribe } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders('customer');
    subscribeToOrders('customer');
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders('customer');
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.foreground.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>МОИ ЗАКАЗЫ</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Orders list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />}
      >
        {orders.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Нет заказов</Text>
          </View>
        )}

        {orders.map((order) => {
          const statusColor = ORDER_STATUS_COLORS[order.status] || colors.foreground.secondary;
          const totalQty = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>{order.order_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
                </View>
              </View>

              {/* Status track */}
              <View style={styles.track}>
                {(['new', 'confirmed', 'sewing', 'ready'] as const).map((step, i) => {
                  const stepOrder = ['new', 'confirmed', 'sewing', 'ready'];
                  const currentIdx = stepOrder.indexOf(order.status);
                  const active = i <= currentIdx && order.status !== 'cancelled';
                  return (
                    <View key={step} style={styles.trackStep}>
                      <View style={[styles.trackDot, active && styles.trackDotActive]} />
                      {i < 3 && <View style={[styles.trackLine, active && i < currentIdx && styles.trackLineActive]} />}
                    </View>
                  );
                })}
              </View>

              {order.order_items && (
                <Text style={styles.orderItems}>
                  {order.order_items.map((i) => `${i.product_title} × ${i.quantity}`).join(', ')}
                </Text>
              )}

              <View style={styles.orderBottom}>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('ru-RU')} · {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.orderAmount}>₸ {order.total_amount.toLocaleString()} · {totalQty} шт.</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: fonts.heading, fontSize: 22, letterSpacing: 2, color: colors.foreground.primary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  emptyWrap: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary },

  orderCard: { padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border.primary },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontFamily: fonts.captionSemiBold, fontSize: 13, letterSpacing: 0.5, color: colors.foreground.primary },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8 },
  statusText: { fontFamily: fonts.captionMedium, fontSize: 9, letterSpacing: 1 },

  // Track
  track: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  trackStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border.primary },
  trackDotActive: { backgroundColor: colors.surface.inverse },
  trackLine: { flex: 1, height: 2, backgroundColor: colors.border.primary },
  trackLineActive: { backgroundColor: colors.surface.inverse },

  orderItems: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary, lineHeight: 18 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontFamily: fonts.caption, fontSize: 10, color: colors.foreground.tertiary },
  orderAmount: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.foreground.primary },
});
