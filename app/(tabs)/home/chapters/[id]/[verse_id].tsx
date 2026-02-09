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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
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
  const { isDarkMode } = useTheme();

  /* 🎨 COLORS */
  const palette = useMemo(
    () => ({
      gradient: isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"],
      page: isDarkMode ? "#3A3444" : "#FFF8ED",
      pageBorder: isDarkMode ? "#4A4458" : "#E8D5C4",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      muted: isDarkMode ? "#CAC4D0" : "#625B71",
      accent: isDarkMode ? "#FFB59D" : "#8A4D24",
      buttonBg: isDarkMode ? "#352F3F" : "#FFFDF9",
      innerCard: isDarkMode ? "#312C3A" : "#FDF2E5",
    }),
    [isDarkMode]
  );

  /* 📖 LOAD VERSE */
  const loadVerse = async (verseId: number) => {
    const data = await getSlok(chapterId, verseId);
    setVerse(data);

    const fav = await AsyncStorage.getItem(
      `favorite_verse_${chapterId}_${verseId}`
    );
    const read = await AsyncStorage.getItem(
      `read_verse_${chapterId}_${verseId}`
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
    const next =
      direction === "next"
        ? currentVerseId + 1
        : currentVerseId - 1;

    if (next < 1 || next > versesCount) {
      translateX.value = withTiming(0);
      return;
    }

    setCurrentVerseId(next);
    await loadVerse(next);

    translateX.value = 0;
  };

  /* 🖐️ GESTURE */
  const onGestureEnd = () => {
    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      const dir = translateX.value < 0 ? "next" : "prev";

      translateX.value = withTiming(
        translateX.value < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
        { duration: 220 },
        () => runOnJS(changeVerse)(dir)
      );
    } else {
      translateX.value = withTiming(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-18, 0, 18],
      Extrapolate.CLAMP
    );
    const parallax = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-SCREEN_WIDTH * 0.15, 0, SCREEN_WIDTH * 0.15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { perspective: 1200 },
        { translateX: translateX.value + parallax },
        { rotateY: `${rotation}deg` },
      ],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD, SCREEN_WIDTH],
      [0, 0.2, 0.35],
      Extrapolate.CLAMP
    );

    return {
      opacity: shadowOpacity,
    };
  });

  const animatedLeftFoldStyle = useAnimatedStyle(() => {
    const foldOpacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.3, SCREEN_WIDTH],
      [0, 0.25, 0.4],
      Extrapolate.CLAMP
    );
    const foldScale = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.5],
      [0.85, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: foldOpacity,
      transform: [{ scaleX: foldScale }],
    };
  });

  const animatedRightFoldStyle = useAnimatedStyle(() => {
    const foldOpacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, -SCREEN_WIDTH * 0.3, 0],
      [0.4, 0.25, 0],
      Extrapolate.CLAMP
    );
    const foldScale = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.5, 0],
      [1, 0.85],
      Extrapolate.CLAMP
    );

    return {
      opacity: foldOpacity,
      transform: [{ scaleX: foldScale }],
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
      v.toString()
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
    <LinearGradient colors={palette.gradient as [string, string]} className="flex-1">
      <ScrollView
        className="px-5 pt-5"
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_SPACE + 24,
        }}
      >
        {/* HEADER */}
        <View className="items-center mb-4">
          <BookOpenText color={palette.accent} size={26} />
          <Text style={{ color: palette.accent }} className="mt-1 font-semibold">
            Chapter {verse.chapter}
          </Text>
          <Text style={{ color: palette.muted }} className="text-sm">
            Verse {currentVerseId} / {versesCount}
          </Text>
          <Text style={{ color: palette.muted }} className="text-xs mt-1">
            Swipe left / right to turn the page
          </Text>
        </View>

        {/* VERSE CARD */}
        <PanGestureHandler
          onGestureEvent={(e) => {
            translateX.value = e.nativeEvent.translationX;
          }}
          onEnded={onGestureEnd}
        >
          <Animated.View style={animatedStyle}>
            <View
              style={{
                backgroundColor: palette.page,
                borderColor: palette.pageBorder,
              }}
              className="rounded-[28px] border p-6"
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#000",
                    borderRadius: 28,
                  },
                  animatedShadowStyle,
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: 10,
                    bottom: 10,
                    left: 0,
                    width: 32,
                    backgroundColor: palette.pageBorder,
                    borderTopLeftRadius: 24,
                    borderBottomLeftRadius: 24,
                  },
                  animatedLeftFoldStyle,
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: 10,
                    bottom: 10,
                    right: 0,
                    width: 32,
                    backgroundColor: palette.pageBorder,
                    borderTopRightRadius: 24,
                    borderBottomRightRadius: 24,
                  },
                  animatedRightFoldStyle,
                ]}
              />
              <Text
                style={{ color: palette.accent }}
                className="text-xs font-semibold mb-2"
              >
                Sanskrit
              </Text>

              <Text
                style={{ color: palette.text }}
                className="text-[25px] leading-10 font-semibold mb-6"
              >
                {verse.slok}
              </Text>

              <View
                style={{ backgroundColor: palette.innerCard }}
                className="rounded-2xl p-4 mb-4"
              >
                <Text
                  style={{ color: palette.accent }}
                  className="font-semibold mb-1"
                >
                  हिंदी भावार्थ
                </Text>
                <Text style={{ color: palette.text }}>
                  {verse.tej.ht}
                </Text>
              </View>

              <View
                style={{ backgroundColor: palette.innerCard }}
                className="rounded-2xl p-4"
              >
                <Text
                  style={{ color: palette.accent }}
                  className="font-semibold mb-1"
                >
                  English Meaning
                </Text>
                <Text style={{ color: palette.text }}>
                  {verse.siva.et}
                </Text>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>

        {/* ACTIONS */}
        <View className="flex-row mt-5 gap-3">
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{ backgroundColor: palette.buttonBg }}
            className="flex-1 rounded-2xl px-4 py-3 flex-row items-center justify-center"
          >
            <Heart
              size={20}
              color={isFavorite ? "#E11D48" : palette.muted}
            />
            <Text style={{ color: palette.text }} className="ml-2">
              {isFavorite ? "Favorited" : "Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRead}
            style={{ backgroundColor: palette.buttonBg }}
            className="flex-1 rounded-2xl px-4 py-3 flex-row items-center justify-center"
          >
            {isRead ? (
              <CheckSquare color="#5BB974" size={20} />
            ) : (
              <Square color={palette.muted} size={20} />
            )}
            <Text style={{ color: palette.text }} className="ml-2">
              {isRead ? "Read" : "Mark Read"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
