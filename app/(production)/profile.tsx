import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LogOut, Phone, Mail, Shield } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { supabase } from '../../src/services/supabase';

interface ProdStats {
  total_completed: number;
  total_in_progress: number;
  total_incoming: number;
  total_items_completed: number;
  total_items_in_progress: number;
  completion_rate: number;
}

export default function ProductionProfileScreen() {
  const { profile, signOut } = useAuthStore();
  const [stats, setStats] = useState<ProdStats | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.rpc('get_production_stats', { production_uuid: profile.id }).then(({ data }) => {
      if (data) setStats(data as ProdStats);
    });
  }, [profile?.id]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.avatar_initials || 'ПР'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name?.toUpperCase() || 'ЦЕХ AVISHU'}</Text>
            <Text style={styles.userSub}>{profile?.email || 'Производство'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <LogOut size={20} color={colors.foreground.secondary} />
          </TouchableOpacity>
        </View>

        {/* Performance card */}
        <View style={styles.perfCard}>
          <Text style={styles.perfTitle}>ПОКАЗАТЕЛИ ПРОИЗВОДСТВА</Text>
          <View style={styles.perfRow}>
            <View style={styles.perfItem}>
              <Text style={styles.perfValue}>{stats?.total_items_completed ?? '—'}</Text>
              <Text style={styles.perfLabel}>Единиц сшито</Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={styles.perfValue}>{stats?.completion_rate ?? 0}%</Text>
              <Text style={styles.perfLabel}>Выполнено</Text>
            </View>
          </View>
          <View style={styles.perfRow}>
            <View style={styles.perfItem}>
              <Text style={styles.perfValue}>{stats?.total_in_progress ?? '—'}</Text>
              <Text style={styles.perfLabel}>В работе</Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={styles.perfValue}>{stats?.total_incoming ?? '—'}</Text>
              <Text style={styles.perfLabel}>Ожидает</Text>
            </View>
          </View>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ИНФОРМАЦИЯ ОБ АККАУНТЕ</Text>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Mail size={16} color={colors.foreground.tertiary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ПОЧТА</Text>
                <Text style={styles.infoValue}>{profile?.email || '—'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Phone size={16} color={colors.foreground.tertiary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ТЕЛЕФОН</Text>
                <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Shield size={16} color={colors.foreground.tertiary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>РОЛЬ</Text>
                <Text style={styles.infoValue}>Производство</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutLabel}>ВЫЙТИ ИЗ АККАУНТА</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoutBtn: { padding: 8 },
  avatar: { width: 64, height: 64, backgroundColor: colors.surface.inverse, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 24, color: colors.foreground.inverse },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontFamily: fonts.heading, fontSize: 20, letterSpacing: 1, color: colors.foreground.primary },
  userSub: { fontFamily: fonts.body, fontSize: 12, color: colors.foreground.secondary },

  perfCard: { backgroundColor: colors.surface.inverse, padding: 20, gap: 16 },
  perfTitle: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.tertiary },
  perfRow: { flexDirection: 'row', gap: 16 },
  perfItem: { flex: 1, gap: 2 },
  perfValue: { fontFamily: fonts.heading, fontSize: 24, color: colors.foreground.inverse },
  perfLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.foreground.tertiary },

  section: { gap: 12 },
  sectionTitle: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.tertiary },
  infoList: { borderTopWidth: 1, borderTopColor: colors.border.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontFamily: fonts.caption, fontSize: 9, letterSpacing: 1, color: colors.foreground.tertiary },
  infoValue: { fontFamily: fonts.body, fontSize: 14, color: colors.foreground.primary },

  logoutButton: { borderWidth: 1, borderColor: colors.border.strong, paddingVertical: 16, alignItems: 'center' },
  logoutLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, letterSpacing: 1, color: colors.foreground.primary },
});
