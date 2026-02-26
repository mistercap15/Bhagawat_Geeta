import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { getSlok } from "@/utils/gitaData";
import MaterialLoader from "@/components/MaterialLoader";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, ChevronRight } from "lucide-react-native";
import chaptersData from "@/data/gita.json";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();

  const c = {
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  const { chapters } = chaptersData as any;

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const keys = await AsyncStorage.getAllKeys();
          const favKeys = keys.filter((k) => k.startsWith("favorite_verse_"));
          const favInfos = favKeys.map((key) => {
            const [, , chapter, verse] = key.split("_");
            return [chapter, verse];
          });
          const results = await Promise.all(
            favInfos.map(async ([chapter, verse]) => {
              const slok = await getSlok(chapter, verse);
              const chapterMeta = chapters.find(
                (ch: any) => String(ch.chapter_number) === String(chapter)
              );
              return { ...slok, verses_count: chapterMeta?.verses_count ?? 0 };
            })
          );
          setFavorites(results.filter(Boolean));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        style={styles.center}
      >
        <MaterialLoader size="large" />
        <Text style={[styles.loadingText, { color: c.sub }]}>{t.loadingFavorites}</Text>
      </LinearGradient>
    );
  }

  if (favorites.length === 0) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        style={styles.emptyContainer}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyContent}>
          <View style={[styles.emptyIcon, { backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6" }]}>
            <Heart size={38} color={isDarkMode ? "#D0BCFF" : "#8A4D24"} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>{t.noFavoritesTitle}</Text>
          <Text style={[styles.emptySub, { color: c.sub }]}>
            {t.noFavoritesSub}
          </Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerIconWrap}>
            <Heart size={18} color="#C41E3A" fill="#C41E3A" />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>{t.savedVerses}</Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>
              {t.favoriteCount(favorites.length)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {favorites.map((verse, index) => (
          <Animated.View
            key={`${verse.chapter}_${verse.verse}_${index}`}
            entering={FadeInDown.duration(380).delay(index * 55)}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/home/chapters/[id]/[verse_id]",
                  params: {
                    id: String(verse.chapter),
                    verse_id: String(verse.verse),
                    verses_count: String(verse.verses_count),
                  },
                })
              }
              style={[
                styles.card,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  shadowOpacity: isDarkMode ? 0.25 : 0.07,
                },
              ]}
            >
              {/* Chapter/verse badge row */}
              <View style={styles.cardTopRow}>
                <View style={styles.refBadge}>
                  <Text style={styles.refBadgeText}>
                    CH {verse.chapter} · V {verse.verse}
                  </Text>
                </View>
                <ChevronRight size={16} color={c.sub} />
              </View>

              {/* Sanskrit text with left accent */}
              <View style={styles.verseAccentLine}>
                <Text
                  style={[styles.sanskritText, { color: c.text }]}
                  numberOfLines={3}
                >
                  {verse.slok}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContent: { alignItems: "center", paddingHorizontal: 40 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  scroll: { padding: 20, paddingBottom: 110 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6, marginTop: 4 },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C41E3A20",
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 16 },

  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  refBadge: {
    backgroundColor: "#C41E3A20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  refBadgeText: { color: "#C41E3A", fontSize: 11, fontWeight: "800" },
  verseAccentLine: { borderLeftWidth: 3, borderLeftColor: "#D97706", paddingLeft: 12 },
  sanskritText: { fontSize: 15, fontWeight: "600", lineHeight: 24, fontStyle: "italic" },
});
