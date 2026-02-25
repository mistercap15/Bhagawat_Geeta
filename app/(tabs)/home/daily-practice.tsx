import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import {
  Flame,
  Target,
  CheckCircle,
  Trophy,
  BookOpen,
  Minus,
  Plus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const TARGET_KEY = "daily_target";
const LOG_KEY = "daily_read_log";
const DEFAULT_TARGET = 3;
const MIN_TARGET = 1;
const MAX_TARGET = 20;

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

// ── Circular progress ring ────────────────────────────────────────────────────
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
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: RING_SIZE,
        height: RING_SIZE,
      }}
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      >
        <Defs>
          <SvgGrad id="prog" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={progressStart} />
            <Stop offset="100%" stopColor={progressEnd} />
          </SvgGrad>
        </Defs>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
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
      <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {isComplete ? (
            <Trophy size={28} color="#22C55E" />
          ) : (
            <>
              <Text
                style={{
                  color: "#8A4D24",
                  fontSize: 26,
                  fontWeight: "800",
                  lineHeight: 30,
                }}
              >
                {percent}%
              </Text>
              <Text
                style={{
                  color: isDarkMode ? "#CAC4D0" : "#625B71",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {todayCount}/{target}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CUSTOM SLIDER — replaces the number pill FlatList
//  Features: draggable thumb, gradient fill, tick marks, +/- stepper buttons
// ══════════════════════════════════════════════════════════════════════════════
const THUMB_SIZE = 34;
const TRACK_HEIGHT = 6;

function TargetSlider({
  value,
  onChange,
  isDarkMode,
  palette,
}: {
  value: number;
  onChange: (v: number) => void;
  isDarkMode: boolean;
  palette: any;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const lastHapticValue = useRef(value);
  const thumbScale = useSharedValue(1);
  const thumbGlow = useSharedValue(0);

  const valueToX = (v: number) => {
    if (trackWidth <= 0) return 0;
    return ((v - MIN_TARGET) / (MAX_TARGET - MIN_TARGET)) * trackWidth;
  };

  const xToValue = (x: number) => {
    if (trackWidth <= 0) return MIN_TARGET;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    return Math.round(ratio * (MAX_TARGET - MIN_TARGET) + MIN_TARGET);
  };

  const fillPercent =
    ((value - MIN_TARGET) / (MAX_TARGET - MIN_TARGET)) * 100;

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const fireHaptic = (newVal: number) => {
    if (newVal !== lastHapticValue.current) {
      lastHapticValue.current = newVal;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          thumbScale.value = withSpring(1.25, {
            damping: 8,
            stiffness: 300,
          });
          thumbGlow.value = withTiming(1, { duration: 200 });
        },
        onPanResponderMove: (_evt, gestureState) => {
          const relativeX = gestureState.dx + valueToX(value);
          const newVal = xToValue(relativeX);
          if (newVal !== value) {
            fireHaptic(newVal);
            onChange(newVal);
          }
        },
        onPanResponderRelease: () => {
          thumbScale.value = withSpring(1, { damping: 10, stiffness: 250 });
          thumbGlow.value = withTiming(0, { duration: 300 });
        },
      }),
    [trackWidth, value, onChange],
  );

  const handleTrackPress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const newVal = xToValue(x);
    if (newVal !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange(newVal);
      thumbScale.value = withSequence(
        withTiming(1.3, { duration: 80 }),
        withSpring(1, { damping: 8, stiffness: 250 }),
      );
    }
  };

  const thumbAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const thumbGlowStyle = useAnimatedStyle(() => ({
    opacity: thumbGlow.value * 0.35,
    transform: [
      {
        scale: interpolate(
          thumbGlow.value,
          [0, 1],
          [1, 2],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const handleDecrement = () => {
    if (value > MIN_TARGET) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < MAX_TARGET) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value + 1);
    }
  };

  const ticks = [1, 5, 10, 15, 20];

  return (
    <View style={sliderStyles.container}>
      {/* Current value display with +/- steppers */}
      <View style={sliderStyles.valueRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          activeOpacity={0.7}
          style={[
            sliderStyles.stepButton,
            {
              backgroundColor: isDarkMode ? "#3A3444" : "#F3EDF7",
              borderColor: palette.border,
              opacity: value <= MIN_TARGET ? 0.4 : 1,
            },
          ]}
          disabled={value <= MIN_TARGET}
        >
          <Minus size={16} color={palette.accent} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={sliderStyles.valueCenter}>
          <Text style={[sliderStyles.valueNumber, { color: palette.accent }]}>
            {value}
          </Text>
          <Text style={[sliderStyles.valueLabel, { color: palette.sub }]}>
            verse{value !== 1 ? "s" : ""} / day
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          activeOpacity={0.7}
          style={[
            sliderStyles.stepButton,
            {
              backgroundColor: isDarkMode ? "#3A3444" : "#F3EDF7",
              borderColor: palette.border,
              opacity: value >= MAX_TARGET ? 0.4 : 1,
            },
          ]}
          disabled={value >= MAX_TARGET}
        >
          <Plus size={16} color={palette.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Slider track */}
      <View style={sliderStyles.trackOuter}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTrackPress}
          onLayout={handleTrackLayout}
          style={[
            sliderStyles.track,
            {
              backgroundColor: isDarkMode ? "#3A3444" : "#F0E8E0",
            },
          ]}
        >
          {/* Filled gradient portion */}
          <View
            style={[
              sliderStyles.trackFill,
              { width: `${fillPercent}%` },
            ]}
          >
            <LinearGradient
              colors={["#D97706", "#8A4D24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </TouchableOpacity>

        {/* Draggable thumb */}
        {trackWidth > 0 && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              sliderStyles.thumbWrapper,
              { left: valueToX(value) - THUMB_SIZE / 2 },
              thumbAnimStyle,
            ]}
          >
            <Animated.View
              style={[
                sliderStyles.thumbGlow,
                { backgroundColor: palette.accent },
                thumbGlowStyle,
              ]}
            />
            <View
              style={[
                sliderStyles.thumb,
                {
                  backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
                  borderColor: palette.accent,
                  shadowColor: palette.accent,
                },
              ]}
            >
              <View
                style={[
                  sliderStyles.thumbDot,
                  { backgroundColor: palette.accent },
                ]}
              />
            </View>
          </Animated.View>
        )}
      </View>

      {/* Tick labels */}
      <View style={sliderStyles.tickRow}>
        {ticks.map((t) => {
          const pos =
            ((t - MIN_TARGET) / (MAX_TARGET - MIN_TARGET)) * 100;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.7}
              onPress={() => {
                if (t !== value) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onChange(t);
                }
              }}
              style={[sliderStyles.tickItem, { left: `${pos}%` }]}
            >
              <View
                style={[
                  sliderStyles.tickMark,
                  {
                    backgroundColor:
                      t <= value
                        ? palette.accent
                        : isDarkMode
                          ? "#4A4458"
                          : "#D4C4B0",
                  },
                ]}
              />
              <Text
                style={[
                  sliderStyles.tickLabel,
                  {
                    color: t === value ? palette.accent : palette.sub,
                    fontWeight: t === value ? "800" : "500",
                  },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 20,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  valueCenter: {
    alignItems: "center",
    minWidth: 80,
  },
  valueNumber: {
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },
  valueLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  trackOuter: {
    position: "relative",
    height: THUMB_SIZE + 8,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  thumbWrapper: {
    position: "absolute",
    top: (THUMB_SIZE + 8 - THUMB_SIZE) / 2 - TRACK_HEIGHT / 2 + 1,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbGlow: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  thumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tickRow: {
    position: "relative",
    height: 30,
    marginTop: 6,
    marginHorizontal: 2,
  },
  tickItem: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -10,
    width: 20,
  },
  tickMark: {
    width: 2,
    height: 6,
    borderRadius: 1,
    marginBottom: 3,
  },
  tickLabel: {
    fontSize: 10,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function DailyPracticeScreen() {
  const { isDarkMode } = useTheme();
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [weekHistory, setWeekHistory] = useState<
    { day: string; met: boolean; count: number }[]
  >([]);

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
    [isDarkMode],
  );

  const calculateStreak = (
    log: Record<string, any[]>,
    tgt: number,
  ): number => {
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

    const history = Array.from({ length: 7 }, (_, i) => {
      const key = getDateKey(6 - i);
      const reads = (log[key] ?? []).length;
      return { day: getShortDay(6 - i), met: reads >= tgt, count: reads };
    });
    setWeekHistory(history);

    // NOTE: Goal completion notification now triggers from verse_details.tsx
    // when user marks a verse as read — no longer from this screen.
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const updateTarget = async (value: number) => {
    const clamped = Math.max(MIN_TARGET, Math.min(MAX_TARGET, value));
    setTarget(clamped);
    await AsyncStorage.setItem(TARGET_KEY, String(clamped));
  };

  const percent = Math.min(100, Math.round((todayCount / target) * 100));
  const isComplete = todayCount >= target;

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
            <Text style={[styles.pageTitle, { color: p.text }]}>
              Daily Practice
            </Text>
            <Text style={[styles.pageSubtitle, { color: p.sub }]}>
              Set your goal and build a streak
            </Text>
          </View>
        </View>

        {/* ── Today's Progress ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: p.card,
              borderColor: isComplete ? "#22C55E" : p.border,
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: p.text }]}>
            Today's Progress
          </Text>

          <View style={styles.progressRow}>
            <CircularProgress
              percent={percent}
              isComplete={isComplete}
              todayCount={todayCount}
              target={target}
              isDarkMode={isDarkMode}
            />

            <View style={styles.statsCol}>
              <View
                style={[
                  styles.statPill,
                  { backgroundColor: p.iconBg, borderColor: p.border },
                ]}
              >
                <Flame size={16} color="#E67E22" />
                <Text style={[styles.statPillValue, { color: p.text }]}>
                  {streak}
                </Text>
                <Text style={[styles.statPillLabel, { color: p.sub }]}>
                  day streak
                </Text>
              </View>

              <View
                style={[
                  styles.statPill,
                  {
                    backgroundColor: isComplete
                      ? isDarkMode
                        ? "#14532D30"
                        : "#DCFCE7"
                      : p.iconBg,
                    borderColor: isComplete ? "#22C55E" : p.border,
                  },
                ]}
              >
                <Target size={16} color={isComplete ? "#22C55E" : p.accent} />
                <Text
                  style={[
                    styles.statPillValue,
                    { color: isComplete ? "#22C55E" : p.text },
                  ]}
                >
                  {todayCount}/{target}
                </Text>
                <Text style={[styles.statPillLabel, { color: p.sub }]}>
                  verses
                </Text>
              </View>

              {isComplete && (
                <View style={styles.completeBadge}>
                  <Text style={styles.completeBadgeText}>✓ Done!</Text>
                </View>
              )}
            </View>
          </View>

          {isComplete && (
            <View
              style={[
                styles.completeBanner,
                { backgroundColor: isDarkMode ? "#22C55E18" : "#DCFCE7" },
              ]}
            >
              <Trophy size={16} color="#22C55E" />
              <Text style={styles.completeBannerText}>
                Daily mission complete — beautiful consistency!
              </Text>
            </View>
          )}
        </View>

        {/* ── Weekly History ── */}
        <View
          style={[
            styles.card,
            { backgroundColor: p.card, borderColor: p.border },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardLabel, { color: p.text }]}>
              This Week
            </Text>
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
                        ? isDarkMode
                          ? "#22C55E25"
                          : "#DCFCE7"
                        : isDarkMode
                          ? "#3A3444"
                          : "#F3EDF7",
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
                <Text style={[styles.dayLabel, { color: p.sub }]}>
                  {d.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily Target — SLIDER ── */}
        <View
          style={[
            styles.card,
            { backgroundColor: p.card, borderColor: p.border },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.targetHeaderLeft}>
              <View
                style={[
                  styles.targetIconWrap,
                  { backgroundColor: "#8A4D2420" },
                ]}
              >
                <Target size={16} color="#8A4D24" />
              </View>
              <View>
                <Text style={[styles.cardLabel, { color: p.text }]}>
                  Daily Target
                </Text>
                <Text style={[styles.cardHint, { color: p.sub }]}>
                  Slide or tap to set your goal
                </Text>
              </View>
            </View>
          </View>

          <TargetSlider
            value={target}
            onChange={updateTarget}
            isDarkMode={isDarkMode}
            palette={p}
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

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  pageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSubtitle: { fontSize: 13, marginTop: 1 },

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

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
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
  completeBannerText: {
    color: "#22C55E",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },

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

  targetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  targetIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  motiveLine: {
    textAlign: "center",
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.7,
    marginTop: 4,
  },
});