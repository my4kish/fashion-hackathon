import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/tokens';

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  return <View style={[styles.line, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border.primary,
  },
});
