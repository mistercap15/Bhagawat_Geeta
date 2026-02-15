import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { getSlok } from "@/utils/gitaData";
import { useTheme } from "@/context/ThemeContext";
import MaterialLoader from "@/components/MaterialLoader";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const chapterId = id as string;
  const versesCount = Number(verses_count);
  const initialVerseId = Number(verse_id);

  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const [verse, setVerse] = useState<any>(null);
  const [nextVerse, setNextVerse] = useState<any>(null);
  const [prevVerse, setPrevVerse] = useState<any>(null);
  const [currentVerseId, setCurrentVerseId] = useState(initialVerseId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);

  const palette = useMemo(
    () => ({
      gradient: isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"],
      page: isDarkMode ? "#3A3444" : "#FFF8ED",
      pageBorder: isDarkMode ? "#4A4458" : "#E8D5C4",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      muted: isDarkMode ? "#CAC4D0" : "#625B71",
      accent: isDarkMode ? "#FFB59D" : "#8A4D24",
      accentLight: isDarkMode ? "#FFCDB5" : "#A0522D",
      buttonBg: isDarkMode ? "#352F3F" : "#FFFDF9",
      innerCard: isDarkMode ? "#312C3A" : "#FDF2E5",
      shadow: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(138,77,36,0.2)",
      bookmark: "#C41E3A",
      curlOverlay: isDarkMode ? "#2A2630" : "#FFFFFF",
    }),
    [isDarkMode],
  );

  // ─── EXACTLY LIKE OLD CODE - Simple per-verse storage ─────────
  const loadVerse = async (verseId: number) => {
    const data = await getSlok(chapterId, verseId);
    setVerse(data);

    const fav = await AsyncStorage.getItem(
      `favorite_verse_${chapterId}_${verseId}`,
    );
    const read = await AsyncStorage.getItem(
      `read_verse_${chapterId}_${verseId}`,
    );

    setIsFavorite(fav === "true");
    setIsRead(read === "true");
  };

  const loadAdjacentVerses = async (verseId: number) => {
    if (verseId < versesCount) {
      const next = await getSlok(chapterId, verseId + 1);
      setNextVerse(next);
    } else {
      setNextVerse(null);
    }

    if (verseId > 1) {
      const prev = await getSlok(chapterId, verseId - 1);
      setPrevVerse(prev);
    } else {
      setPrevVerse(null);
    }
  };

  useEffect(() => {
    (async () => {
      await loadVerse(initialVerseId);
      await loadAdjacentVerses(initialVerseId);
      setLoading(false);
    })();
  }, [initialVerseId]);
  useEffect(() => {
    if (!currentVerseId) return;

    const persistLastRead = async () => {
      try {
        await AsyncStorage.setItem(
          "last_read",
          JSON.stringify({
            chapter: chapterId,
            verse: currentVerseId,
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.log("Error saving last read:", e);
      }
    };

    // Run AFTER render settles
    const timeout = setTimeout(persistLastRead, 0);

    return () => clearTimeout(timeout);
  }, [currentVerseId]);

  // ─── EXACTLY LIKE OLD CODE ─────────────────────────────────────
  const changeVerse = async (direction: "next" | "prev") => {
    const nextId =
      direction === "next" ? currentVerseId + 1 : currentVerseId - 1;

    if (nextId < 1 || nextId > versesCount) {
      translateX.value = withTiming(0, { duration: 300 });
      return;
    }

    setCurrentVerseId(nextId);

    // Only load UI data
    await loadVerse(nextId);
    await loadAdjacentVerses(nextId);

    translateX.value = 0;
  };

  // ─── Gesture Handlers ──────────────────────────────────────────
  const onGestureEvent = (e: any) => {
    const translationX = e.nativeEvent.translationX;
    const translationY = e.nativeEvent.translationY;

    // Ignore if mostly vertical movement
    if (Math.abs(translationY) > Math.abs(translationX)) return;

    translateX.value = translationX;
  };

  const onGestureEnd = (e: any) => {
    const translationY = e.nativeEvent.translationY;

    if (Math.abs(translationY) > Math.abs(translateX.value)) {
      translateX.value = withTiming(0, { duration: 300 });
      return;
    }

    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      const dir = translateX.value < 0 ? "next" : "prev";
      translateX.value = withTiming(
        translateX.value < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
        { duration: 350 },
        () => runOnJS(changeVerse)(dir),
      );
    } else {
      translateX.value = withTiming(0, { duration: 300 });
    }
  };

  // ─── Animated Styles ───────────────────────────────────────────
  const currentPageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const nextPageAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -SCREEN_WIDTH / 2],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const prevPageAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH / 2],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const curlOverlayRightStyle = useAnimatedStyle(() => {
    const isSwipingLeft = translateX.value < 0;
    if (!isSwipingLeft) return { opacity: 0, width: 0 };

    const overlayWidth = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [0, SCREEN_WIDTH],
      Extrapolate.CLAMP,
    );

    const overlayOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.2],
      [0, 0.95],
      Extrapolate.CLAMP,
    );

    const shadowOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [0, 0.6],
      Extrapolate.CLAMP,
    );

    return { opacity: overlayOpacity, width: overlayWidth, shadowOpacity };
  });

  const curlOverlayLeftStyle = useAnimatedStyle(() => {
    const isSwipingRight = translateX.value > 0;
    if (!isSwipingRight) return { opacity: 0, width: 0 };

    const overlayWidth = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [0, SCREEN_WIDTH],
      Extrapolate.CLAMP,
    );

    const overlayOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.2],
      [0, 0.95],
      Extrapolate.CLAMP,
    );

    const shadowOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [0, 0.6],
      Extrapolate.CLAMP,
    );

    return { opacity: overlayOpacity, width: overlayWidth, shadowOpacity };
  });

  // ─── Toggles - EXACTLY LIKE OLD CODE ──────────────────────────
  const toggleFavorite = async () => {
    const v = !isFavorite;
    setIsFavorite(v);
    const key = `favorite_verse_${chapterId}_${currentVerseId}`;
    if (v) {
      await AsyncStorage.setItem(key, "true");
    } else {
      await AsyncStorage.removeItem(key);
    }
  };

  const toggleRead = async () => {
    try {
      const chapterKey = `read_chapter_${chapterId}`;
      const dailyKey = "daily_read_log";
      const today = new Date().toISOString().split("T")[0];
      const verseKey = `${chapterId}_${currentVerseId}`;

      const existing = await AsyncStorage.getItem(chapterKey);
      let readVerses: number[] = existing ? JSON.parse(existing) : [];

      const rawDaily = await AsyncStorage.getItem(dailyKey);
      let dailyLog = rawDaily ? JSON.parse(rawDaily) : {};

      if (!dailyLog[today]) {
        dailyLog[today] = [];
      }

      let updatedReadState;

      if (readVerses.includes(currentVerseId)) {
        readVerses = readVerses.filter((v) => v !== currentVerseId);
        dailyLog[today] = dailyLog[today].filter((v: string) => v !== verseKey);
        updatedReadState = false;
      } else {
        readVerses.push(currentVerseId);
        if (!dailyLog[today].includes(verseKey)) {
          dailyLog[today].push(verseKey);
        }
        updatedReadState = true;
      }

      setIsRead(updatedReadState);

      // Save in background (no animation happening here)
      await AsyncStorage.setItem(chapterKey, JSON.stringify(readVerses));
      await AsyncStorage.setItem(dailyKey, JSON.stringify(dailyLog));
    } catch (error) {
      console.log("Error updating read state:", error);
    }
  };

  // ─── Render Verse Card ─────────────────────────────────────────
  const renderVerseCard = (
    verseData: any,
    verseId: number,
    isCurrent = false,
  ) => {
    if (!verseData) return null;

    return (
      <View
        style={[
          styles.pageContainer,
          {
            backgroundColor: palette.page,
            borderColor: palette.pageBorder,
          },
        ]}
      >
        {/* Bookmark Ribbon */}
        {isCurrent && isFavorite && (
          <View
            style={[styles.bookmark, { backgroundColor: palette.bookmark }]}
          />
        )}

        {/* Page Corner Fold */}
        <View
          style={[styles.cornerFold, { borderRightColor: palette.pageBorder }]}
        />

        {/* Content */}
        <ScrollView
          style={styles.cardContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
        >
          <View style={styles.verseSection}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.dot, { backgroundColor: palette.accentLight }]}
              />
              <Text style={[styles.sectionTitle, { color: palette.accent }]}>
                संस्कृत श्लोक
              </Text>
              <View
                style={[styles.dot, { backgroundColor: palette.accentLight }]}
              />
            </View>
            <Text style={[styles.sanskritText, { color: palette.text }]}>
              {verseData.slok}
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: palette.pageBorder }]}
          />
          <View
            style={[
              styles.meaningCard,
              {
                backgroundColor: palette.innerCard,
                borderColor: palette.pageBorder,
              },
            ]}
          >
            <Text style={[styles.meaningTitle, { color: palette.accent }]}>
              ॐ हिंदी भावार्थ ॐ
            </Text>
            <Text style={[styles.meaningText, { color: palette.text }]}>
              {verseData.tej.ht}
            </Text>
          </View>
          <View
            style={[
              styles.meaningCard,
              {
                backgroundColor: palette.innerCard,
                borderColor: palette.pageBorder,
              },
            ]}
          >
            <Text style={[styles.meaningTitle, { color: palette.accent }]}>
              ॐ English Translation ॐ
            </Text>
            <Text style={[styles.meaningText, { color: palette.text }]}>
              {verseData.siva.et}
            </Text>
          </View>
          <View style={styles.footer}>
            <View
              style={[styles.footerLine, { backgroundColor: palette.accent }]}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading || !verse) {
    return (
      <LinearGradient
        colors={palette.gradient as [string, string]}
        style={styles.loaderContainer}
      >
        <MaterialLoader size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={palette.gradient as [string, string]}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View className="mb-6">
          {/* Chapter Title */}
          <Text
            className="text-[18px] font-semibold tracking-wide text-center"
            style={{ color: palette.accent }}
          >
            अध्याय {verse.chapter}
          </Text>

          {/* Verse Counter */}
          <Text
            className="text-[14px] mt-1 text-center"
            style={{ color: palette.muted }}
          >
            श्लोक {currentVerseId} / {versesCount}
          </Text>

          {/* Action Buttons Row */}
          <View className="flex-row justify-center gap-4 mt-4">
            {/* Bookmark Button */}
            <TouchableOpacity
              onPress={toggleFavorite}
              activeOpacity={0.8}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isFavorite
                  ? "bg-[#C41E3A]/10 border-[#C41E3A]"
                  : isDarkMode
                    ? "border-[#4A4458]"
                    : "border-[#E8D5C4]"
              }`}
            >
              <Heart
                size={18}
                strokeWidth={2.2}
                color={isFavorite ? "#C41E3A" : palette.muted}
                fill={isFavorite ? "#C41E3A" : "transparent"}
              />
              <Text
                className="ml-2 text-[13px] font-semibold"
                style={{
                  color: isFavorite ? "#C41E3A" : palette.muted,
                }}
              >
                {isFavorite ? "Bookmarked" : "Bookmark"}
              </Text>
            </TouchableOpacity>

            {/* Mark as Read Button */}
            <TouchableOpacity
              onPress={toggleRead}
              activeOpacity={0.8}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                isRead
                  ? "bg-[#5BB974]/10 border-[#5BB974]"
                  : isDarkMode
                    ? "border-[#4A4458]"
                    : "border-[#E8D5C4]"
              }`}
            >
              {isRead ? (
                <CheckSquare size={18} strokeWidth={2.2} color="#5BB974" />
              ) : (
                <Square size={18} strokeWidth={2.2} color={palette.muted} />
              )}

              <Text
                className="ml-2 text-[13px] font-semibold"
                style={{
                  color: isRead ? "#5BB974" : palette.muted,
                }}
              >
                {isRead ? "Completed" : "Mark as Read"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pages with gesture */}
        <View style={styles.pagesContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onEnded={onGestureEnd}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-15, 15]}
          >
            <Animated.View style={styles.gestureContainer}>
              {/* Previous page (shown when swiping right) */}
              {prevVerse && (
                <Animated.View
                  style={[
                    styles.pageWrapper,
                    styles.underlyingPage,
                    prevPageAnimatedStyle,
                  ]}
                >
                  {renderVerseCard(prevVerse, currentVerseId - 1)}
                </Animated.View>
              )}

              {/* Next page (shown when swiping left) */}
              {nextVerse && (
                <Animated.View
                  style={[
                    styles.pageWrapper,
                    styles.underlyingPage,
                    nextPageAnimatedStyle,
                  ]}
                >
                  {renderVerseCard(nextVerse, currentVerseId + 1)}
                </Animated.View>
              )}

              {/* Current page */}
              <Animated.View
                style={[
                  styles.pageWrapper,
                  styles.currentPage,
                  currentPageAnimatedStyle,
                ]}
              >
                {renderVerseCard(verse, currentVerseId, true)}

                {/* Curl overlay - right side (next page) */}
                <Animated.View
                  style={[
                    styles.curlOverlay,
                    styles.curlOverlayRight,
                    {
                      backgroundColor: palette.curlOverlay,
                      shadowColor: "#000",
                    },
                    curlOverlayRightStyle,
                  ]}
                  pointerEvents="none"
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.curlShadowGradientRight}
                  />
                </Animated.View>

                {/* Curl overlay - left side (prev page) */}
                <Animated.View
                  style={[
                    styles.curlOverlay,
                    styles.curlOverlayLeft,
                    {
                      backgroundColor: palette.curlOverlay,
                      shadowColor: "#000",
                    },
                    curlOverlayLeftStyle,
                  ]}
                  pointerEvents="none"
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.curlShadowGradientLeft}
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  pagesContainer: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
    position: "relative",
  },
  pageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  currentPage: {
    zIndex: 10,
  },
  underlyingPage: {
    zIndex: 5,
  },
  pageContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
  },
  bookmark: {
    position: "absolute",
    top: -0.5,
    right: 40,
    width: 24,
    height: 80,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cornerFold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderRightWidth: 30,
    borderBottomWidth: 30,
    borderBottomColor: "transparent",
  },
  verseSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sanskritText: {
    fontSize: 26,
    lineHeight: 42,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.3,
  },
  meaningCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  meaningTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  meaningText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  // Page curl styles
  curlOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    shadowOffset: { width: 8, height: 0 },
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  curlOverlayRight: {
    right: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  curlOverlayLeft: {
    left: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  curlShadowGradientRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  curlShadowGradientLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
});
