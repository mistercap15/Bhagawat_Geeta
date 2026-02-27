import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
  Image,
  StyleSheet,
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
import homeLogo from "../../../assets/images/splashScreen.png";

const NAV_ITEM_CONFIGS = [
  {
    icon: BookOpen,
    labelKey: "readChapters" as const,
    subKey: "readChaptersSub" as const,
    route: "/(tabs)/home/chapters",
    color: "#E8913A",
    bg: "#FFF1E6",
    bgDark: "#3A2E1E",
  },
  {
    icon: Star,
    labelKey: "favorites" as const,
    subKey: "favoritesSub" as const,
    route: "/(tabs)/home/favorite",
    color: "#D97706",
    bg: "#FFFBEB",
    bgDark: "#3A2F10",
  },
  {
    icon: Sparkles,
    labelKey: "continueReading" as const,
    subKey: "continueReadingSub" as const,
    route: "/(tabs)/home/continue-reading",
    color: "#3B82F6",
    bg: "#EFF6FF",
    bgDark: "#1E2A3A",
  },
  {
    icon: Target,
    labelKey: "dailyPractice" as const,
    subKey: "dailyPracticeSub" as const,
    route: "/(tabs)/home/daily-practice",
    color: "#22C55E",
    bg: "#F0FDF4",
    bgDark: "#1A2E1E",
  },
  {
    icon: Trophy,
    labelKey: "myJourney" as const,
    subKey: "myJourneySub" as const,
    route: "/(tabs)/home/achievements",
    color: "#F59E0B",
    bg: "#FFFBEB",
    bgDark: "#2E2810",
  },
  {
    icon: Heart,
    labelKey: "guidance" as const,
    subKey: "guidanceSub" as const,
    route: "/(tabs)/home/guidance",
    color: "#A855F7",
    bg: "#FAF5FF",
    bgDark: "#2A1A3E",
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

  const currentRank = getUserRank(userStats.totalVersesRead);

  function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return t.greetingMorning;
    if (h < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  }

  const c = {
    bg: isDarkMode ? "#1C1B1F" : "#FFF8F1",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
    accent: "#8A4D24",
  };

  const fetchShloka = async () => {
    setLoading(true);
    setError(false);
    const versesCount: Record<number, number> = {
      1: 47,
      2: 72,
      3: 43,
      4: 42,
      5: 29,
      6: 47,
      7: 30,
      8: 28,
      9: 34,
      10: 42,
      11: 55,
      12: 20,
      13: 35,
      14: 27,
      15: 20,
      16: 24,
      17: 28,
      18: 78,
    };
    const ch = Math.floor(Math.random() * 18) + 1;
    const v = Math.floor(Math.random() * versesCount[ch]) + 1;
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

  useEffect(() => {
    fetchShloka();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShloka();
    setRefreshing(false);
  };

  const shareShloka = async () => {
    try {
      if (!viewRef.current) {
        Toast.show({
          type: "error",
          text1: "Unable to capture verse. Please try again.",
        });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "error",
          text1: "Sharing not supported on this device",
        });
        return;
      }

      // Give the UI time to settle before capturing
      await new Promise((r) => setTimeout(r, 500));

      // FIX 1: Use base64 result instead of tmpfile.
      // On real Android devices, tmpfile paths from captureRef can be
      // inaccessible to other apps due to scoped storage restrictions.
      const base64 = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });

      // FIX 2: Write to a known cache directory path with proper file extension.
      // This ensures the file URI is valid and accessible for sharing intents.
      const filename = `shloka_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // FIX 3: Use proper mimeType for Android share intent
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: "Share Shloka",
        UTI: "public.png", // for iOS
      });

      Toast.show({
        type: "success",
        text1: "Shloka Shared!",
        text2: "Spreading divine wisdom 🙏",
      });
    } catch (err) {
      console.error("Share error:", err);
      Toast.show({
        type: "error",
        text1: "Could not share. Please try again.",
      });
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Header ── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(50)}
          style={styles.headerWrap}
        >
          <Image source={homeLogo} style={styles.logo} />
          <Text style={[styles.greetLabel, { color: c.sub }]}>
            {getGreeting().toUpperCase()}
          </Text>
          <Text style={[styles.appTitle, { color: c.text }]}>
            {t.appTitle}
          </Text>
          <Text style={[styles.appTagline, { color: c.sub }]}>
            {t.appTagline}
          </Text>
        </Animated.View>

        {/* ── Rank & Achievements strip ── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(120)}
          style={styles.rankStrip}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/home/achievements" as any)}
            style={[styles.rankStripInner, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <LinearGradient
              colors={["#8A4D2422", "#D9770622", "#F59E0B22"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
            />
            <Text style={styles.rankEmoji}>{currentRank.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rankName, { color: currentRank.color }]}>
                {currentRank.title}
              </Text>
              <Text style={[styles.rankSub, { color: c.sub }]}>
                {userStats.totalVersesRead} verses · {unlockedAchievements.length} badges
              </Text>
            </View>
            <View style={[styles.rankBadgeCount, { backgroundColor: "#D97706" + "22" }]}>
              <Trophy size={12} color="#D97706" />
              <Text style={[styles.rankBadgeCountText, { color: "#D97706" }]}>
                {unlockedAchievements.length}
              </Text>
            </View>
            <ChevronRight size={16} color={c.sub} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Shloka of the Day ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          {/* FIX 4: The capturable View is now a plain RN View (NOT inside
              Animated.View's ref chain). collapsable={false} is critical on
              Android — it prevents the native framework from optimizing away
              the view, which would make captureRef fail silently. */}
          <View
            ref={viewRef}
            collapsable={false}
            style={[
              styles.shlokaCard,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                shadowOpacity: isDarkMode ? 0.35 : 0.1,
              },
            ]}
          >
            {/* Gold accent top bar */}
            <LinearGradient
              colors={["#8A4D24", "#D97706", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentBar}
            />

            <View style={styles.shlokaInner}>
              {/* Card header row */}
              <View style={styles.shlokaHeaderRow}>
                <View style={styles.shlokaHeaderLeft}>
                  <Sparkles
                    size={15}
                    color={isDarkMode ? "#D0BCFF" : "#7D5260"}
                  />
                  <Text style={[styles.shlokaTitle, { color: c.text }]}>
                    {t.shlokaOfTheDay}
                  </Text>
                </View>
                {shlokaOfTheDay && (
                  <View
                    style={[
                      styles.verseBadge,
                      {
                        backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <Text style={[styles.verseBadgeText, { color: c.accent }]}>
                      {shlokaOfTheDay.chapter}:{shlokaOfTheDay.verse}
                    </Text>
                  </View>
                )}
              </View>

              {/* Content */}
              {loading ? (
                <View style={{ paddingVertical: 24 }}>
                  <MaterialLoader size="large" />
                </View>
              ) : error ? (
                <Text style={[styles.errorText, { color: c.sub }]}>
                  {t.pullToRefresh}
                </Text>
              ) : shlokaOfTheDay ? (
                <View>
                  <View style={styles.verseAccentLine}>
                    <Text style={[styles.verseRef, { color: c.sub }]}>
                      {t.chapter} {shlokaOfTheDay.chapter} · {t.verse}{" "}
                      {shlokaOfTheDay.verse}
                    </Text>
                    <Text style={[styles.shlokText, { color: c.text }]}>
                      {shlokaOfTheDay.text}
                    </Text>
                    <Text style={[styles.translationText, { color: c.sub }]}>
                      {shlokaOfTheDay.translation}
                    </Text>
                  </View>

                  <View style={styles.shareRow}>
                    <TouchableOpacity
                      onPress={shareShloka}
                      activeOpacity={0.75}
                      style={[
                        styles.shareBtn,
                        {
                          backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                          borderColor: c.border,
                        },
                      ]}
                    >
                      <Share2 size={14} color={c.accent} />
                      <Text style={[styles.shareBtnText, { color: c.accent }]}>
                        {t.shareVerse}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>

        {/* ── Navigation Grid ── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(250)}
          style={styles.navSection}
        >
          <Text style={[styles.navSectionTitle, { color: c.text }]}>
            {t.beginJourney}
          </Text>
          <View style={styles.navGrid}>
            {NAV_ITEM_CONFIGS.map((item) => {
              const Icon = item.icon;
              const iconBg = isDarkMode ? item.bgDark : item.bg;
              return (
                <TouchableOpacity
                  key={item.labelKey}
                  activeOpacity={0.8}
                  onPress={() => router.push(item.route as any)}
                  style={[
                    styles.navCard,
                    {
                      backgroundColor: c.card,
                      borderColor: c.border,
                      shadowOpacity: isDarkMode ? 0.35 : 0.08,
                    },
                  ]}
                >
                  <View
                    style={[styles.navIconWrap, { backgroundColor: iconBg }]}
                  >
                    <Icon size={22} color={item.color} />
                  </View>
                  <Text style={[styles.navLabel, { color: c.text }]}>
                    {t[item.labelKey]}
                  </Text>
                  <Text style={[styles.navSub, { color: c.sub }]}>
                    {t[item.subKey]}
                  </Text>
                  <ChevronRight
                    size={14}
                    color={c.sub}
                    style={{ position: "absolute", top: 18, right: 16 }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Attribution ── */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(350)}
          style={styles.attribution}
        >
          {/* Decorative divider */}
          <View style={styles.dividerRow}>
            <LinearGradient
              colors={["transparent", isDarkMode ? "#4A4458" : "#E8D5C4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dividerLine}
            />
            <Text style={[styles.dividerSymbol, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
              ✦
            </Text>
            <LinearGradient
              colors={[isDarkMode ? "#4A4458" : "#E8D5C4", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dividerLine}
            />
          </View>

          {/* OM symbol */}
          <Text style={[styles.omSymbol, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
            ॐ
          </Text>

          <Text style={[styles.creditTop, { color: c.sub }]}>
            Crafted with ❤️ by{" "}
            <Text style={[styles.creditName, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
              Khilan Patel
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Header
  headerWrap: { alignItems: "center", paddingTop: 20, paddingBottom: 14 },
  logo: { width: 120, height: 120, resizeMode: "contain" },
  greetLabel: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: "600",
  },
  appTitle: { fontSize: 30, fontWeight: "800", marginTop: 4 },
  appTagline: { fontSize: 13, marginTop: 3, opacity: 0.85 },

  // Shloka card
  shlokaCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  accentBar: { height: 4 },
  shlokaInner: { padding: 20 },
  shlokaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  shlokaHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  shlokaTitle: { fontSize: 15, fontWeight: "700" },
  verseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  verseBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  errorText: { textAlign: "center", paddingVertical: 24, fontSize: 14 },
  verseAccentLine: {
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
    paddingLeft: 14,
  },
  verseRef: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  shlokText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 30,
    marginBottom: 12,
    fontStyle: "italic",
  },
  translationText: { fontSize: 14, lineHeight: 24 },
  shareRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 18 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  shareBtnText: { fontSize: 13, fontWeight: "700" },

  // Navigation grid
  navSection: { marginHorizontal: 20, marginBottom: 8 },
  navSectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 14 },
  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  navCard: {
    width: "47.5%",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  navIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  navLabel: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  navSub: { fontSize: 12, lineHeight: 17 },

  // Attribution
  attribution: { alignItems: "center", marginTop: 28, marginBottom: 10, paddingHorizontal: 20 },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerSymbol: { fontSize: 12, marginHorizontal: 12 },
  omSymbol: { fontSize: 28, fontWeight: "700", marginBottom: 10, letterSpacing: 1 },
  creditTop: { fontSize: 13, letterSpacing: 0.4 },
  creditName: { fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },

  // Rank strip
  rankStrip: { marginHorizontal: 20, marginBottom: 16 },
  rankStripInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  rankEmoji: { fontSize: 26 },
  rankName: { fontSize: 14, fontWeight: "800", marginBottom: 1 },
  rankSub: { fontSize: 11 },
  rankBadgeCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankBadgeCountText: { fontSize: 12, fontWeight: "700" },
});