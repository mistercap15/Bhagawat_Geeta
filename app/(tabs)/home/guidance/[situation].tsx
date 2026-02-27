import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { ChevronLeft, Shuffle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { useLanguage } from "@/context/LanguageContext";
import { getSlok, GitaSlok } from "@/utils/gitaData";
import {
  getSituation,
  Situation,
  SavedGuidance,
  GUIDANCE_STORAGE_KEY,
  pickRandomIndices,
} from "@/data/situationGuidance";

const VERSES_COUNT: Record<number, number> = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28,
  9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20,
  16: 24, 17: 28, 18: 78,
};

export default function SituationDetailScreen() {
  const { situation: situationId } = useLocalSearchParams<{ situation: string }>();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const { language } = useLanguage();

  const [situation, setSituation] = useState<Situation | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [verseData, setVerseData] = useState<(GitaSlok | null)[]>([]);
  const [verseLoading, setVerseLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0); // bumped to re-animate on shuffle

  const c = {
    bg: isDarkMode ? "#1C1B1F" : "#FFF8F1",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  // Fetch verse data whenever selected indices change
  const loadVerses = useCallback(
    async (found: Situation, indices: number[]) => {
      setVerseLoading(true);
      const selected = indices.map((i) => found.verses[i]);
      const results = await Promise.all(
        selected.map((v) => getSlok(v.chapter, v.verse))
      );
      setVerseData(results);
      setVerseLoading(false);
    },
    []
  );

  useEffect(() => {
    if (!situationId) return;
    const found = getSituation(situationId);
    setSituation(found ?? null);

    if (found) {
      const initialIndices = pickRandomIndices(found.verses.length, 3);
      setSelectedIndices(initialIndices);

      Promise.all([
        Promise.all(
          initialIndices.map((i) =>
            getSlok(found.verses[i].chapter, found.verses[i].verse)
          )
        ),
        AsyncStorage.getItem(GUIDANCE_STORAGE_KEY),
      ])
        .then(([verses, raw]) => {
          setVerseData(verses);
          if (raw) {
            try {
              const arr: SavedGuidance[] = JSON.parse(raw);
              setSaved(arr.some((s) => s.situationId === situationId));
            } catch {
              // ignore
            }
          }
        })
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [situationId]);

  const handleShuffle = () => {
    if (!situation || verseLoading) return;
    // Pick 3 new indices that are different from the current set where possible
    const newIndices = pickRandomIndices(
      situation.verses.length,
      3,
      selectedIndices
    );
    setSelectedIndices(newIndices);
    setShuffleKey((k) => k + 1);
    loadVerses(situation, newIndices);
  };

  const handleSave = async () => {
    if (!situation || saved) return;
    const newEntry: SavedGuidance = {
      id: String(Date.now()),
      situationId: situation.id,
      situationLabel: language === "hi" ? situation.labelHi : situation.label,
      situationEmoji: situation.emoji,
      savedAt: new Date().toISOString(),
    };
    const raw = await AsyncStorage.getItem(GUIDANCE_STORAGE_KEY);
    const existing: SavedGuidance[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(
      GUIDANCE_STORAGE_KEY,
      JSON.stringify([...existing, newEntry])
    );
    setSaved(true);
  };

  if (initialLoading || !situation) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        style={styles.center}
      >
        <ActivityIndicator size="large" color="#A855F7" />
      </LinearGradient>
    );
  }

  const situationLabel =
    language === "hi" ? situation.labelHi : situation.label;
  const situationTagline =
    language === "hi" ? situation.taglineHi : situation.tagline;
  const reflectionPrompts =
    language === "hi"
      ? situation.reflectionPromptsHi
      : situation.reflectionPrompts;

  const poolSize = situation.verses.length;

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={{ width: 38 }} />
        </Animated.View>

        {/* ── Hero ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(50)}
          style={styles.heroWrap}
        >
          <View
            style={[
              styles.heroCircle,
              { backgroundColor: situation.color + "22" },
            ]}
          >
            <Text style={styles.heroEmoji}>{situation.emoji}</Text>
          </View>
          <Text style={[styles.heroLabel, { color: c.text }]}>
            {situationLabel}
          </Text>
          <Text style={[styles.heroTagline, { color: situation.color }]}>
            {situationTagline}
          </Text>
          <View
            style={[styles.heroDivider, { backgroundColor: situation.color }]}
          />
        </Animated.View>

        {/* ── Verses Section ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          {/* Section header with shuffle button */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {language === "hi" ? "आपके लिए श्लोक" : t.versesForYou}
            </Text>
            <TouchableOpacity
              activeOpacity={verseLoading ? 1 : 0.75}
              onPress={handleShuffle}
              style={[
                styles.shuffleBtn,
                {
                  backgroundColor: situation.color + "22",
                  borderColor: situation.color + "55",
                  opacity: verseLoading ? 0.5 : 1,
                },
              ]}
            >
              <Shuffle size={14} color={situation.color} />
              <Text style={[styles.shuffleBtnText, { color: situation.color }]}>
                {language === "hi" ? "बदलें" : "Shuffle"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pool indicator */}
          <Text style={[styles.poolLabel, { color: c.sub }]}>
            {language === "hi"
              ? `${poolSize} श्लोकों में से 3 दिखाए जा रहे हैं`
              : `Showing 3 of ${poolSize} verses — shuffle for new ones`}
          </Text>

          {selectedIndices.map((verseIdx, idx) => {
            const verseRef = situation.verses[verseIdx];
            const verse = verseData[idx];
            const contextExpl =
              language === "hi"
                ? verseRef.contextExplanationHi
                : verseRef.contextExplanation;

            return (
              <Animated.View
                key={`${shuffleKey}-${verseRef.chapter}-${verseRef.verse}`}
                entering={FadeIn.duration(350).delay(idx * 80)}
                style={[
                  styles.verseCard,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    shadowOpacity: isDarkMode ? 0.3 : 0.08,
                  },
                ]}
              >
                <View
                  style={[
                    styles.verseCardBar,
                    { backgroundColor: situation.color },
                  ]}
                />
                <View style={styles.verseCardInner}>
                  {/* Badge */}
                  <View
                    style={[
                      styles.verseBadge,
                      {
                        backgroundColor: situation.color + "22",
                        borderColor: situation.color + "55",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verseBadgeText,
                        { color: situation.color },
                      ]}
                    >
                      {language === "hi" ? "अध्याय" : "Chapter"}{" "}
                      {verseRef.chapter} ·{" "}
                      {language === "hi" ? "श्लोक" : "Verse"}{" "}
                      {verseRef.verse}
                    </Text>
                  </View>

                  {/* Sanskrit / loading */}
                  {verseLoading || !verse ? (
                    <ActivityIndicator
                      size="small"
                      color={situation.color}
                      style={{ marginVertical: 14 }}
                    />
                  ) : (
                    <>
                      <Text style={[styles.sanskritText, { color: c.text }]}>
                        {verse.slok}
                      </Text>

                      {/* Context explanation */}
                      <View
                        style={[
                          styles.contextBlock,
                          {
                            backgroundColor: isDarkMode
                              ? "#1C1B1F"
                              : "#F5F0EC",
                            borderLeftColor: situation.color,
                          },
                        ]}
                      >
                        <Text style={[styles.contextText, { color: c.sub }]}>
                          {contextExpl}
                        </Text>
                      </View>

                      {/* Hindi translation */}
                      <View style={styles.translationBlock}>
                        <Text
                          style={[
                            styles.translationLabel,
                            { color: situation.color },
                          ]}
                        >
                          ॐ हिंदी भावार्थ ॐ
                        </Text>
                        <Text
                          style={[styles.translationText, { color: c.sub }]}
                        >
                          {verse.tej.ht}
                        </Text>
                      </View>

                      {/* English translation */}
                      <View style={[styles.translationBlock, { marginBottom: 14 }]}>
                        <Text
                          style={[
                            styles.translationLabel,
                            { color: situation.color },
                          ]}
                        >
                          ॐ English Translation ॐ
                        </Text>
                        <Text
                          style={[styles.translationText, { color: c.sub }]}
                        >
                          {verse.siva.et}
                        </Text>
                      </View>

                      {/* Read full verse */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push(
                            `/(tabs)/home/chapters/${verseRef.chapter}/${verseRef.verse}?verses_count=${VERSES_COUNT[verseRef.chapter] ?? 72}` as any
                          )
                        }
                        style={styles.readMoreRow}
                      >
                        <Text
                          style={[
                            styles.readMoreText,
                            { color: situation.color },
                          ]}
                        >
                          {language === "hi"
                            ? "पूरा श्लोक पढ़ें →"
                            : t.openFullVerse}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* ── Reflection Section ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(320)}
          style={[
            styles.reflectionCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.reflectionTitle, { color: c.text }]}>
            {language === "hi" ? "एक पल के लिए विचार करें" : t.reflectTitle}
          </Text>
          <View
            style={[
              styles.reflectionDivider,
              { backgroundColor: "#A855F7" },
            ]}
          />
          {reflectionPrompts.map((prompt, i) => (
            <View key={i} style={styles.promptRow}>
              <Text style={[styles.promptBullet, { color: "#A855F7" }]}>
                ✦
              </Text>
              <Text style={[styles.promptText, { color: c.sub }]}>
                {prompt}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Save Button ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(380)}
          style={styles.saveWrap}
        >
          <TouchableOpacity
            activeOpacity={saved ? 1 : 0.8}
            onPress={handleSave}
            style={[
              styles.saveBtn,
              {
                backgroundColor: saved
                  ? isDarkMode
                    ? "#2A1A3E"
                    : "#FAF5FF"
                  : "#A855F7",
                borderColor: "#A855F7",
              },
            ]}
          >
            <Text
              style={[
                styles.saveBtnText,
                { color: saved ? "#A855F7" : "#FFFFFF" },
              ]}
            >
              {saved
                ? language === "hi"
                  ? "सहेजा गया ✓"
                  : t.savedToJourney
                : language === "hi"
                ? "मेरी यात्रा में सहेजें"
                : t.saveToJourney}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 120, paddingTop: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero
  heroWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  heroCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  heroEmoji: { fontSize: 44 },
  heroLabel: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  heroDivider: { height: 3, width: 48, borderRadius: 99 },

  // Section row
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  shuffleBtnText: { fontSize: 12, fontWeight: "700" },
  poolLabel: {
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // Verse card
  verseCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  verseCardBar: { height: 4 },
  verseCardInner: { padding: 18 },
  verseBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  verseBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  sanskritText: {
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 28,
    marginBottom: 12,
  },
  contextBlock: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  contextText: { fontSize: 13, lineHeight: 20 },
  translationBlock: { marginBottom: 12 },
  translationLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  translationText: { fontSize: 13, lineHeight: 20 },
  readMoreRow: { alignItems: "flex-end" },
  readMoreText: { fontSize: 13, fontWeight: "700" },

  // Reflection
  reflectionCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  reflectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  reflectionDivider: { height: 3, width: 36, borderRadius: 99, marginBottom: 16 },
  promptRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  promptBullet: { fontSize: 12, marginTop: 2 },
  promptText: { flex: 1, fontSize: 13, lineHeight: 20 },

  // Save button
  saveWrap: { paddingHorizontal: 20 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
});
