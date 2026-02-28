import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, ChevronLeft, ChevronRight, Clock, BookMarked } from "lucide-react-native";
import MaterialLoader from "@/components/MaterialLoader";
import { getChapter } from "@/utils/gitaData";
import Animated, { FadeInDown } from "react-native-reanimated";

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} min ago`;
  return "just now";
}

export default function ContinueReadingScreen() {
  const [lastRead, setLastRead] = useState<any>(null);
  const [chapterName, setChapterName] = useState<string>("");
  const [versesCount, setVersesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        const stored = await AsyncStorage.getItem("last_read");
        if (stored) {
          const parsed = JSON.parse(stored);
          setLastRead(parsed);
          const chapterData = await getChapter(parsed.chapter.toString());
          if (chapterData) {
            setVersesCount(chapterData.verses_count);
            setChapterName(chapterData.transliteration ?? "");
          }
        } else {
          setLastRead(null);
        }
        setLoading(false);
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
        style={styles.center}
      >
        <MaterialLoader size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={[styles.headerIconWrap, { backgroundColor: "#D9770622" }]}>
            <BookMarked size={18} color="#D97706" />
          </View>
          <Text style={[styles.pageTitle, { color: c.text }]}>{t.continueReadingTitle}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {!lastRead ? (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: isDarkMode ? "#0D2540" : "#FFF1E6" }]}>
              <BookOpen size={38} color={isDarkMode ? "#FFB347" : "#8A4D24"} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>{t.noReadingHistory}</Text>
            <Text style={[styles.emptySub, { color: c.sub }]}>
              {t.noReadingHistorySub}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home/chapters")}
              activeOpacity={0.8}
              style={styles.browseBtn}
            >
              <Text style={styles.browseBtnText}>{t.browseChapters}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(500)}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  `/home/chapters/${lastRead.chapter}/${lastRead.verse}?verses_count=${versesCount}`
                )
              }
              style={[
                styles.resumeCard,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  shadowOpacity: isDarkMode ? 0.3 : 0.1,
                },
              ]}
            >
              {/* Gradient accent top bar */}
              <LinearGradient
                colors={["#8A4D24", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentBar}
              />

              <View style={styles.resumeCardInner}>
                {/* Chapter info row */}
                <View style={styles.chapterRow}>
                  <View style={[styles.bookIconWrap, { backgroundColor: isDarkMode ? "#0D2540" : "#FFF1E6" }]}>
                    <BookOpen size={24} color="#8A4D24" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapterNumLabel}>
                      {t.meaningKey === 'en' ? 'CHAPTER' : 'अध्याय'} {lastRead.chapter}
                    </Text>
                    <Text
                      style={[styles.chapterNameText, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {chapterName}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={c.sub} />
                </View>

                {/* Resume info pill */}
                <View style={[styles.resumePill, { backgroundColor: isDarkMode ? "#0D2540" : "#FFF3DC" }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resumeLabel, { color: c.sub }]}>{t.resumeFrom}</Text>
                    <Text style={[styles.resumeVerse, { color: c.text }]}>
                      {t.verse} {lastRead.verse}
                    </Text>
                  </View>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={c.sub} />
                    <Text style={[styles.timeText, { color: c.sub }]}>
                      {getTimeAgo(lastRead.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={[styles.hintText, { color: c.sub }]}>
              {t.swipeHint}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20, paddingBottom: 110 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6, marginTop: 4 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  headerIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  divider: { height: 1, marginVertical: 16 },

  emptyWrap: { alignItems: "center", paddingTop: 40, paddingHorizontal: 20 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  browseBtn: {
    backgroundColor: "#8A4D24",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  browseBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  resumeCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  accentBar: { height: 4 },
  resumeCardInner: { padding: 20 },
  chapterRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  bookIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  chapterNumLabel: {
    color: "#8A4D24",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  chapterNameText: { fontSize: 17, fontWeight: "800" },

  resumePill: { borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center" },
  resumeLabel: { fontSize: 12, marginBottom: 3 },
  resumeVerse: { fontSize: 16, fontWeight: "700" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 11 },

  hintText: { textAlign: "center", fontSize: 12, marginTop: 14, opacity: 0.7 },
});
