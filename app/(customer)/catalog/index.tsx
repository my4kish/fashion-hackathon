import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SlidersHorizontal, Search, X } from 'lucide-react-native';
import { colors, fonts } from '../../../src/constants/tokens';
import { useCatalogStore } from '../../../src/store/catalog.store';
import { Pagination } from '../../../src/components/ui/Pagination';

const CATEGORIES = [
  { label: 'ВСЕ', value: null },
  { label: 'ВЕРХНЯЯ ОДЕЖДА', value: 'Верхняя одежда' },
  { label: 'БАЗОВЫЕ', value: 'Базовые' },
  { label: 'АТЕЛЬЕ', value: 'Ателье' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const searchTimeout = useRef<any>(null);
  const {
    products, loading, currentPage, activeCategory, searchQuery,
    fetchProducts, setSearch, setCategory, setPage, getTotalPages,
  } = useCatalogStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts({ page: 0 });
  }, []);

  const handleSearchChange = (text: string) => {
    setLocalSearch(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(text);
    }, 300);
  };

  const clearSearch = () => {
    setLocalSearch('');
    setSearch('');
  };

  const handleCategoryPress = (value: string | null) => {
    setCategory(value);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const totalPages = getTotalPages();

  const rows: typeof products[] = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>КАТАЛОГ</Text>
          <SlidersHorizontal size={22} color={colors.foreground.primary} />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.foreground.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по каталогу..."
            placeholderTextColor={colors.foreground.tertiary}
            value={localSearch}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
          />
          {localSearch.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={16} color={colors.foreground.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.filterChip, isActive ? styles.filterActive : styles.filterInactive]}
                  onPress={() => handleCategoryPress(cat.value)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Product Grid */}
        {products.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Ничего не найдено</Text>
          </View>
        )}

        <View style={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.gridItem}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(customer)/catalog/${p.id}` as any)}
                >
                  <Image source={{ uri: p.image_url }} style={styles.gridImage} />
                  <View style={styles.gridInfo}>
                    <Text style={styles.gridName}>{p.title}</Text>
                    <Text style={styles.gridPrice}>₸ {p.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {row.length === 1 && <View style={styles.gridItem} />}
            </View>
          ))}
        </View>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border.primary },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.foreground.primary, padding: 0 },
  filtersScroll: { marginHorizontal: -20, flexGrow: 0 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16 },
  filterActive: { backgroundColor: colors.surface.inverse },
  filterInactive: { borderWidth: 1, borderColor: colors.border.primary },
  filterText: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.primary },
  filterTextActive: { color: colors.foreground.inverse },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, gap: 10 },
  gridImage: { width: '100%', height: 200, backgroundColor: colors.surface.card },
  gridInfo: { gap: 4 },
  gridName: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 0.5, color: colors.foreground.primary },
  gridPrice: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.primary },
});
