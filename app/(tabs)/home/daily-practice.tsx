import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { sendPracticeCompleteNotification } from "@/utils/notifications";
import { Flame, Target, CheckCircle, Trophy, BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";

const TARGET_KEY = "daily_target";
const LOG_KEY = "daily_read_log";
const DEFAULT_TARGET = 3;

const getTodayKey = () => new Date().toISOString().split("T")[0];

function getDateKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function getShortDay(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
}

// ── Circular progress ring built with react-native-svg ────────────────────────
const RING_SIZE = 140;
const STROKE = 11;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * RADIUS;

function CircularProgress({
  percent,
  isComplete,
  todayCount,
  target,
  isDarkMode,
}: {
  percent: number;
  isComplete: boolean;
  todayCount: number;
  target: number;
  isDarkMode: boolean;
}) {
  const offset = CIRCUM - (percent / 100) * CIRCUM;
  const trackColor = isDarkMode ? "#3A3444" : "#F0E8E0";
  const progressStart = isComplete ? "#22C55E" : "#D97706";
  const progressEnd = isComplete ? "#16A34A" : "#8A4D24";

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <Defs>
          <SvgGrad id="prog" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={progressStart} />
            <Stop offset="100%" stopColor={progressEnd} />
          </SvgGrad>
        </Defs>
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="url(#prog)"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUM}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      {/* Center label */}
      <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {isComplete ? (
            <Trophy size={28} color="#22C55E" />
          ) : (
            <>
              <Text style={{ color: isComplete ? "#22C55E" : "#8A4D24", fontSize: 26, fontWeight: "800", lineHeight: 30 }}>
                {percent}%
              </Text>
              <Text style={{ color: isDarkMode ? "#CAC4D0" : "#625B71", fontSize: 11, marginTop: 2 }}>
                {todayCount}/{target}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DailyPracticeScreen() {
  const { isDarkMode } = useTheme();
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [weekHistory, setWeekHistory] = useState<{ day: string; met: boolean; count: number }[]>([]);

  const p = useMemo(
    () => ({
      bg: isDarkMode ? "#1C1B1F" : "#FFF8F1",
      card: isDarkMode ? "#2B2930" : "#FFFDF9",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      sub: isDarkMode ? "#CAC4D0" : "#625B71",
      border: isDarkMode ? "#4A4458" : "#E8D5C4",
      accent: "#8A4D24",
      iconBg: isDarkMode ? "#3A3444" : "#FFF1E6",
    }),
    [isDarkMode]
  );

  const calculateStreak = (log: Record<string, any[]>, tgt: number): number => {
    const dates = Object.keys(log).sort().reverse();
    let s = 0;
    for (const date of dates) {
      if ((log[date] ?? []).length >= tgt) s++;
      else break;
    }
    return s;
  };

  const load = useCallback(async () => {
    const today = getTodayKey();
    const [rawLog, rawTarget] = await Promise.all([
      AsyncStorage.getItem(LOG_KEY),
      AsyncStorage.getItem(TARGET_KEY),
    ]);

    const log: Record<string, any[]> = rawLog ? JSON.parse(rawLog) : {};
    const tgt = rawTarget ? Number(rawTarget) : DEFAULT_TARGET;

    setTarget(tgt);

    const count = (log[today] ?? []).length;
    setTodayCount(count);
    setStreak(calculateStreak(log, tgt));

    // Last 7 days history (oldest → newest)
    const history = Array.from({ length: 7 }, (_, i) => {
      const key = getDateKey(6 - i);
      const reads = (log[key] ?? []).length;
      return { day: getShortDay(6 - i), met: reads >= tgt, count: reads };
    });
    setWeekHistory(history);

    if (count >= tgt) {
      await sendPracticeCompleteNotification();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateTarget = async (value: number) => {
    setTarget(value);
    await AsyncStorage.setItem(TARGET_KEY, String(value));
  };

  const percent = Math.min(100, Math.round((todayCount / target) * 100));
  const isComplete = todayCount >= target;
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFF3E8"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Page header ── */}
        <View style={styles.pageHeader}>
          <View style={[styles.pageIconWrap, { backgroundColor: p.iconBg }]}>
            <BookOpen size={22} color={p.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: p.text }]}>Daily Practice</Text>
            <Text style={[styles.pageSubtitle, { color: p.sub }]}>
              Set your goal and build a streak
            </Text>
          </View>
        </View>

        {/* ── Today's Progress (ring + streak side by side) ── */}
        <View style={[styles.card, { backgroundColor: p.card, borderColor: isComplete ? "#22C55E" : p.border }]}>
          <Text style={[styles.cardLabel, { color: p.text }]}>Today's Progress</Text>

          <View style={styles.progressRow}>
            {/* Circular ring */}
            <CircularProgress
              percent={percent}
              isComplete={isComplete}
              todayCount={todayCount}
              target={target}
              isDarkMode={isDarkMode}
            />

            {/* Stats column */}
            <View style={styles.statsCol}>
              <View style={[styles.statPill, { backgroundColor: p.iconBg, borderColor: p.border }]}>
                <Flame size={16} color="#E67E22" />
                <Text style={[styles.statPillValue, { color: p.text }]}>{streak}</Text>
                <Text style={[styles.statPillLabel, { color: p.sub }]}>day streak</Text>
              </View>

              <View style={[styles.statPill, { backgroundColor: isComplete ? (isDarkMode ? "#14532D30" : "#DCFCE7") : p.iconBg, borderColor: isComplete ? "#22C55E" : p.border }]}>
                <Target size={16} color={isComplete ? "#22C55E" : p.accent} />
                <Text style={[styles.statPillValue, { color: isComplete ? "#22C55E" : p.text }]}>
                  {todayCount}/{target}
                </Text>
                <Text style={[styles.statPillLabel, { color: p.sub }]}>verses</Text>
              </View>

              {isComplete && (
                <View style={styles.completeBadge}>
                  <Text style={styles.completeBadgeText}>✓ Done!</Text>
                </View>
              )}
            </View>
          </View>

          {isComplete && (
            <View style={[styles.completeBanner, { backgroundColor: isDarkMode ? "#22C55E18" : "#DCFCE7" }]}>
              <Trophy size={16} color="#22C55E" />
              <Text style={styles.completeBannerText}>
                Daily mission complete — beautiful consistency!
              </Text>
            </View>
          )}
        </View>

        {/* ── Weekly History ── */}
        <View style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardLabel, { color: p.text }]}>This Week</Text>
            <Text style={[styles.cardHint, { color: p.sub }]}>
              {weekHistory.filter((d) => d.met).length}/7 days met
            </Text>
          </View>
          <View style={styles.weekRow}>
            {weekHistory.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: d.met
                        ? isDarkMode ? "#22C55E25" : "#DCFCE7"
                        : isDarkMode ? "#3A3444" : "#F3EDF7",
                      borderColor: d.met ? "#22C55E" : p.border,
                    },
                  ]}
                >
                  {d.met ? (
                    <CheckCircle size={14} color="#22C55E" />
                  ) : (
                    <Text style={[styles.dayDotNum, { color: p.sub }]}>
                      {d.count > 0 ? d.count : ""}
                    </Text>
                  )}
                </View>
                <Text style={[styles.dayLabel, { color: p.sub }]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily Target ── */}
        <View style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.targetHeaderLeft}>
              <View style={[styles.targetIconWrap, { backgroundColor: "#8A4D2420" }]}>
                <Target size={16} color="#8A4D24" />
              </View>
              <View>
                <Text style={[styles.cardLabel, { color: p.text }]}>Daily Target</Text>
                <Text style={[styles.cardHint, { color: p.sub }]}>
                  {target} verse{target !== 1 ? "s" : ""} per day
                </Text>
              </View>
            </View>
          </View>

          <FlatList
            data={numbers}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => {
              const active = item === target;
              return (
                <TouchableOpacity
                  onPress={() => updateTarget(item)}
                  activeOpacity={0.75}
                  style={[
                    styles.targetPill,
                    {
                      backgroundColor: active ? p.accent : (isDarkMode ? "#3A3444" : "#F3EDF7"),
                      borderColor: active ? p.accent : p.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.targetPillText,
                      { color: active ? "#fff" : p.text, fontWeight: active ? "800" : "500" },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── Motivational note ── */}
        <Text style={[styles.motiveLine, { color: p.sub }]}>
          "Small daily improvements lead to stunning long-term results."
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 130 },

  // Page header
  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  pageIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSubtitle: { fontSize: 13, marginTop: 1 },

  // Cards
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: { fontSize: 16, fontWeight: "700" },
  cardHint: { fontSize: 12, marginTop: 2 },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  // Progress ring + stats
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  statsCol: { flex: 1, paddingLeft: 20, gap: 10 },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  statPillValue: { fontSize: 15, fontWeight: "800" },
  statPillLabel: { fontSize: 11 },
  completeBadge: {
    backgroundColor: "#22C55E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  completeBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  completeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  completeBannerText: { color: "#22C55E", fontWeight: "600", fontSize: 13, flex: 1 },

  // Week history
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 5 },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  dayDotNum: { fontSize: 11, fontWeight: "600" },
  dayLabel: { fontSize: 10, fontWeight: "600" },

  // Target selector
  targetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  targetIconWrap: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  targetPill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 9,
    borderWidth: 1,
  },
  targetPillText: { fontSize: 15 },

  // Motivational
  motiveLine: { textAlign: "center", fontSize: 12, fontStyle: "italic", opacity: 0.7, marginTop: 4 },
});
