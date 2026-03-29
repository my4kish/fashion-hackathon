import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/auth.store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login')) return 'Неверный email или пароль';
  if (msg.includes('Email not confirmed')) return 'Email не подтверждён. Проверьте вашу почту';
  if (msg.includes('rate limit')) return 'Слишком много попыток. Попробуйте через минуту';
  if (msg.includes('network') || msg.includes('fetch')) return 'Нет подключения к серверу. Проверьте интернет';
  return 'Не удалось войти. Попробуйте позже';
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading, fetchProfile } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const handleLogin = async () => {
    setGlobalError('');
    const v: Record<string, string> = {};
    if (!email.trim()) v.email = 'Введите email адрес';
    else if (!EMAIL_REGEX.test(email)) v.email = 'Неверный формат email';
    if (!password) v.password = 'Введите пароль';
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      await signIn(email, password);
      const profile = await fetchProfile();
      if (profile?.role) {
        const route =
          profile.role === 'franchisee' ? '/(franchisee)'
          : profile.role === 'production' ? '/(production)'
          : '/(customer)';
        router.replace(route as any);
      } else {
        router.replace('/(auth)/role-select');
      }
    } catch (e: any) {
      setGlobalError(friendlyError(e?.message || ''));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.foreground.primary} />
            </TouchableOpacity>
            <Text style={styles.brand}>AVISHU</Text>
            <View style={{ width: 22 }} />
          </View>
          <Text style={styles.title}>{'ВХОД\nВ АККАУНТ'}</Text>
          <Text style={styles.subtitle}>{'Введите ваши данные для входа\nв экосистему AVISHU'}</Text>
        </View>

        <View style={styles.form}>
          <Input label="EMAIL" placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }} error={errors.email} />
          <Input label="ПАРОЛЬ" placeholder="••••••••" secureTextEntry value={password} onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }} error={errors.password} />
          <View style={styles.forgotRow}>
            <Text style={styles.forgotText}>Забыли пароль?</Text>
          </View>
          {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottom}>
          <Button label={loading ? 'ВХОЖУ...' : 'ВОЙТИ'} variant="primary" fullWidth onPress={handleLogin} />
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ИЛИ</Text>
            <View style={styles.dividerLine} />
          </View>
          <Button label="СОЗДАТЬ АККАУНТ" variant="secondary" fullWidth onPress={() => router.push('/(auth)/register')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { flexGrow: 1, paddingTop: 54, paddingHorizontal: 20, paddingBottom: 48, gap: 32 },
  header: { gap: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: fonts.heading, fontSize: 16, letterSpacing: 2, color: colors.foreground.primary },
  title: { fontFamily: fonts.heading, fontSize: 36, letterSpacing: 2, lineHeight: 36 * 1.05, color: colors.foreground.primary },
  subtitle: { fontFamily: fonts.body, fontSize: 14, lineHeight: 14 * 1.5, color: colors.foreground.secondary },
  form: { gap: 16 },
  forgotRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  forgotText: { fontFamily: fonts.caption, fontSize: 11, letterSpacing: 0.5, color: colors.foreground.secondary },
  globalError: { fontFamily: fonts.body, fontSize: 12, color: '#E53935', textAlign: 'center', paddingVertical: 8, backgroundColor: '#E5393510', paddingHorizontal: 12 },
  spacer: { flex: 1 },
  bottom: { gap: 16, alignItems: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.primary },
  dividerText: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 1, color: colors.foreground.tertiary },
});
