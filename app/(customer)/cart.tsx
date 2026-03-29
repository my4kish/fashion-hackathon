import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Minus, Plus, X } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { Button } from '../../src/components/ui/Button';
import { useCatalogStore } from '../../src/store/catalog.store';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQty, getCartTotal, createOrderFromCart } = useCatalogStore();
  const total = getCartTotal();

  const handleOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары из каталога');
      return;
    }
    const orderId = await createOrderFromCart();
    if (orderId) {
      Alert.alert('Заказ оформлен!', 'Ваш заказ создан и отправлен на обработку');
    } else {
      Alert.alert('Ошибка', 'Не удалось создать заказ');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.topBar}>
          <Text style={styles.title}>КОРЗИНА</Text>
          <Text style={styles.count}>{cart.length} ПОЗИЦИИ</Text>
        </View>

        {cart.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Корзина пуста</Text>
            <Button label="В КАТАЛОГ" variant="secondary" onPress={() => router.push('/(customer)/catalog')} />
          </View>
        )}

        {cart.map((item) => (
          <View key={item.product_id + item.size} style={styles.cartItem}>
            <Image source={{ uri: item.product.image_url }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.product.title}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.product_id)}>
                  <X size={16} color={colors.foreground.tertiary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemSize}>Размер: {item.size}</Text>
              <View style={styles.itemBottom}>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.product_id, item.quantity - 1)}>
                    <Minus size={14} color={colors.foreground.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.product_id, item.quantity + 1)}>
                    <Plus size={14} color={colors.foreground.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>₸ {(item.product.price * item.quantity).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.bottom}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ИТОГО</Text>
            <Text style={styles.totalValue}>₸ {total.toLocaleString()}</Text>
          </View>
          <Button label="ОФОРМИТЬ ЗАКАЗ" variant="primary" fullWidth onPress={handleOrder} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },
  count: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.secondary },
  empty: { alignItems: 'center', gap: 16, paddingTop: 60 },
  emptyText: { fontFamily: fonts.body, fontSize: 16, color: colors.foreground.secondary },
  cartItem: { flexDirection: 'row', gap: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  itemImage: { width: 100, height: 120, backgroundColor: colors.surface.card },
  itemInfo: { flex: 1, gap: 6 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontFamily: fonts.captionMedium, fontSize: 11, letterSpacing: 0.5, color: colors.foreground.primary },
  itemSize: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border.primary },
  qtyValue: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground.primary },
  itemPrice: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.primary },
  bottom: { padding: 20, gap: 16, borderTopWidth: 1, borderTopColor: colors.border.primary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: fonts.caption, fontSize: 12, letterSpacing: 2, color: colors.foreground.secondary },
  totalValue: { fontFamily: fonts.heading, fontSize: 24, color: colors.foreground.primary },
});
