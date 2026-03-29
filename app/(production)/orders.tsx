import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, Check, X } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useOrdersStore } from '../../src/store/orders.store';
import { OrderStatus } from '../../src/types';

const tabs = [
  { label: 'ПОСТУПЛЕНИЕ', status: 'confirmed' as OrderStatus, action: 'Принять в работу', nextStatus: 'sewing' as OrderStatus },
  { label: 'В РАБОТЕ', status: 'sewing' as OrderStatus, action: 'Завершить пошив', nextStatus: 'ready' as OrderStatus },
  { label: 'СШИТО', status: 'ready' as OrderStatus, action: null, nextStatus: null },
];

export default function ProductionOrdersScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, fetchOrders, subscribeToOrders, unsubscribe, batchUpdateStatus } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders('production');
    subscribeToOrders('production');
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders('production');
    setRefreshing(false);
  }, []);

  const currentTab = tabs[activeTab];
  const filtered = orders.filter((o) => {
    if (o.status !== currentTab.status) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const itemsText = o.order_items?.map((i) => i.product_title).join(' ').toLowerCase() || '';
    return o.order_number.toLowerCase().includes(q) || itemsText.includes(q);
  });
  const hasAction = currentTab.action !== null;

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAction = async () => {
    if (selected.size === 0 || !currentTab.nextStatus) return;
    await batchUpdateStatus(Array.from(selected), currentTab.nextStatus);
    setSelected(new Set());
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
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по заказам..."
            placeholderTextColor={colors.foreground.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.foreground.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab, i) => {
            const count = orders.filter((o) => o.status === tab.status).length;
            return (
              <TouchableOpacity
                key={tab.label}
                style={[styles.tab, activeTab === i ? styles.tabActive : styles.tabInactive]}
                onPress={() => { setActiveTab(i); setSelected(new Set()); }}
              >
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Select All row */}
        {hasAction && filtered.length > 0 && (
          <View style={styles.selRow}>
            <TouchableOpacity
              style={styles.selLeft}
              onPress={() => {
                if (selected.size === filtered.length) setSelected(new Set());
                else setSelected(new Set(filtered.map((o) => o.id)));
              }}
            >
              <View style={styles.checkbox}>
                {selected.size === filtered.length && selected.size > 0 && (
                  <Check size={14} color={colors.foreground.primary} />
                )}
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
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Нет заказов</Text>
          )}

          {filtered.map((order) => {
            const isPreorder = !!order.due_date;
            const isSewing = order.status === 'sewing';
            const totalQty = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;
            const itemsText = order.order_items?.map((i) => i.product_title).join(', ') || '';

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => hasAction ? toggleSelection(order.id) : null}
              >
                <View style={styles.orderTopRow}>
                  {hasAction && (
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelection(order.id)}>
                      {selected.has(order.id) && <Check size={14} color={colors.foreground.primary} />}
                    </TouchableOpacity>
                  )}
                  <Text style={styles.orderId}>{order.order_number}</Text>
                  <View style={{ flex: 1 }} />
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
                <Text style={styles.orderTitle}>{itemsText}</Text>
                <Text style={styles.orderMeta}>{totalQty} шт. · ₸{order.total_amount.toLocaleString()}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')} · {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {order.due_date && (
                    <Text style={styles.orderDeadline}>до {new Date(order.due_date).toLocaleDateString('ru-RU')}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Action button */}
        {hasAction && filtered.length > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, selected.size === 0 && styles.actionBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleAction}
          >
            <Text style={styles.actionBtnText}>{currentTab.action}</Text>
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
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.foreground.primary, padding: 0 },
  tabRow: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
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
  listContent: { paddingBottom: 20 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary, textAlign: 'center', paddingTop: 40 },
  orderCard: { padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border.primary },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { fontFamily: fonts.captionSemiBold, fontSize: 13, letterSpacing: 0.5, color: colors.foreground.primary },
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
  orderTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground.primary },
  orderMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontFamily: fonts.caption, fontSize: 10, color: colors.foreground.tertiary },
  orderDeadline: { fontFamily: fonts.caption, fontSize: 10, color: '#F59E0B' },
  actionBtn: { height: 48, backgroundColor: colors.surface.inverse, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.inverse },
});
