import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts } from '../../constants/tokens';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error ? styles.boxError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.foreground.tertiary}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontFamily: fonts.captionMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.foreground.secondary,
    textTransform: 'uppercase',
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  boxError: {
    borderColor: '#E53935',
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.foreground.primary,
    padding: 0,
  },
  error: {
    fontFamily: fonts.caption,
    fontSize: 10,
    color: '#E53935',
    marginTop: -4,
  },
});
