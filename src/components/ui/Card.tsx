import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts } from '../../constants/tokens';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, description, children, style }: CardProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: 20,
    gap: 16,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    letterSpacing: 1,
    color: colors.foreground.primary,
    textTransform: 'uppercase',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.foreground.secondary,
  },
});
