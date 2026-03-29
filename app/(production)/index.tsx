import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { useOrdersStore } from '../../src/store/orders.store';
import { Order } from '../../src/types';

export default function ProductionDashboard() {
  const { profile } = useAuthStore();
  const { orders, fetchOrders, subscribeToOrders, unsubscribe } = useOrdersStore();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchOrders('production');
    subscribeToOrders('production');
    return () => unsubscribe();
  }, []);

  const queue = orders.filter((o) => o.status === 'confirmed' || o.status === 'sewing');
  const done = orders.filter((o) => o.status === 'ready');
  const recent = [...orders].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);

  const displayed = activeTab === 0 ? recent : done;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>AVISHU</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerCaption}>ПАНЕЛЬ УПРАВЛЕНИЯ</Text>
          <Text style={styles.headerTitle}>ПРОИЗВОДСТВО</Text>
        </View>

        {/* Stats — real data */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{queue.length}</Text>
            <Text style={styles.statLabel}>В РАБОТЕ</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{done.length}</Text>
            <Text style={styles.statLabel}>СШИТО</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab(0)}
          >
            <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>ПОСЛЕДНИЕ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab(1)}
          >
            <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>СШИТО ({done.length})</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {displayed.length === 0 && (
          <Text style={styles.emptyText}>Нет заказов</Text>
        )}

        {displayed.map((order) => {
          const isPreorder = !!order.due_date;
          const isSewing = order.status === 'sewing';
          const totalQty = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;
          const itemsText = order.order_items?.map((i) => i.product_title).join(', ') || '';

          return (
            <View key={order.id} style={styles.queueCard}>
              <View style={styles.queueTop}>
                <Text style={styles.queueId}>{order.order_number}</Text>
                <View style={styles.tagsRow}>
                  {isPreorder && (
                    <View style={styles.tagPreorder}>
                      <Text style={styles.tagPreorderText}>ПРЕДЗАКАЗ</Text>
                    </View>
                  )}
                  <View style={[styles.statusTag, isSewing ? styles.statusSewing : order.status === 'ready' ? styles.statusReady : styles.statusConfirmed]}>
                    <Text style={[styles.statusTagText, isSewing ? styles.statusSewingText : order.status === 'ready' ? styles.statusReadyText : styles.statusConfirmedText]}>
                      {order.status === 'confirmed' ? 'ПОСТУПИЛ' : order.status === 'sewing' ? 'ШЬЁТСЯ' : 'СШИТО'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.queueMid}>
                <Text style={styles.queueTitle}>{itemsText}</Text>
                <Text style={styles.queueMeta}>{totalQty} шт. · ₸{order.total_amount.toLocaleString()}</Text>
              </View>
              {isSewing && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '50%' }]} />
                </View>
              )}
              <View style={styles.queueFoot}>
                <Text style={styles.queueDate}>
                  {new Date(order.created_at).toLocaleDateString('ru-RU')} · {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {order.due_date && (
                  <Text style={styles.queueDeadline}>до {new Date(order.due_date).toLocaleDateString('ru-RU')}</Text>
                )}
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
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.heading, fontSize: 22, letterSpacing: 3, color: colors.foreground.primary },
  header: { gap: 4 },
  headerCaption: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.secondary },
  headerTitle: { fontFamily: fonts.heading, fontSize: 36, letterSpacing: 2, color: colors.foreground.primary },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface.card, padding: 16, gap: 6 },
  statValue: { fontFamily: fonts.heading, fontSize: 32, color: colors.foreground.primary },
  statLabel: { fontFamily: fonts.caption, fontSize: 8, letterSpacing: 1, color: colors.foreground.secondary },

  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.border.strong },
  tabInactive: { borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  tabText: { fontFamily: fonts.caption, fontSize: 11, letterSpacing: 1, color: colors.foreground.tertiary },
  tabTextActive: { fontFamily: fonts.captionSemiBold, color: colors.foreground.primary },

  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary, textAlign: 'center', paddingTop: 40 },

  queueCard: { padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border.primary },
  queueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  queueId: { fontFamily: fonts.captionSemiBold, fontSize: 13, letterSpacing: 0.5, color: colors.foreground.primary },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tagPreorder: { backgroundColor: colors.surface.inverse, paddingVertical: 3, paddingHorizontal: 8 },
  tagPreorderText: { fontFamily: fonts.captionMedium, fontSize: 8, letterSpacing: 0.5, color: colors.foreground.inverse },
  statusTag: { paddingVertical: 3, paddingHorizontal: 8 },
  statusConfirmed: { borderWidth: 1, borderColor: '#3B82F6' },
  statusConfirmedText: { color: '#3B82F6' },
  statusSewing: { backgroundColor: '#F59E0B20' },
  statusSewingText: { color: '#F59E0B' },
  statusReady: { backgroundColor: '#22C55E20' },
  statusReadyText: { color: '#22C55E' },
  statusTagText: { fontFamily: fonts.captionMedium, fontSize: 8, letterSpacing: 0.5 },

  queueMid: { gap: 4 },
  queueTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground.primary },
  queueMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },

  progressTrack: { height: 4, backgroundColor: colors.surface.card, width: '100%' },
  progressFill: { height: 4, backgroundColor: colors.surface.inverse },

  queueFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  queueDate: { fontFamily: fonts.caption, fontSize: 10, color: colors.foreground.tertiary },
  queueDeadline: { fontFamily: fonts.caption, fontSize: 10, color: '#F59E0B' },
});
