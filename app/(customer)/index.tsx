import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Search, Shirt, Scissors, Sparkles } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useCatalogStore } from '../../src/store/catalog.store';

const categories = [
  { icon: Shirt, label: 'ВЕРХ', inverted: false },
  { icon: Scissors, label: 'АТЕЛЬЕ', inverted: true },
  { icon: Sparkles, label: 'НОВИНКИ', inverted: false },
];

export default function ClientHomeScreen() {
  const router = useRouter();
  const { fetchProducts, fetchFavorites } = useCatalogStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchFavorites()]);
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.brandMark}>AVISHU</Text>
          <TouchableOpacity>
            <Search size={22} color={colors.foreground.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1723985427774-b8f0e596f52a?w=800' }}
            style={styles.heroImage}
            imageStyle={{ resizeMode: 'cover' }}
          >
            <Text style={styles.heroTitle}>{'NEW\nCOLLECTION\nSS26'}</Text>
            <View style={styles.heroSub}>
              <Text style={styles.heroTag}>PREMIUM ESSENTIALS</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/catalog')}>
                <Text style={styles.heroArrow}>СМОТРЕТЬ →</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.catSection}>
          <View style={styles.catHeader}>
            <Text style={styles.catTitle}>КАТЕГОРИИ</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/catalog')}>
              <Text style={styles.catAll}>ВСЕ →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.catRow}>
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const bg = cat.inverted ? colors.surface.inverse : colors.surface.card;
              const fg = cat.inverted ? colors.foreground.inverse : colors.foreground.primary;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.catItem, { backgroundColor: bg }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(customer)/catalog')}
                >
                  <Icon size={24} color={fg} />
                  <Text style={[styles.catLabel, { color: fg }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandMark: { fontFamily: fonts.heading, fontSize: 22, letterSpacing: 3, color: colors.foreground.primary },
  hero: { overflow: 'hidden' },
  heroImage: { width: '100%', height: 380, justifyContent: 'flex-end', padding: 24 },
  heroTitle: { fontFamily: fonts.heading, fontSize: 48, letterSpacing: 2, lineHeight: 48, color: colors.foreground.inverse },
  heroSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  heroTag: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.inverse },
  heroArrow: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.inverse },
  catSection: { gap: 16 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTitle: { fontFamily: fonts.heading, fontSize: 18, letterSpacing: 1, color: colors.foreground.primary },
  catAll: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  catRow: { flexDirection: 'row', gap: 12 },
  catItem: { flex: 1, height: 100, alignItems: 'center', justifyContent: 'center', gap: 8 },
  catLabel: { fontFamily: fonts.caption, fontSize: 9, letterSpacing: 1 },
});
