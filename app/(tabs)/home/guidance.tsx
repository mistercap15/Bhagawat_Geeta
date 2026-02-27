import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { SITUATIONS, Situation } from "@/data/situationGuidance";
import { useLanguage } from "@/context/LanguageContext";

function SituationCard({
  situation,
  onPress,
  isDarkMode,
  c,
}: {
  situation: Situation;
  onPress: () => void;
  isDarkMode: boolean;
  c: { card: string; text: string; sub: string; border: string };
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.situationCard,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          shadowOpacity: isDarkMode ? 0.3 : 0.08,
        },
      ]}
    >
      {/* Color accent bar */}
      <View style={[styles.cardAccentBar, { backgroundColor: situation.color }]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardEmoji}>{situation.emoji}</Text>
        <Text
          style={[styles.cardLabel, { color: c.text }]}
          numberOfLines={2}
        >
          {situation.label}
        </Text>
        <Text
          style={[styles.cardTagline, { color: c.sub }]}
          numberOfLines={2}
        >
          {situation.tagline}
        </Text>
        <View
          style={[
            styles.cardColorDot,
            { backgroundColor: situation.color + "33" },
          ]}
        >
          <Text style={[styles.cardColorDotText, { color: situation.color }]}>
            3 verses
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GuidanceScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const { language } = useLanguage();

  const c = {
    bg: isDarkMode ? "#1C1B1F" : "#FFF8F1",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.pageTitle, { color: c.text }]}>
              {language === "hi" ? "आप कैसा महसूस कर रहे हैं?" : t.howAreYouFeeling}
            </Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>
              {language === "hi" ? "कृष्ण का ज्ञान आपके पास आता है" : t.guidanceSubtitle}
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </Animated.View>

        {/* ── Decorative OM ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.omWrap}>
          <LinearGradient
            colors={["#A855F733", "#A855F711"]}
            style={styles.omCircle}
          >
            <Text style={styles.omText}>🙏</Text>
          </LinearGradient>
          <Text style={[styles.selectLabel, { color: c.sub }]}>
            {language === "hi" ? "अपनी स्थिति चुनें" : t.selectSituation}
          </Text>
        </Animated.View>

        {/* ── Situation Grid ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(120)}
          style={styles.grid}
        >
          {SITUATIONS.map((situation, idx) => {
            const displaySituation =
              language === "hi"
                ? { ...situation, label: situation.labelHi, tagline: situation.taglineHi }
                : situation;
            return (
              <SituationCard
                key={situation.id}
                situation={displaySituation}
                onPress={() =>
                  router.push(
                    `/(tabs)/home/guidance/${situation.id}` as any
                  )
                }
                isDarkMode={isDarkMode}
                c={c}
              />
            );
          })}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 20, paddingTop: 16 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  pageTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  pageSub: { fontSize: 13, marginTop: 4, textAlign: "center", lineHeight: 18 },

  omWrap: { alignItems: "center", marginBottom: 28 },
  omCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  omText: { fontSize: 32 },
  selectLabel: { fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  situationCard: {
    width: "47.5%",
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardAccentBar: { height: 4 },
  cardContent: { padding: 14, paddingTop: 12 },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  cardTagline: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  cardColorDot: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cardColorDotText: { fontSize: 11, fontWeight: "700" },
});
