import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../../constants/tokens';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | '...')[] = [];
  pages.push(0); // always first

  if (current > 2) pages.push('...');

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 3) pages.push('...');

  pages.push(total - 1); // always last

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cell}
        disabled={!canPrev}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} color={canPrev ? colors.foreground.primary : colors.foreground.tertiary} />
      </TouchableOpacity>

      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <View key={`dots-${i}`} style={styles.cell}>
              <Text style={styles.dotsText}>...</Text>
            </View>
          );
        }
        const isActive = page === currentPage;
        return (
          <TouchableOpacity
            key={page}
            style={[styles.cell, isActive && styles.cellActive]}
            onPress={() => onPageChange(page)}
          >
            <Text style={[styles.pageText, isActive && styles.pageTextActive]}>
              {page + 1}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.cell}
        disabled={!canNext}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} color={canNext ? colors.foreground.primary : colors.foreground.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    backgroundColor: colors.surface.inverse,
  },
  pageText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.foreground.primary,
  },
  pageTextActive: {
    color: colors.foreground.inverse,
    fontWeight: '600',
  },
  dotsText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.foreground.tertiary,
  },
});
