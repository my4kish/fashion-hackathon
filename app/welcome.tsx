import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../src/constants/tokens';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.spacer} />
      <View style={styles.center}>
        <Text style={styles.logo}>AVISHU</Text>
        <Text style={styles.tagline}>PREMIUM CLOTHING</Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.ctaLabel}>ВОЙТИ В СИСТЕМУ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.ctaSecondary}>СОЗДАТЬ АККАУНТ →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.inverse },
  spacer: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  logo: { fontFamily: fonts.heading, fontSize: 64, color: colors.foreground.inverse, letterSpacing: 6 },
  tagline: { fontFamily: fonts.caption, fontSize: 11, color: colors.foreground.tertiary, letterSpacing: 4 },
  bottom: { alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingBottom: 48 },
  ctaButton: { width: '100%', backgroundColor: colors.surface.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32 },
  ctaLabel: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.foreground.primary, letterSpacing: 1 },
  ctaSecondary: { fontFamily: fonts.caption, fontSize: 12, color: colors.foreground.tertiary, letterSpacing: 1 },
});
