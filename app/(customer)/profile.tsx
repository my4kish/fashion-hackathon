import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogOut, Package, ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { supabase } from '../../src/services/supabase';

function getLoyalty(totalSpent: number) {
  if (totalSpent >= 300000) {
    return { level: 'Gold', next: null, nextThreshold: 0, progress: 1 };
  }
  if (totalSpent >= 100000) {
    return { level: 'Silver', next: 'Gold', nextThreshold: 300000, progress: (totalSpent - 100000) / 200000 };
  }
  return { level: 'Bronze', next: 'Silver', nextThreshold: 100000, progress: totalSpent / 100000 };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.rpc('get_customer_total_spent', { customer_uuid: profile.id })
      .then(({ data }) => { if (data !== null) setTotalSpent(Number(data)); });
  }, [profile?.id]);

  const handleLogout = async () => {
    await signOut();
  };

  const loyalty = getLoyalty(totalSpent);
  const points = Math.floor(totalSpent * 0.05);
  const remaining = loyalty.nextThreshold ? loyalty.nextThreshold - totalSpent : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.avatar_initials || 'АВ'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name?.toUpperCase() || 'ПОЛЬЗОВАТЕЛЬ'}</Text>
            <Text style={styles.userSub}>{profile?.email} · {loyalty.level} статус</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={colors.foreground.secondary} />
          </TouchableOpacity>
        </View>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          <Text style={styles.loyaltyTitle}>ПРОГРАММА ЛОЯЛЬНОСТИ</Text>
          <View style={styles.loyaltyRow}>
            <Text style={styles.loyaltyPoints}>{points.toLocaleString()}</Text>
            <Text style={styles.loyaltyLabel}>БАЛЛОВ</Text>
          </View>
          <View style={styles.loyaltyBar}>
            <View style={[styles.loyaltyProgress, { width: `${Math.min(loyalty.progress * 100, 100)}%` }]} />
          </View>
          <View style={styles.loyaltyFooter}>
            <Text style={styles.loyaltyNext}>
              {loyalty.next
                ? `₸ ${remaining.toLocaleString()} до ${loyalty.next}`
                : 'Максимальный уровень'}
            </Text>
            <Text style={styles.loyaltySpent}>Всего покупок: ₸ {totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.loyaltyHint}>
            <Text style={styles.loyaltyHintText}>5% от суммы покупок = баллы. Bronze → Silver от ₸100k, Gold от ₸300k</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/orders' as any)}
          >
            <View style={styles.menuLeft}>
              <Package size={20} color={colors.foreground.primary} />
              <Text style={styles.menuText}>МОИ ЗАКАЗЫ</Text>
            </View>
            <ChevronRight size={18} color={colors.foreground.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutLabel}>ВЫЙТИ ИЗ АККАУНТА</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { flex: 1, paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 32 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoutBtn: { padding: 8 },
  avatar: { width: 64, height: 64, backgroundColor: colors.surface.inverse, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 24, color: colors.foreground.inverse },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontFamily: fonts.heading, fontSize: 20, letterSpacing: 1, color: colors.foreground.primary },
  userSub: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },

  // Loyalty
  loyaltyCard: { backgroundColor: colors.surface.inverse, padding: 20, gap: 12 },
  loyaltyTitle: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.tertiary },
  loyaltyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loyaltyPoints: { fontFamily: fonts.heading, fontSize: 36, color: colors.foreground.inverse },
  loyaltyLabel: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.tertiary },
  loyaltyBar: { height: 4, backgroundColor: '#666666', width: '100%' },
  loyaltyProgress: { height: 4, backgroundColor: colors.foreground.inverse },
  loyaltyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loyaltyNext: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.tertiary },
  loyaltySpent: { fontFamily: fonts.captionMedium, fontSize: 10, letterSpacing: 0.5, color: colors.foreground.tertiary },
  loyaltyHint: { borderTopWidth: 1, borderTopColor: '#FFFFFF19', paddingTop: 10 },
  loyaltyHintText: { fontFamily: fonts.caption, fontSize: 9, lineHeight: 14, color: '#666666' },

  // Menu
  menu: {},
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontFamily: fonts.caption, fontSize: 12, letterSpacing: 0.5, color: colors.foreground.primary },

  // Logout button
  logoutButton: { borderWidth: 1, borderColor: colors.border.strong, paddingVertical: 16, alignItems: 'center' },
  logoutLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, letterSpacing: 1, color: colors.foreground.primary },
});
