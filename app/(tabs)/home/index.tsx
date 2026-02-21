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
import {
  Share2,
  BookOpen,
  Star,
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { getSlok } from "@/utils/gitaData";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaterialLoader from "@/components/MaterialLoader";
import homeLogo from "../../../assets/images/splashScreen.png";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const NAV_ITEMS = [
  {
    icon: BookOpen,
    label: "Read Chapters",
    sub: "Explore all 18 chapters",
    route: "/(tabs)/home/chapters",
    color: "#E8913A",
    bg: "#FFF1E6",
    bgDark: "#3A2E1E",
  },
  {
    icon: Star,
    label: "Favorites",
    sub: "Your saved verses",
    route: "/(tabs)/home/favorite",
    color: "#D97706",
    bg: "#FFFBEB",
    bgDark: "#3A2F10",
  },
  {
    icon: Sparkles,
    label: "Continue Reading",
    sub: "Resume where you left",
    route: "/(tabs)/home/continue-reading",
    color: "#3B82F6",
    bg: "#EFF6FF",
    bgDark: "#1E2A3A",
  },
  {
    icon: Target,
    label: "Daily Practice",
    sub: "Build your streak",
    route: "/(tabs)/home/daily-practice",
    color: "#22C55E",
    bg: "#F0FDF4",
    bgDark: "#1A2E1E",
  },
];

export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const viewRef = useRef<any>(null);

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
      if (!viewRef.current) return;
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "error",
          text1: "Sharing not supported on this device",
        });
        return;
      }
      await new Promise((r) => setTimeout(r, 300));
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri);
      Toast.show({
        type: "success",
        text1: "Shloka Shared!",
        text2: "Spreading divine wisdom 🙏",
      });
    } catch {
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
            Bhagavad Gita
          </Text>
          <Text style={[styles.appTagline, { color: c.sub }]}>
            Sacred wisdom, beautifully presented
          </Text>
        </Animated.View>

        {/* ── Shloka of the Day ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
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
                    Shloka of the Day
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
                  Pull down to refresh and load a verse.
                </Text>
              ) : shlokaOfTheDay ? (
                <View>
                  <View style={styles.verseAccentLine}>
                    <Text style={[styles.verseRef, { color: c.sub }]}>
                      Chapter {shlokaOfTheDay.chapter} · Verse{" "}
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
                        Share Verse
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
            Begin Your Journey
          </Text>
          <View style={styles.navGrid}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const iconBg = isDarkMode ? item.bgDark : item.bg;
              return (
                <TouchableOpacity
                  key={item.label}
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
                    {item.label}
                  </Text>
                  <Text style={[styles.navSub, { color: c.sub }]}>
                    {item.sub}
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
});
