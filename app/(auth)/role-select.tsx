import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Crown, Briefcase, Factory, ArrowRight } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { UserRole } from '../../src/types';

const roles = [
  { key: 'customer' as UserRole, icon: Crown, title: 'КЛИЕНТ', desc: 'Просматривайте каталог, создавайте заказы и отслеживайте их статус' },
  { key: 'franchisee' as UserRole, icon: Briefcase, title: 'ФРАНЧАЙЗИ', desc: 'Управляйте заказами, отслеживайте аналитику и работайте с клиентами' },
  { key: 'production' as UserRole, icon: Factory, title: 'ПРОИЗВОДСТВО', desc: 'Принимайте задания, управляйте очередью пошива и отгрузками' },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);
  const [pressed, setPressed] = useState<UserRole | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    setPressed(role);
    try {
      await setRole(role);
      const route =
        role === 'franchisee' ? '/(franchisee)'
        : role === 'production' ? '/(production)'
        : '/(customer)';
      router.replace(route as any);
    } catch (e: any) {
      setPressed(null);
      Alert.alert('Ошибка', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{'ВЫБЕРИТЕ\nВАШУ РОЛЬ'}</Text>
          <Text style={styles.subtitle}>{'Интерфейс приложения адаптируется\nпод вашу роль в экосистеме AVISHU'}</Text>
        </View>
        <View style={styles.roles}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = pressed === role.key;
            const fg = isActive ? colors.foreground.inverse : colors.foreground.primary;
            const descColor = isActive ? colors.foreground.tertiary : colors.foreground.secondary;
            return (
              <TouchableOpacity
                key={role.key}
                activeOpacity={0.8}
                style={[styles.roleCard, isActive ? styles.roleActive : styles.roleOutline]}
                onPress={() => handleSelectRole(role.key)}
              >
                <Icon size={24} color={fg} />
                <View style={styles.roleText}>
                  <Text style={[styles.roleTitle, { color: fg }]}>{role.title}</Text>
                  <Text style={[styles.roleDesc, { color: descColor }]}>{role.desc}</Text>
                </View>
                <ArrowRight size={20} color={fg} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { flexGrow: 1, paddingTop: 54, paddingHorizontal: 20, paddingBottom: 48, gap: 48 },
  header: { gap: 12 },
  title: { fontFamily: fonts.heading, fontSize: 42, letterSpacing: 2, lineHeight: 42 * 1.05, color: colors.foreground.primary },
  subtitle: { fontFamily: fonts.body, fontSize: 14, lineHeight: 14 * 1.5, color: colors.foreground.secondary },
  roles: { gap: 12 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 24, paddingHorizontal: 20 },
  roleOutline: { borderWidth: 1, borderColor: colors.border.strong },
  roleActive: { backgroundColor: colors.surface.inverse },
  roleText: { flex: 1, gap: 4 },
  roleTitle: { fontFamily: fonts.heading, fontSize: 16, letterSpacing: 1 },
  roleDesc: { fontFamily: fonts.body, fontSize: 12, lineHeight: 12 * 1.4 },
});
