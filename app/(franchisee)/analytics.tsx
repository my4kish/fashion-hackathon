import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Info, ShoppingBag, Zap } from 'lucide-react-native';
import { colors, fonts } from '../../src/constants/tokens';
import { useAuthStore } from '../../src/store/auth.store';
import { supabase } from '../../src/services/supabase';

const MONTHS_RU = ['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];
const MONTHS_SHORT = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];

interface Analytics {
  revenue: number;
  orders: number;
  avg_check: number;
  prev_revenue: number;
  prev_orders: number;
  revenue_delta: number;
  orders_delta: number;
  daily: { day: number; amount: number; cnt: number }[] | null;
}

function formatMoney(n: number) {
  if (n >= 1000000) return `₸${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₸${Math.round(n / 1000)}K`;
  return `₸${n.toLocaleString()}`;
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return <View style={s.deltaRow}><Minus size={10} color="#999" /><Text style={s.deltaZero}>0%</Text></View>;
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  const color = positive ? '#22C55E' : '#E53935';
  return (
    <View style={s.deltaRow}>
      <Icon size={10} color={color} />
      <Text style={[s.deltaText, { color }]}>{positive ? '+' : ''}{value}%</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { profile } = useAuthStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (y: number, m: number) => {
    if (!profile?.id) return;
    setLoading(true);
    const { data: result } = await supabase.rpc('get_franchisee_analytics', {
      franchisee_uuid: profile.id, target_year: y, target_month: m,
    });
    if (result) setData(result as Analytics);
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(year, month); }, [profile?.id, year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => {
    if (year === now.getFullYear() && month === now.getMonth() + 1) return;
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };
  const prevYear = () => setYear(year - 1);
  const nextYear = () => { if (year < now.getFullYear()) setYear(year + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const isCurrentYear = year === now.getFullYear();

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap = new Map((data?.daily || []).map((d) => [d.day, d]));
  const maxAmount = Math.max(...(data?.daily || []).map((d) => d.amount), 1);
  const activeDays = data?.daily?.length || 0;
  const bestDay = data?.daily?.reduce((best, d) => d.amount > best.amount ? d : best, { day: 0, amount: 0, cnt: 0 });

  return (
    <View style={s.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.title}>АНАЛИТИКА</Text>

        {/* Period selectors — month and year separate */}
        <View style={s.periodSection}>
          <View style={s.periodPicker}>
            <TouchableOpacity onPress={prevMonth} style={s.arrowBtn}>
              <ChevronLeft size={16} color={colors.foreground.primary} />
            </TouchableOpacity>
            <View style={s.periodValue}>
              <Text style={s.periodText}>{MONTHS_SHORT[month - 1]}</Text>
            </View>
            <TouchableOpacity onPress={nextMonth} style={s.arrowBtn} disabled={isCurrentMonth}>
              <ChevronRight size={16} color={isCurrentMonth ? colors.foreground.tertiary : colors.foreground.primary} />
            </TouchableOpacity>
          </View>
          <View style={s.periodPicker}>
            <TouchableOpacity onPress={prevYear} style={s.arrowBtn}>
              <ChevronLeft size={16} color={colors.foreground.primary} />
            </TouchableOpacity>
            <View style={s.periodValue}>
              <Text style={s.periodText}>{year}</Text>
            </View>
            <TouchableOpacity onPress={nextYear} style={s.arrowBtn} disabled={isCurrentYear}>
              <ChevronRight size={16} color={isCurrentYear ? colors.foreground.tertiary : colors.foreground.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          <View style={s.kpiCardBlack}>
            <View style={s.kpiIconRow}>
              <Zap size={14} color="#FFD700" />
              <Text style={s.kpiLabelW}>КОНВЕРСИЯ</Text>
            </View>
            <Text style={s.kpiValueW}>{data?.orders || 0}</Text>
            <Text style={s.kpiSubW}>заказов за {activeDays} {activeDays === 1 ? 'день' : 'дней'}</Text>
            {data && <DeltaBadge value={data.orders_delta} />}
            {bestDay && bestDay.day > 0 && (
              <Text style={s.kpiHighlight}>Пик: {bestDay.day}-е число · ₸{bestDay.amount.toLocaleString()}</Text>
            )}
          </View>
          <View style={s.kpiCardOutline}>
            <View style={s.kpiIconRow}>
              <ShoppingBag size={14} color={colors.foreground.secondary} />
              <Text style={s.kpiLabelB}>СР. ЧЕК</Text>
            </View>
            <Text style={s.kpiValueB}>{data ? formatMoney(data.avg_check) : '—'}</Text>
            <Text style={s.kpiSubB}>выручка {data ? formatMoney(data.revenue) : '—'}</Text>
            {data && <DeltaBadge value={data.revenue_delta} />}
          </View>
        </View>

        {/* Chart */}
        <View style={s.chartSection}>
          <Text style={s.chartTitle}>ПРОДАЖИ ПО ДНЯМ · {MONTHS_RU[month - 1]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chart}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const d = dailyMap.get(day);
                const h = d ? (d.amount / maxAmount) * 100 : 0;
                return (
                  <View key={day} style={s.barCol}>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { height: `${Math.max(h, 2)}%` }, !d && s.barEmpty]} />
                    </View>
                    <Text style={[s.barLabel, d && s.barLabelActive]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Summary hint */}
        <View style={s.hintCard}>
          <Info size={16} color={colors.foreground.tertiary} />
          <View style={s.hintContent}>
            <Text style={s.hintTitle}>Итоги за {MONTHS_RU[month - 1].toLowerCase()} {year}</Text>
            <Text style={s.hintDesc}>
              {data?.orders
                ? `${data.orders} заказов на ₸${data.revenue.toLocaleString()}. Средний чек ₸${data.avg_check.toLocaleString()}.`
                : 'Нет данных за выбранный период.'}
              {data && data.prev_revenue > 0
                ? ` Пред. месяц: ₸${data.prev_revenue.toLocaleString()}.`
                : ''}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  body: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  title: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 2, color: colors.foreground.primary },

  // Period pickers
  periodSection: { flexDirection: 'row', gap: 12 },
  periodPicker: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border.strong },
  arrowBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  periodValue: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  periodText: { fontFamily: fonts.captionMedium, fontSize: 11, letterSpacing: 2, color: colors.foreground.primary },

  // KPI
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCardBlack: { flex: 1, backgroundColor: colors.surface.inverse, padding: 16, gap: 6 },
  kpiCardOutline: { flex: 1, borderWidth: 1, borderColor: colors.border.primary, padding: 16, gap: 6 },
  kpiIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiValueW: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 1, color: colors.foreground.inverse },
  kpiLabelW: { fontFamily: fonts.caption, fontSize: 8, letterSpacing: 1, color: colors.foreground.tertiary },
  kpiSubW: { fontFamily: fonts.body, fontSize: 10, color: '#666' },
  kpiHighlight: { fontFamily: fonts.caption, fontSize: 9, color: '#FFD700', marginTop: 2 },
  kpiValueB: { fontFamily: fonts.heading, fontSize: 28, letterSpacing: 1, color: colors.foreground.primary },
  kpiLabelB: { fontFamily: fonts.caption, fontSize: 8, letterSpacing: 1, color: colors.foreground.secondary },
  kpiSubB: { fontFamily: fonts.body, fontSize: 10, color: colors.foreground.tertiary },

  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deltaText: { fontFamily: fonts.captionMedium, fontSize: 10 },
  deltaZero: { fontFamily: fonts.caption, fontSize: 10, color: '#999' },

  // Chart
  chartSection: { gap: 12 },
  chartTitle: { fontFamily: fonts.caption, fontSize: 10, letterSpacing: 2, color: colors.foreground.secondary },
  chart: { flexDirection: 'row', height: 140, gap: 4, alignItems: 'flex-end', paddingRight: 8 },
  barCol: { width: 24, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: colors.surface.inverse, minHeight: 2 },
  barEmpty: { backgroundColor: colors.surface.card },
  barLabel: { fontFamily: fonts.caption, fontSize: 8, color: colors.foreground.tertiary },
  barLabelActive: { color: colors.foreground.primary },

  // Hint
  hintCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.surface.card, padding: 16 },
  hintContent: { flex: 1, gap: 4 },
  hintTitle: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.foreground.primary },
  hintDesc: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: colors.foreground.tertiary },
});
