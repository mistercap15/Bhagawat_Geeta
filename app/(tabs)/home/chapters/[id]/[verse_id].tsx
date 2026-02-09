import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  CheckSquare,
  Square,
  BookOpenText,
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
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const TAB_BAR_HEIGHT = 62;
const TAB_BAR_BOTTOM_SPACE = 16;

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const chapterId = id as string;
  const versesCount = Number(verses_count);
  const initialVerseId = Number(verse_id);

  const [verse, setVerse] = useState<any>(null);
  const [currentVerseId, setCurrentVerseId] = useState(initialVerseId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const { isDarkMode } = useTheme();

  /* 🎨 ORIGINAL COLORS */
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
    }),
    [isDarkMode],
  );

  /* 📖 LOAD VERSE */
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

  useEffect(() => {
    (async () => {
      await loadVerse(initialVerseId);
      setLoading(false);
    })();
  }, []);

  /* 🔁 CHANGE VERSE */
  const changeVerse = async (direction: "next" | "prev") => {
    const next = direction === "next" ? currentVerseId + 1 : currentVerseId - 1;
    if (next < 1 || next > versesCount) {
      translateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
      return;
    }
    setCurrentVerseId(next);
    await loadVerse(next);
    translateX.value = 0;
    rotateY.value = 0;
  };

  /* 🖐️ GESTURE WITH PAGE CURL */
  const onGestureEvent = (e: any) => {
    const translation = e.nativeEvent.translationX;
    translateX.value = translation;

    // Create 3D page curl effect
    const progress = translation / SCREEN_WIDTH;
    rotateY.value = progress * 45; // Max 45 degrees rotation
  };

  const onGestureEnd = () => {
    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      const dir = translateX.value < 0 ? "next" : "prev";

      // Animate page turn
      translateX.value = withTiming(
        translateX.value < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
        { duration: 350 },
      );
      rotateY.value = withTiming(
        translateX.value < 0 ? -90 : 90,
        { duration: 350 },
        () => runOnJS(changeVerse)(dir),
      );
    } else {
      // Snap back
      translateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
    }
  };

  /* 🎬 ANIMATIONS */
  const pageAnimatedStyle = useAnimatedStyle(() => {
    const perspective = 1200;
    const rotateYDeg = `${rotateY.value}deg`;

    // Add shadow based on rotation
    const shadowOpacity = interpolate(
      Math.abs(rotateY.value),
      [0, 45],
      [0.1, 0.4],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { perspective },
        { translateX: translateX.value },
        { rotateY: rotateYDeg },
      ],
      shadowOpacity,
    };
  });

  /* ❤️ TOGGLES */
  const toggleFavorite = async () => {
    const v = !isFavorite;
    setIsFavorite(v);
    const key = `favorite_verse_${chapterId}_${currentVerseId}`;
    v
      ? await AsyncStorage.setItem(key, "true")
      : await AsyncStorage.removeItem(key);
  };

  const toggleRead = async () => {
    const v = !isRead;
    setIsRead(v);
    await AsyncStorage.setItem(
      `read_verse_${chapterId}_${currentVerseId}`,
      v.toString(),
    );
  };

  if (loading || !verse) {
    return (
      <LinearGradient
        colors={palette.gradient as [string, string]}
        className="flex-1 items-center justify-center"
      >
        <MaterialLoader size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={palette.gradient as [string, string]}
      className="flex-1"
    >
      {/* Book Binding Shadow on Left */}
      <View
        style={{ backgroundColor: palette.shadow }}
        className="absolute left-0 top-0 bottom-0 w-2"
      />

      <ScrollView
        className="px-5 pt-5"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_SPACE + 24,
        }}
      >
        {/* DECORATIVE HEADER */}
        <View className="items-center mb-6">
          <Text
            style={{ color: palette.accent }}
            className="mt-2 text-base font-semibold"
          >
            अध्याय {verse.chapter}
          </Text>
          <Text
            style={{ color: palette.muted }}
            className="text-sm mt-1 font-medium"
          >
            श्लोक {currentVerseId} / {versesCount}
          </Text>

          {/* Page Navigation Hint */}
          <View className="flex-row items-center mt-3 gap-2">
            <ChevronLeft color={palette.muted} size={16} />
            <Text style={{ color: palette.muted }} className="text-xs">
              Swipe to turn pages
            </Text>
            <ChevronRight color={palette.muted} size={16} />
          </View>
        </View>

        {/* BOOK PAGE */}
        <View className="mx-1">
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onEnded={onGestureEnd}
          >
            <Animated.View style={pageAnimatedStyle}>
              <View
                style={{
                  backgroundColor: palette.page,
                  borderColor: palette.pageBorder,
                  shadowColor: palette.shadow,
                }}
                className="rounded-lg border-2 p-6 shadow-lg relative"
              >
                {/* Bookmark Ribbon */}
                {isFavorite && (
                  <View
                    style={{ backgroundColor: palette.bookmark }}
                    className="absolute -top-0.5 right-10 w-6 h-20 rounded-b shadow-md"
                  />
                )}

                {/* Favorite Button - Top Left Corner */}
                <TouchableOpacity
                  onPress={toggleFavorite}
                  style={{
                    backgroundColor: palette.buttonBg,
                    borderColor: palette.pageBorder,
                  }}
                  className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 items-center justify-center shadow-lg z-10"
                  activeOpacity={0.7}
                >
                  <Heart
                    size={20}
                    color={isFavorite ? "#C41E3A" : palette.muted}
                    fill={isFavorite ? "#C41E3A" : "transparent"}
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>

                {/* Read Button - Top Right Corner */}
                <TouchableOpacity
                  onPress={toggleRead}
                  style={{
                    backgroundColor: palette.buttonBg,
                    borderColor: palette.pageBorder,
                  }}
                  className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-2 items-center justify-center shadow-lg z-10"
                  activeOpacity={0.7}
                >
                  {isRead ? (
                    <CheckSquare color="#5BB974" size={20} strokeWidth={2.5} />
                  ) : (
                    <Square color={palette.muted} size={20} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>

                {/* Page Corner Fold Effect */}
                <View
                  style={{
                    borderRightColor: palette.pageBorder,
                    borderBottomColor: "transparent",
                    borderRightWidth: 30,
                    borderBottomWidth: 30,
                  }}
                  className="absolute top-0 right-0 w-0 h-0"
                />

                {/* Sanskrit Verse */}
                <View className="mb-5">
                  <View className="flex-row items-center justify-center mb-3 gap-2">
                    <View
                      style={{ backgroundColor: palette.accentLight }}
                      className="w-1 h-1 rounded-full"
                    />
                    <Text
                      style={{ color: palette.accent }}
                      className="text-xs font-semibold tracking-wider uppercase"
                    >
                      संस्कृत श्लोक
                    </Text>
                    <View
                      style={{ backgroundColor: palette.accentLight }}
                      className="w-1 h-1 rounded-full"
                    />
                  </View>
                  <Text
                    style={{ color: palette.text }}
                    className="text-[26px] leading-[42px] font-semibold text-center tracking-wide"
                  >
                    {verse.slok}
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{ backgroundColor: palette.pageBorder }}
                  className="h-px my-5 opacity-30"
                />

                {/* Hindi Meaning */}
                <View
                  style={{
                    backgroundColor: palette.innerCard,
                    borderColor: palette.pageBorder,
                  }}
                  className="rounded-lg border p-4 mb-4"
                >
                  <Text
                    style={{ color: palette.accent }}
                    className="font-semibold mb-2 text-center text-sm tracking-wide"
                  >
                    ॐ हिंदी भावार्थ ॐ
                  </Text>
                  <Text
                    style={{ color: palette.text }}
                    className="text-[15px] leading-6 tracking-wide"
                  >
                    {verse.tej.ht}
                  </Text>
                </View>

                {/* English Meaning */}
                <View
                  style={{
                    backgroundColor: palette.innerCard,
                    borderColor: palette.pageBorder,
                  }}
                  className="rounded-lg border p-4"
                >
                  <Text
                    style={{ color: palette.accent }}
                    className="font-semibold mb-2 text-center text-sm tracking-wide"
                  >
                    ॐ English Translation ॐ
                  </Text>
                  <Text
                    style={{ color: palette.text }}
                    className="text-[15px] leading-6 tracking-wide"
                  >
                    {verse.siva.et}
                  </Text>
                </View>

                {/* Decorative Footer */}
                <View className="items-center mt-2">
                  <View
                    style={{ backgroundColor: palette.accent }}
                    className="w-10 h-0.5 rounded"
                  />
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
