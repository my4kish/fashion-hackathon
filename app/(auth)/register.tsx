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

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  let d = digits;
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  let result = '+7';
  if (d.length > 1) result += ' (' + d.slice(1, 4);
  if (d.length >= 4) result += ')';
  if (d.length > 4) result += ' ' + d.slice(4, 7);
  if (d.length > 7) result += ' ' + d.slice(7, 9);
  if (d.length > 9) result += ' ' + d.slice(9, 11);
  return result;
}

function validate(name: string, email: string, password: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Введите ваше имя';
  if (!email.trim()) errors.email = 'Введите email адрес';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Неверный формат email';
  if (!password) errors.password = 'Введите пароль';
  else if (password.length < 6) errors.password = 'Пароль должен быть не менее 6 символов';
  return errors;
}

function friendlyError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'Этот email уже зарегистрирован';
  if (msg.includes('rate limit') || msg.includes('email_send')) return 'Слишком много попыток. Попробуйте через минуту';
  if (msg.includes('valid email')) return 'Неверный формат email адреса';
  if (msg.includes('password')) return 'Пароль должен быть не менее 6 символов';
  if (msg.includes('network') || msg.includes('fetch')) return 'Нет подключения к серверу. Проверьте интернет';
  return 'Не удалось создать аккаунт. Попробуйте позже';
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const handleRegister = async () => {
    setGlobalError('');
    const v = validate(name, email, password);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      await signUp(email, password, name, phone);
      router.replace('/(auth)/role-select');
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
            <View style={{ width: 22, opacity: 0 }} />
          </View>
          <Text style={styles.title}>{'СОЗДАТЬ\nАККАУНТ'}</Text>
          <Text style={styles.subtitle}>{'Заполните данные для регистрации\nв экосистеме AVISHU'}</Text>
        </View>

        <View style={styles.form}>
          <Input label="ИМЯ" placeholder="Ваше имя" value={name} onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }} error={errors.name} />
          <Input label="EMAIL" placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }} error={errors.email} />
          <Input label="ТЕЛЕФОН" placeholder="+7 (XXX) XXX XX XX" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(formatPhone(t))} />
          <Input label="ПАРОЛЬ" placeholder="••••••••" secureTextEntry value={password} onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }} error={errors.password} />
          {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottom}>
          <Button label={loading ? 'СОЗДАЮ...' : 'СОЗДАТЬ АККАУНТ'} variant="primary" fullWidth onPress={handleRegister} />
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Уже есть аккаунт? ВОЙТИ →</Text>
          </TouchableOpacity>
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
  globalError: { fontFamily: fonts.body, fontSize: 12, color: '#E53935', textAlign: 'center', paddingVertical: 8, backgroundColor: '#E5393510', paddingHorizontal: 12 },
  spacer: { flex: 1 },
  bottom: { gap: 16, alignItems: 'center' },
  loginLink: { fontFamily: fonts.caption, fontSize: 12, letterSpacing: 1, color: colors.foreground.secondary },
});
