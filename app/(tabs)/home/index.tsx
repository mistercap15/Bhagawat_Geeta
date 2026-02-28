import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { useAchievements } from "@/context/AchievementContext";
import { getUserRank } from "@/utils/achievements";
import {
  Share2,
  BookOpen,
  Star,
  Sparkles,
  Target,
  Trophy,
  Heart,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { getSlok } from "@/utils/gitaData";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaterialLoader from "@/components/MaterialLoader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import homeLogo from "../../../assets/images/splashScreen.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 54) / 2; // 2 cols, 20px side margins, 14px gap

const NAV_ITEMS = [
  {
    icon: BookOpen,
    labelKey: "readChapters" as const,
    subKey: "readChaptersSub" as const,
    route: "/(tabs)/home/chapters",
    gradient: ["#FF6B35", "#F7931E"] as [string, string],
  },
  {
    icon: Star,
    labelKey: "favorites" as const,
    subKey: "favoritesSub" as const,
    route: "/(tabs)/home/favorite",
    gradient: ["#F7971E", "#FFD200"] as [string, string],
  },
  {
    icon: Sparkles,
    labelKey: "continueReading" as const,
    subKey: "continueReadingSub" as const,
    route: "/(tabs)/home/continue-reading",
    gradient: ["#1565C0", "#1DA1F2"] as [string, string],
  },
  {
    icon: Target,
    labelKey: "dailyPractice" as const,
    subKey: "dailyPracticeSub" as const,
    route: "/(tabs)/home/daily-practice",
    gradient: ["#11998E", "#38EF7D"] as [string, string],
  },
  {
    icon: Trophy,
    labelKey: "myJourney" as const,
    subKey: "myJourneySub" as const,
    route: "/(tabs)/home/achievements",
    gradient: ["#F09819", "#EDDE5D"] as [string, string],
  },
  {
    icon: Heart,
    labelKey: "guidance" as const,
    subKey: "guidanceSub" as const,
    route: "/(tabs)/home/guidance",
    gradient: ["#F9844A", "#D62828"] as [string, string],
  },
];

export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const { userStats, unlockedAchievements } = useAchievements();
  const viewRef = useRef<View>(null);
  const insets = useSafeAreaInsets();

  const currentRank = getUserRank(userStats.totalVersesRead);

  function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return t.greetingMorning;
    if (h < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  }

// Theme colours — dark mode uses deep midnight navy (Krishna blue), not purple
  const c = {
    bg: isDarkMode ? "#040C18" : "#FFF3DC",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    border: isDarkMode ? "#1A3550" : "#F0D080",
    accent: isDarkMode ? "#FFB347" : "#8A2B06",
  };

  const heroColors = isDarkMode
    ? (["#040C18", "#071E38", "#0A3260"] as const)
    : (["#7B1E00", "#C4540A", "#E8860C"] as const);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const VERSE_COUNTS: Record<number, number> = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28,
    9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20,
    16: 24, 17: 28, 18: 78,
  };

  const fetchShloka = async () => {
    setLoading(true);
    setError(false);
    const ch = Math.floor(Math.random() * 18) + 1;
    const v = Math.floor(Math.random() * VERSE_COUNTS[ch]) + 1;
    try {
      const data = await getSlok(ch, v);
      if (!data) throw new Error("not found");
      setShlokaOfTheDay({
        chapter: data.chapter,
        verse: data.verse,
        text: data.slok,
        translation: data.tej.ht,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShloka(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShloka();
    setRefreshing(false);
  };

  // ── Sharing ────────────────────────────────────────────────────────────────
  const shareShloka = async () => {
    try {
      if (!viewRef.current) {
        Toast.show({ type: "error", text1: "Unable to capture verse. Please try again." });
        return;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({ type: "error", text1: "Sharing not supported on this device" });
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      const base64 = await captureRef(viewRef, { format: "png", quality: 1, result: "base64" });
      const fileUri = `${FileSystem.cacheDirectory}shloka_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: "image/png", dialogTitle: "Share Shloka", UTI: "public.png" });
      Toast.show({ type: "success", text1: "Shloka Shared!", text2: "Spreading divine wisdom 🙏" });
    } catch (err) {
      console.error("Share error:", err);
      Toast.show({ type: "error", text1: "Could not share. Please try again." });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={styles.root}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB347" />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            HERO BANNER
        ═══════════════════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={heroColors}
          style={[styles.hero, { paddingTop: insets.top + 28 }]}
        >
          {/* Large translucent OM watermark */}
          <Text style={styles.omWatermark}>ॐ</Text>

          {/* Soft decorative circles for depth */}
          <View style={[styles.decorCircle, styles.decorCircleTop]} />
          <View style={[styles.decorCircle, styles.decorCircleBottom]} />

          {/* Greeting pill */}
          <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.greetPill}>
            <Text style={styles.greetPillText}>{getGreeting()}</Text>
            <Text style={{ fontSize: 16 }}>🙏</Text>
          </Animated.View>

          {/* App logo inside glowing ring */}
          <Animated.View entering={FadeInDown.duration(500).delay(110)} style={styles.logoRing}>
            <Image source={homeLogo} style={styles.heroLogo} />
          </Animated.View>

          {/* Title + tagline */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(160)}
            style={{ alignItems: "center" }}
          >
            <Text style={styles.heroTitle}>{t.appTitle}</Text>
            <Text style={styles.heroTagline}>{t.appTagline}</Text>
          </Animated.View>

          {/* Ornamental divider */}
          <Animated.View entering={FadeInDown.duration(400).delay(210)} style={styles.heroOrn}>
            <View style={styles.heroOrnLine} />
            <Text style={styles.heroOrnGlyph}>✦  ✦  ✦</Text>
            <View style={styles.heroOrnLine} />
          </Animated.View>
        </LinearGradient>

        {/* ═══════════════════════════════════════════════════════════════════
            FLOATING STATS ROW  (overlaps the hero bottom by 28 pt)
        ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(230)}
          style={styles.statsRow}
        >
          {[
            { emoji: currentRank.emoji, value: currentRank.title, label: "Rank", color: currentRank.color },
            { emoji: "📖", value: String(userStats.totalVersesRead), label: "Verses", color: c.text },
            { emoji: "🔥", value: String(userStats.currentStreak), label: "Streak", color: "#E8540A" },
            { emoji: "🏆", value: String(unlockedAchievements.length), label: "Badges", color: "#D97706" },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.75}
              onPress={() => router.push("/(tabs)/home/achievements" as any)}
              style={[styles.statChip, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: c.sub }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SHLOKA OF THE DAY
        ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(500).delay(290)} style={styles.section}>
          {/* collapsable={false} is critical on Android so captureRef works */}
          <View
            ref={viewRef}
            collapsable={false}
            style={[styles.shlokaCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            {/* Gradient header bar */}
            <LinearGradient
              colors={["#8A4D24", "#D97706", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shlokaHeader}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <Sparkles size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.shlokaHeaderLabel}>{t.shlokaOfTheDay}</Text>
              </View>
              {shlokaOfTheDay && (
                <View style={styles.shlokaHeaderBadge}>
                  <Text style={styles.shlokaHeaderBadgeText}>
                    {shlokaOfTheDay.chapter}:{shlokaOfTheDay.verse}
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* Body */}
            {loading ? (
              <View style={{ paddingVertical: 32 }}>
                <MaterialLoader size="large" />
              </View>
            ) : error ? (
              <Text style={[styles.shlokaErrorText, { color: c.sub }]}>
                {t.pullToRefresh}
              </Text>
            ) : shlokaOfTheDay ? (
              <View style={styles.shlokaBody}>
                <Text style={[styles.shlokText, { color: c.text }]}>
                  {shlokaOfTheDay.text}
                </Text>

                <View style={styles.shlokaDivider}>
                  <View style={[styles.shlokaDivLine, {
                    backgroundColor: isDarkMode ? "#1A3550" : "#E8D5B0",
                  }]} />
                  <Text style={[styles.shlokaDivGlyph, { color: isDarkMode ? "#FFB347" : "#D97706" }]}>
                    ❋
                  </Text>
                  <View style={[styles.shlokaDivLine, {
                    backgroundColor: isDarkMode ? "#1A3550" : "#E8D5B0",
                  }]} />
                </View>

                <Text style={[styles.translationText, { color: c.sub }]}>
                  {shlokaOfTheDay.translation}
                </Text>

                <TouchableOpacity
                  onPress={shareShloka}
                  activeOpacity={0.75}
                  style={styles.shareRow}
                >
                  <Share2 size={13} color={c.accent} />
                  <Text style={[styles.shareBtnText, { color: c.accent }]}>
                    {t.shareVerse}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            NAVIGATION GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t.beginJourney}</Text>

          <View style={styles.navGrid}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.labelKey}
                  activeOpacity={0.82}
                  onPress={() => router.push(item.route as any)}
                  style={[styles.navCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  {/* Gradient icon area */}
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.navIconArea}
                  >
                    <Icon size={28} color="#FFFFFF" strokeWidth={1.8} />
                  </LinearGradient>

                  {/* Text area */}
                  <View style={styles.navTextArea}>
                    <Text style={[styles.navLabel, { color: c.text }]} numberOfLines={1}>
                      {t[item.labelKey]}
                    </Text>
                    <Text style={[styles.navSub, { color: c.sub }]} numberOfLines={2}>
                      {t[item.subKey]}
                    </Text>
                  </View>

                  <ChevronRight
                    size={13}
                    color={c.sub}
                    style={{ position: "absolute", bottom: 14, right: 12 }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(600).delay(410)} style={styles.footer}>
          <View style={styles.footerDivRow}>
            <LinearGradient
              colors={["transparent", isDarkMode ? "#1A3550" : "#E8D5C4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerDivLine}
            />
            <Text style={[styles.footerDivDot, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
              ✦
            </Text>
            <LinearGradient
              colors={[isDarkMode ? "#1A3550" : "#E8D5C4", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerDivLine}
            />
          </View>

          <Text style={[styles.footerOm, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>ॐ</Text>

          <Text style={[styles.footerCredit, { color: c.sub }]}>
            Crafted with ❤️ by{" "}
            <Text style={[styles.footerName, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
              Khilan Patel
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    paddingBottom: 52,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    overflow: "hidden",
    position: "relative",
  },
  omWatermark: {
    position: "absolute",
    bottom: -40,
    right: -8,
    fontSize: 230,
    fontWeight: "800",
    color: "rgba(255,255,255,0.06)",
    letterSpacing: -12,
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
  },
  decorCircleTop: {
    width: 220,
    height: 220,
    top: -90,
    left: -80,
    opacity: 0.06,
  },
  decorCircleBottom: {
    width: 150,
    height: 150,
    bottom: 10,
    left: -50,
    opacity: 0.05,
  },
  greetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    marginBottom: 18,
  },
  greetPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.8,
  },
  logoRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.32)",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroLogo: { width: "100%", height: "100%", resizeMode: "contain" },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroTagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  heroOrn: {
    flexDirection: "row",
    alignItems: "center",
    width: "65%",
    marginTop: 22,
    gap: 8,
  },
  heroOrnLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.28)" },
  heroOrnGlyph: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    letterSpacing: 5,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: -26,
    marginBottom: 26,
    gap: 8,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  statEmoji: { fontSize: 20, marginBottom: 5 },
  statValue: { fontSize: 13, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  // ── Shared section ────────────────────────────────────────────────────────
  section: { marginHorizontal: 20, marginBottom: 26 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14, letterSpacing: 0.2 },

  // ── Shloka card ───────────────────────────────────────────────────────────
  shlokaCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  shlokaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  shlokaHeaderLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  shlokaHeaderBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shlokaHeaderBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  shlokaBody: { padding: 18 },
  shlokaErrorText: { textAlign: "center", padding: 32, fontSize: 14 },
  shlokText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 30,
    fontStyle: "italic",
  },
  shlokaDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  shlokaDivLine: { flex: 1, height: 1 },
  shlokaDivGlyph: { fontSize: 16 },
  translationText: { fontSize: 14, lineHeight: 23 },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 14,
  },
  shareBtnText: { fontSize: 13, fontWeight: "700" },

  // ── Nav grid ──────────────────────────────────────────────────────────────
  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  navCard: {
    width: CARD_W,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },
  navIconArea: {
    height: 84,
    justifyContent: "center",
    alignItems: "center",
  },
  navTextArea: {
    padding: 14,
    paddingBottom: 36,
  },
  navLabel: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  navSub: { fontSize: 12, lineHeight: 17 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  footerDivRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  footerDivLine: { flex: 1, height: 1 },
  footerDivDot: { fontSize: 12, marginHorizontal: 12 },
  footerOm: { fontSize: 28, fontWeight: "700", marginBottom: 10, letterSpacing: 1 },
  footerCredit: { fontSize: 13, letterSpacing: 0.4 },
  footerName: { fontSize: 13, fontWeight: "600" },
});
