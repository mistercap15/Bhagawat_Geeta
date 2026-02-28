import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getChapters } from "@/utils/gitaData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import MaterialLoader from "@/components/MaterialLoader";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Each chapter gets a distinct accent colour for its badge + progress bar
const CHAPTER_COLORS = [
  "#E8913A", "#D97706", "#22C55E", "#3B82F6", "#9B59B6",
  "#E91E63", "#00BCD4", "#FF5722", "#8BC34A", "#673AB7",
  "#F44336", "#4CAF50", "#2196F3", "#FF9800", "#795548",
  "#607D8B", "#E91E63", "#009688",
];

export default function ChaptersScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const t = useTranslation();

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
    track: isDarkMode ? "#0D2540" : "#F0E8E0",
  };

  const fetchChapters = async () => {
    try {
      const chaptersData = await getChapters();
      const updated = await Promise.all(
        chaptersData.map(async (chapter: any) => {
          const stored = await AsyncStorage.getItem(`read_chapter_${chapter.chapter_number}`);
          const readVerses = stored ? JSON.parse(stored) : [];
          const readCount = readVerses.length;
          const progress = chapter.verses_count ? readCount / chapter.verses_count : 0;
          return { ...chapter, readCount, progress };
        })
      );
      setChapters(updated);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchChapters(); }, []));

  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
        style={styles.center}
      >
        <MaterialLoader size="large" />
        <Text style={[styles.loadingText, { color: c.sub }]}>{t.loadingChapters}</Text>
      </LinearGradient>
    );
  }

  const totalRead = chapters.reduce((sum, ch) => sum + ch.readCount, 0);

  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>{t.allChapters}</Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>
              {t.chaptersSubHeader(totalRead)}
            </Text>
          </View>
        </View>

        {chapters.map((chapter, index) => {
          const color = CHAPTER_COLORS[(chapter.chapter_number - 1) % CHAPTER_COLORS.length];
          const pct = Math.round(chapter.progress * 100);

          return (
            <Animated.View
              key={chapter.chapter_number}
              entering={FadeInDown.duration(350).delay(index * 35)}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/(tabs)/home/chapters/${chapter.chapter_number}/shlokas`)
                }
                style={[
                  styles.card,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    shadowOpacity: isDarkMode ? 0.4 : 0.08,
                  },
                ]}
              >
                {/* Chapter number circle — gold crown when complete */}
                <View
                  style={[
                    styles.chapterBadge,
                    pct === 100
                      ? { backgroundColor: "#F59E0B22", borderColor: "#D97706", borderWidth: 2 }
                      : { backgroundColor: color + "22", borderColor: color + "55" },
                  ]}
                >
                  {pct === 100 ? (
                    <Text style={styles.completedCrown}>👑</Text>
                  ) : (
                    <Text style={[styles.chapterNum, { color }]}>
                      {chapter.chapter_number}
                    </Text>
                  )}
                </View>

                {/* Text content */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text
                      style={[styles.transliteration, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {chapter.name}
                    </Text>
                    <View style={styles.cardTopRight}>
                      {pct > 0 && (
                        <View
                          style={[
                            styles.pctBadge,
                            {
                              backgroundColor:
                                pct === 100 ? "#22C55E20" : color + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pctText,
                              { color: pct === 100 ? "#22C55E" : color },
                            ]}
                          >
                            {pct}%
                          </Text>
                        </View>
                      )}
                      <ChevronRight size={16} color={c.sub} />
                    </View>
                  </View>

                  <Text style={[styles.chapterMeta, { color: c.sub }]} numberOfLines={1}>
                    {chapter.transliteration} · {chapter.verses_count} {t.versesCount}
                  </Text>

                  {/* Progress bar */}
                  <View style={[styles.trackBg, { backgroundColor: c.track }]}>
                    <LinearGradient
                      colors={
                        pct === 100 ? ["#22C55E", "#16A34A"] : [color, color + "88"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.trackFill, { width: `${pct}%` }]}
                    />
                  </View>
                </View>
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
  scroll: { padding: 20, paddingBottom: 110 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 4 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 28, fontWeight: "800" },
  pageSub: { fontSize: 13, marginTop: 3 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  chapterBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  chapterNum: { fontSize: 18, fontWeight: "800" },
  completedCrown: { fontSize: 22 },

  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  transliteration: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 8 },
  cardTopRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  pctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pctText: { fontSize: 11, fontWeight: "700" },

  chapterMeta: { fontSize: 12, marginBottom: 10 },

  trackBg: { height: 5, borderRadius: 99, overflow: "hidden" },
  trackFill: { height: 5, borderRadius: 99 },
});
