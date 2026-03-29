import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Heart } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useCatalogStore } from '../../src/store/catalog.store';

export default function FavoritesScreen() {
  const { products, favorites, fetchFavorites, fetchProducts, toggleFavorite } = useCatalogStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFavorites(), fetchProducts()]);
    setRefreshing(false);
  }, []);

  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>ИЗБРАННОЕ</Text>
          <Text style={styles.count}>{favProducts.length} ПОЗИЦИИ</Text>
        </View>

        {favProducts.length === 0 && (
          <Text style={styles.emptyText}>Нет избранных товаров</Text>
        )}

        {favProducts.map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemPrice}>₸ {item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Heart size={20} color={colors.foreground.primary} fill={colors.foreground.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },
  count: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.secondary, textAlign: 'center', paddingTop: 40 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  itemImage: { width: 100, height: 120, backgroundColor: colors.surface.card },
  itemInfo: { flex: 1, gap: 6 },
  itemName: { fontFamily: fonts.captionMedium, fontSize: 11, letterSpacing: 0.5, color: colors.foreground.primary },
  itemCategory: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },
  itemPrice: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.foreground.primary },
});
