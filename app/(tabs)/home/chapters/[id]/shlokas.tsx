import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getChapter } from "@/utils/gitaData";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import MaterialLoader from "@/components/MaterialLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle, ChevronRight } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ShlokasScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [readVerses, setReadVerses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();

  const c = {
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
    track: isDarkMode ? "#3A3444" : "#E8D5C4",
  };

  const fetchChapterData = async () => {
    setError(false);
    try {
      const chapterData = await getChapter(id as string);
      if (!chapterData) throw new Error("Chapter not found");

      const stored = await AsyncStorage.getItem(
        `read_chapter_${chapterData.chapter_number}`
      );
      const readArray = stored ? JSON.parse(stored) : [];
      setReadVerses(new Set<number>(readArray));
      setChapter(chapterData);
      setVerses(
        Array.from({ length: chapterData.verses_count }, (_, i) => ({
          verse_number: i + 1,
        }))
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchChapterData(); }, [id]));

  if (loading || !chapter) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        style={styles.center}
      >
        <MaterialLoader size="large" />
        <Text style={[styles.loadingText, { color: c.sub }]}>
          {error ? t.couldNotLoad : t.loading}
        </Text>
      </LinearGradient>
    );
  }

  const readCount = readVerses.size;
  const progress = Math.round((readCount / chapter.verses_count) * 100);

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter header card */}
        <LinearGradient
          colors={isDarkMode ? ["#2B2930", "#352F3F"] : ["#FFF1E6", "#FFEAD7"]}
          style={[styles.headerCard, { borderColor: c.border }]}
        >
          <Text style={styles.chapterLabel}>{t.meaningKey === 'en' ? 'CHAPTER' : 'अध्याय'} {chapter.chapter_number}</Text>
          <Text style={[styles.chapterTitle, { color: c.text }]}>
            {chapter.name}
          </Text>
          <Text style={[styles.chapterMeaning, { color: c.sub }]}>
            {chapter.transliteration}
          </Text>
          <Text style={[styles.chapterSummary, { color: c.sub }]} numberOfLines={3}>
            {chapter.summary[t.meaningKey]}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={[styles.trackBg, { flex: 1, backgroundColor: c.track }]}>
              <LinearGradient
                colors={progress === 100 ? ["#22C55E", "#16A34A"] : ["#D97706", "#8A4D24"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.trackFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: c.sub }]}>
              {readCount}/{chapter.verses_count}
            </Text>
          </View>
        </LinearGradient>

        {/* Verse list */}
        <Text style={[styles.sectionLabel, { color: c.text }]}>
          {chapter.verses_count} {t.versesCount}
        </Text>

        {verses.map((verse, index) => {
          const isRead = readVerses.has(verse.verse_number);
          return (
            <Animated.View
              key={verse.verse_number}
              entering={FadeInDown.duration(260).delay(index * 16)}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    `/home/chapters/${id}/${verse.verse_number}?verses_count=${chapter.verses_count}`
                  )
                }
                style={[
                  styles.verseCard,
                  {
                    backgroundColor: c.card,
                    borderColor: isRead ? "#22C55E55" : c.border,
                    shadowOpacity: isDarkMode ? 0.2 : 0.06,
                  },
                ]}
              >
                <View
                  style={[
                    styles.verseBadge,
                    {
                      backgroundColor: isRead
                        ? "#22C55E20"
                        : isDarkMode
                        ? "#3A3444"
                        : "#FFF1E6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.verseNum,
                      { color: isRead ? "#22C55E" : "#8A4D24" },
                    ]}
                  >
                    {verse.verse_number}
                  </Text>
                </View>

                <View style={styles.verseBody}>
                  <Text style={[styles.verseTitle, { color: c.text }]}>
                    {t.verse} {verse.verse_number}
                  </Text>
                  <Text style={[styles.verseSub, { color: c.sub }]}>
                    {isRead ? t.completed : t.tapToRead}
                  </Text>
                </View>

                {isRead ? (
                  <CheckCircle size={20} color="#22C55E" />
                ) : (
                  <ChevronRight size={18} color={c.sub} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },
  scroll: { paddingBottom: 110 },

  headerCard: { margin: 20, marginBottom: 0, borderRadius: 22, padding: 20, borderWidth: 1 },
  chapterLabel: {
    color: "#8A4D24",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  chapterTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  chapterMeaning: { fontSize: 13, fontStyle: "italic", marginBottom: 10 },
  chapterSummary: { fontSize: 13, lineHeight: 20, marginBottom: 14 },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackBg: { height: 6, borderRadius: 99, overflow: "hidden" },
  trackFill: { height: 6, borderRadius: 99 },
  progressLabel: { fontSize: 12, fontWeight: "600" },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: 20,
  },

  verseCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  verseBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  verseNum: { fontSize: 14, fontWeight: "700" },
  verseBody: { flex: 1 },
  verseTitle: { fontSize: 14, fontWeight: "600" },
  verseSub: { fontSize: 12, marginTop: 2 },
});
