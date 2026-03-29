import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react-native';
import { colors, fonts } from '../../../src/constants/tokens';
import { Button } from '../../../src/components/ui/Button';
import { PreorderCalendar } from '../../../src/components/ui/PreorderCalendar';
import { useCatalogStore } from '../../../src/store/catalog.store';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart, favorites, toggleFavorite } = useCatalogStore();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const isFav = favorites.includes(id);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 40, fontFamily: fonts.body }}>Товар не найден</Text>
      </View>
    );
  }

  const isPreorder = product.type === 'preorder';

  const handleAddToCart = () => {
    if (isPreorder) {
      setShowCalendar(true);
    } else {
      addToCart(product, qty, selectedSize);
      Alert.alert('Добавлено', `${product.title} (${selectedSize}) x${qty} добавлен в корзину`);
      router.back();
    }
  };

  const handlePreorderConfirm = (date: Date) => {
    const dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    addToCart(product, qty, selectedSize, dueDate);
    setShowCalendar(false);
    Alert.alert('Предзаказ оформлен', `${product.title} (${selectedSize}) x${qty}\nДата готовности: ${date.toLocaleDateString('ru-RU')}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
        <View style={styles.heroWrap}>
          <Image source={{ uri: product.image_url }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <ArrowLeft size={22} color={colors.foreground.inverse} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={() => toggleFavorite(product.id)}>
              <Heart size={22} color={colors.foreground.inverse} fill={isFav ? colors.foreground.inverse : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.title}</Text>
            <Text style={styles.productPrice}>₸ {product.price.toLocaleString()}</Text>
          </View>
          <Text style={styles.productDesc}>{product.description}</Text>

          {isPreorder && (
            <View style={styles.preorderBadge}>
              <Text style={styles.preorderText}>ПРЕДЗАКАЗ · от 7 дней</Text>
            </View>
          )}

          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>РАЗМЕР</Text>
            <View style={styles.sizeRow}>
              {product.sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeChip, selectedSize === s && styles.sizeChipActive]}
                  onPress={() => setSelectedSize(s)}
                >
                  <Text style={[styles.sizeText, selectedSize === s && styles.sizeTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>КОЛИЧЕСТВО</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                <Minus size={16} color={colors.foreground.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                <Plus size={16} color={colors.foreground.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            label={isPreorder ? 'ОФОРМИТЬ ПРЕДЗАКАЗ' : 'В КОРЗИНУ'}
            variant="primary"
            fullWidth
            onPress={handleAddToCart}
          />
        </View>
      </ScrollView>

      <PreorderCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={handlePreorderConfirm}
        productName={product.title}
        productSize={selectedSize}
        productPrice={product.price}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 340, backgroundColor: colors.surface.card },
  heroOverlay: { position: 'absolute', top: 54, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 20, gap: 16 },
  titleRow: { gap: 8 },
  productName: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },
  productPrice: { fontFamily: fonts.heading, fontSize: 24, color: colors.foreground.primary },
  productDesc: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.foreground.secondary },
  preorderBadge: { backgroundColor: '#F59E0B20', paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' },
  preorderText: { fontFamily: fonts.captionMedium, fontSize: 10, letterSpacing: 1, color: '#F59E0B' },
  sizeSection: { gap: 12 },
  sizeLabel: { fontFamily: fonts.captionMedium, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  sizeRow: { flexDirection: 'row', gap: 8 },
  sizeChip: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.primary },
  sizeChipActive: { backgroundColor: colors.surface.inverse, borderColor: colors.surface.inverse },
  sizeText: { fontFamily: fonts.captionMedium, fontSize: 12, color: colors.foreground.primary },
  sizeTextActive: { color: colors.foreground.inverse },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyLabel: { fontFamily: fonts.captionMedium, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.primary },
  qtyValue: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.foreground.primary, minWidth: 24, textAlign: 'center' },
});
