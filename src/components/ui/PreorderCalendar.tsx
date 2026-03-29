import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { colors, fonts } from '../../constants/tokens';

const MONTHS_RU = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ',
];
const DAYS_RU = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

interface PreorderCalendarProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  productName: string;
  productSize: string;
  productPrice: number;
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  // Convert JS day (0=Sun) to Mon-first (0=Mon)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    week.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function PreorderCalendar({ visible, onClose, onConfirm, productName, productSize, productPrice }: PreorderCalendarProps) {
  const today = new Date();
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weeks = useMemo(
    () => getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const canGoPrev = currentMonth.getFullYear() > today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth());

  const goNext = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goPrev = () => {
    if (canGoPrev) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.popup}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.calHeader}>
              <View style={styles.hTitle}>
                <Text style={styles.hMonth}>
                  {MONTHS_RU[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <Text style={styles.hSub}>Выберите дату предзаказа</Text>
              </View>
              <View style={styles.hNav}>
                <TouchableOpacity onPress={goPrev} disabled={!canGoPrev}>
                  <ChevronLeft size={20} color={canGoPrev ? colors.foreground.primary : colors.border.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goNext}>
                  <ChevronRight size={20} color={colors.foreground.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Days header */}
            <View style={styles.daysHeader}>
              {DAYS_RU.map((d) => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calGrid}>
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  {week.map((date, di) => {
                    if (!date) {
                      return <View key={di} style={styles.cell} />;
                    }

                    const disabled = date < minDate;
                    const selected = selectedDate && isSameDay(date, selectedDate);
                    const weekend = isWeekend(date);

                    let textColor: string = colors.foreground.primary;
                    if (disabled) textColor = '#CCCCCC';
                    else if (selected) textColor = colors.foreground.inverse;
                    else if (weekend) textColor = colors.foreground.tertiary;

                    return (
                      <TouchableOpacity
                        key={di}
                        style={[styles.cell, selected && styles.cellSelected]}
                        disabled={disabled}
                        onPress={() => setSelectedDate(date)}
                      >
                        <Text style={[
                          styles.cellText,
                          { color: textColor },
                          selected && styles.cellTextSelected,
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Selected info */}
            {selectedDate ? (
              <View style={styles.selectedInfo}>
                <Text style={styles.selDate}>{formatSelectedDate(selectedDate)}</Text>
                <Text style={styles.selNote}>Ожидаемая дата готовности предзаказа</Text>
              </View>
            ) : (
              <View style={styles.selectedInfo}>
                <Text style={styles.selNote}>Выберите дату на календаре</Text>
              </View>
            )}

            {/* Product summary */}
            <View style={styles.prodSummary}>
              <ShoppingBag size={20} color={colors.foreground.secondary} />
              <View style={styles.prodTxt}>
                <Text style={styles.prodName}>{productName} · {productSize}</Text>
                <Text style={styles.prodPrice}>₸ {productPrice.toLocaleString()} · Предзаказ</Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.preorderBtn, !selectedDate && styles.preorderBtnDisabled]}
              activeOpacity={0.8}
              disabled={!selectedDate}
              onPress={() => selectedDate && onConfirm(selectedDate)}
            >
              <Text style={styles.preorderBtnText}>ОФОРМИТЬ ПРЕДЗАКАЗ</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: colors.surface.primary,
    padding: 24,
    width: '100%',
    maxWidth: 353,
    maxHeight: '90%',
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hTitle: { gap: 2 },
  hMonth: {
    fontFamily: fonts.heading,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.foreground.primary,
  },
  hSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.foreground.secondary,
  },
  hNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    width: 36,
    textAlign: 'center',
    fontFamily: fonts.captionMedium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.foreground.tertiary,
  },
  calGrid: {
    gap: 4,
    marginTop: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.surface.inverse,
  },
  cellText: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
  cellTextSelected: {
    fontWeight: '600',
  },
  selectedInfo: {
    gap: 4,
  },
  selDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.foreground.primary,
  },
  selNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.foreground.secondary,
  },
  prodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface.card,
    padding: 16,
    marginTop: 20,
  },
  prodTxt: { flex: 1, gap: 2 },
  prodName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.foreground.primary,
  },
  prodPrice: {
    fontFamily: fonts.caption,
    fontSize: 10,
    color: colors.foreground.tertiary,
  },
  preorderBtn: {
    height: 52,
    backgroundColor: colors.surface.inverse,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  preorderBtnDisabled: {
    opacity: 0.4,
  },
  preorderBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.foreground.inverse,
  },
});
