import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, Check } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useOrdersStore } from '../../src/store/orders.store';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../../src/types';

const tabs = [
  { label: 'ВСЕ', filter: null },
  { label: 'НОВЫЕ', filter: 'new' as OrderStatus },
  { label: 'ОТМЕНЕННЫЕ', filter: 'cancelled' as OrderStatus },
  { label: 'ОФОРМЛЕН', filter: 'confirmed' as OrderStatus },
  { label: 'ПОШИВ', filter: 'sewing' as OrderStatus },
  { label: 'ГОТОВ', filter: 'ready' as OrderStatus },
];

function getStatusBadgeStyle(status: OrderStatus) {
  if (status === 'new' || status === 'sewing') return { backgroundColor: '#000000' };
  if (status === 'confirmed') return { borderWidth: 1, borderColor: '#000000' };
  return { borderWidth: 1, borderColor: '#999999' };
}

function getStatusTextStyle(status: OrderStatus) {
  if (status === 'new' || status === 'sewing') return { color: '#FFFFFF' };
  if (status === 'confirmed') return { color: '#000000' };
  return { color: '#666666' };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

export default function FranchiseeOrdersScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const { orders, fetchOrders, subscribeToOrders, unsubscribe, batchUpdateStatus, updateOrderStatus } = useOrdersStore();

  useEffect(() => {
    fetchOrders('franchisee');
    subscribeToOrders('franchisee');
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders('franchisee');
    setRefreshing(false);
  }, []);

  const currentFilter = tabs[activeTab].filter;
  const filtered = currentFilter
    ? orders.filter((o) => o.status === currentFilter)
    : orders;

  const isNewTab = currentFilter === 'new';

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAcceptOrders = async () => {
    if (selected.size === 0) { Alert.alert('', 'Выберите заказы'); return; }
    await batchUpdateStatus(Array.from(selected), 'confirmed');
    setSelected(new Set());
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert('Отменить заказ?', 'Это действие нельзя отменить', [
      { text: 'Нет', style: 'cancel' },
      { text: 'Да, отменить', style: 'destructive', onPress: () => updateOrderStatus(orderId, 'cancelled') },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <View style={styles.topBar}>
          <Text style={styles.title}>ЗАКАЗЫ</Text>
        </View>

        <View style={styles.searchBar}>
          <Search size={16} color={colors.foreground.tertiary} />
          <Text style={styles.searchText}>Поиск по заказам...</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabRow}>
            {tabs.map((tab, i) => {
              const count = tab.filter ? orders.filter((o) => o.status === tab.filter).length : orders.length;
              return (
                <TouchableOpacity
                  key={tab.label}
                  onPress={() => { setActiveTab(i); setSelected(new Set()); }}
                  style={[styles.tab, activeTab === i ? styles.tabActive : styles.tabInactive]}
                >
                  <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                    {tab.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Select All for НОВЫЕ */}
        {isNewTab && filtered.length > 0 && (
          <View style={styles.selRow}>
            <TouchableOpacity
              style={styles.selLeft}
              onPress={() => {
                if (selected.size === filtered.length) setSelected(new Set());
                else setSelected(new Set(filtered.map((o) => o.id)));
              }}
            >
              <View style={styles.checkbox}>
                {selected.size === filtered.length && <Check size={14} color={colors.foreground.primary} />}
              </View>
              <Text style={styles.selText}>Выбрать все</Text>
            </TouchableOpacity>
            <Text style={styles.selCount}>{selected.size} из {filtered.length} выбрано</Text>
          </View>
        )}

        {/* Order list */}
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />}
        >
          {filtered.length === 0 && <Text style={styles.emptyText}>Нет заказов</Text>}

          {filtered.map((order) => {
            const customer = order.customer as any;
            const customerName = customer?.full_name || 'Клиент';
            const customerEmail = customer?.email || '';
            const isPreorder = !!order.due_date;
            const itemsSummary = order.order_items
              ?.map((i) => `${i.product_title} · ${i.quantity} шт · ₸ ${(i.price_snapshot * i.quantity).toLocaleString()}`)
              .join('\n') || '';

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => isNewTab ? toggleSelection(order.id) : null}
                onLongPress={() => isNewTab ? handleCancelOrder(order.id) : null}
              >
                {/* Row: checkbox + content + status badge */}
                <View style={styles.orderRow}>
                  {isNewTab && (
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelection(order.id)}>
                      {selected.has(order.id) && <Check size={14} color={colors.foreground.primary} />}
                    </TouchableOpacity>
                  )}
                  <View style={styles.orderContent}>
                    {/* ID + type tag */}
                    <View style={styles.idRow}>
                      <Text style={styles.orderId}>{order.order_number}</Text>
                      <View style={[styles.typeTag, isPreorder ? styles.typeTagPreorder : styles.typeTagOrder]}>
                        <Text style={[styles.typeTagText, isPreorder ? styles.typeTagTextPreorder : styles.typeTagTextOrder]}>
                          {isPreorder ? 'ПРЕДЗАКАЗ' : 'ЗАКАЗ'}
                        </Text>
                      </View>
                    </View>
                    {/* Items */}
                    <Text style={styles.orderItems} numberOfLines={2}>{itemsSummary}</Text>
                    {/* Client */}
                    <Text style={styles.orderClient}>{customerName} · {customerEmail}</Text>
                    {/* Date */}
                    <Text style={styles.orderDate}>{formatDateTime(order.created_at)}</Text>
                  </View>
                  {/* Status badge (only on non-new tabs) */}
                  {!isNewTab && (
                    <View style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}>
                      <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Action button */}
        {isNewTab && filtered.length > 0 && (
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={handleAcceptOrders}>
            <Text style={styles.actionBtnText}>Принять заказы</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { flex: 1, paddingTop: 54, paddingHorizontal: 20, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border.primary },
  searchText: { fontFamily: fonts.body, fontSize: 13, color: colors.foreground.tertiary },
  tabScroll: { flexGrow: 0, marginHorizontal: -20 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20 },
  tab: { paddingVertical: 12, justifyContent: 'center', alignItems: 'center', minWidth: 60, paddingHorizontal: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.border.strong },
  tabInactive: { borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  tabText: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.tertiary },
  tabTextActive: { fontFamily: fonts.captionSemiBold, color: colors.foreground.primary },
  selRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.foreground.primary },
  selCount: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.tertiary },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: colors.border.strong, alignItems: 'center', justifyContent: 'center' },
  listScroll: { flex: 1 },
  listContent: { paddingBottom: 20, gap: 12 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary, textAlign: 'center', paddingTop: 40 },

  // Order card
  orderCard: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderContent: { flex: 1, gap: 3 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontFamily: fonts.captionSemiBold, fontSize: 13, letterSpacing: 0.5, color: colors.foreground.primary },

  // Type tag (ЗАКАЗ / ПРЕДЗАКАЗ)
  typeTag: { paddingVertical: 3, paddingHorizontal: 8 },
  typeTagPreorder: { backgroundColor: colors.surface.inverse },
  typeTagOrder: { borderWidth: 1, borderColor: colors.foreground.tertiary },
  typeTagText: { fontFamily: fonts.captionMedium, fontSize: 8, letterSpacing: 0.5 },
  typeTagTextPreorder: { color: colors.foreground.inverse },
  typeTagTextOrder: { color: colors.foreground.tertiary },

  // Status badge
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12 },
  statusText: { fontFamily: fonts.caption, fontSize: 9, letterSpacing: 1 },

  orderItems: { fontFamily: fonts.body, fontSize: 11, color: colors.foreground.secondary, lineHeight: 16 },
  orderClient: { fontFamily: fonts.body, fontSize: 10, color: colors.foreground.secondary },
  orderDate: { fontFamily: fonts.caption, fontSize: 10, color: colors.foreground.tertiary },

  actionBtn: { height: 48, backgroundColor: colors.surface.inverse, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  actionBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.inverse },
});
