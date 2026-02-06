import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckSquare,
  Square,
  BookOpenText,
} from "lucide-react-native";
import api from "@/utils/api";
import { useTheme } from "@/context/ThemeContext";
import MaterialLoader from "@/components/MaterialLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();

  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerseId, setCurrentVerseId] = useState(
    parseInt(verse_id as string)
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const { isDarkMode } = useTheme();
  const versesCount = parseInt(verses_count as string);

  const swipeX = useRef(new Animated.Value(0)).current;

  const palette = useMemo(
    () => ({
      gradient: isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"],
      page: isDarkMode ? "#3A3444" : "#FFF8ED",
      pageBorder: isDarkMode ? "#4A4458" : "#E8D5C4",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      muted: isDarkMode ? "#CAC4D0" : "#625B71",
      accent: isDarkMode ? "#FFB59D" : "#8A4D24",
      buttonBg: isDarkMode ? "#352F3F" : "#FFFDF9",
    }),
    [isDarkMode]
  );

  const fetchVerseData = async (chapterId: string, verseId: number) => {
    try {
      const response = await api.get(`/slok/${chapterId}/${verseId}`);
      setVerse(response.data);

      const fav = await AsyncStorage.getItem(
        `favorite_verse_${chapterId}_${verseId}`
      );
      const read = await AsyncStorage.getItem(
        `read_verse_${chapterId}_${verseId}`
      );

      setIsFavorite(fav === "true");
      setIsRead(read === "true");
    } catch (err) {
      console.error("Verse fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVerseData(id as string, currentVerseId);
  }, [id, currentVerseId]);

  const animateAndGo = (direction: "next" | "prev") => {
    const toValue = direction === "next" ? -350 : 350;

    Animated.timing(swipeX, {
      toValue,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      swipeX.setValue(0);
      setCurrentVerseId((prev) =>
        direction === "next" ? prev + 1 : prev - 1
      );
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy),

        onPanResponderMove: (_, g) => {
          swipeX.setValue(g.dx);
        },

        onPanResponderRelease: (_, g) => {
          const threshold = 70;

          if (g.dx < -threshold && currentVerseId < versesCount) {
            animateAndGo("next");
          } else if (g.dx > threshold && currentVerseId > 1) {
            animateAndGo("prev");
          } else {
            Animated.spring(swipeX, {
              toValue: 0,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [currentVerseId, versesCount]
  );

  const toggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);

    if (next) {
      await AsyncStorage.setItem(
        `favorite_verse_${id}_${currentVerseId}`,
        "true"
      );
    } else {
      await AsyncStorage.removeItem(
        `favorite_verse_${id}_${currentVerseId}`
      );
    }
  };

  const toggleRead = async () => {
    const next = !isRead;
    setIsRead(next);
    await AsyncStorage.setItem(
      `read_verse_${id}_${currentVerseId}`,
      next.toString()
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={palette.gradient as [string, string]}
        className="flex-1 items-center justify-center"
      >
        <MaterialLoader size="large" />
        <Text style={{ color: palette.text }} className="mt-2">
          Opening your verse...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={palette.gradient as [string, string]}
      className="flex-1"
    >
      <ScrollView className="px-5 pt-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="items-center mb-4">
          <BookOpenText size={26} color={palette.accent} />
          <Text style={{ color: palette.accent }} className="mt-1 font-semibold">
            Chapter {verse.chapter} · Verse {currentVerseId}
          </Text>
          <Text style={{ color: palette.muted }} className="text-xs mt-1">
            Swipe left or right to change verse
          </Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX: swipeX }],
            opacity: swipeX.interpolate({
              inputRange: [-300, 0, 300],
              outputRange: [0.7, 1, 0.7],
            }),
          }}
          className="rounded-[28px]"
        >
          <View
            style={{ backgroundColor: palette.page, borderColor: palette.pageBorder }}
            className="border rounded-[28px] p-6"
          >
            <Text style={{ color: palette.accent }} className="text-xs uppercase font-semibold mb-2">
              Sanskrit
            </Text>
            <Text style={{ color: palette.text }} className="text-[25px] leading-10 font-semibold mb-6">
              {verse.slok}
            </Text>

            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: isDarkMode ? "#312C3A" : "#FDF2E5" }}>
              <Text style={{ color: palette.accent }} className="font-semibold mb-1">
                हिंदी भावार्थ
              </Text>
              <Text style={{ color: palette.text }} className="leading-7">
                {verse.tej.ht}
              </Text>
            </View>

            <View className="rounded-2xl p-4" style={{ backgroundColor: isDarkMode ? "#312C3A" : "#FDF2E5" }}>
              <Text style={{ color: palette.accent }} className="font-semibold mb-1">
                English Meaning
              </Text>
              <Text style={{ color: palette.text }} className="leading-7">
                {verse.siva.et}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-row gap-3 mt-5">
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{ backgroundColor: palette.buttonBg }}
            className="flex-1 rounded-2xl px-4 py-3 flex-row items-center justify-center"
          >
            <Heart size={20} color={isFavorite ? "#E11D48" : palette.muted} />
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
              <CheckSquare size={20} color="#5BB974" />
            ) : (
              <Square size={20} color={palette.muted} />
            )}
            <Text style={{ color: palette.text }} className="ml-2">
              {isRead ? "Read" : "Mark Read"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 py-5 border-t"
        style={{ backgroundColor: palette.buttonBg, borderColor: palette.pageBorder }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            disabled={currentVerseId <= 1}
            onPress={() => animateAndGo("prev")}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ opacity: currentVerseId <= 1 ? 0.4 : 1 }}
          >
            <ChevronLeft color={palette.accent} size={24} />
          </TouchableOpacity>

          <Text style={{ color: palette.text }} className="font-semibold">
            {currentVerseId} / {versesCount}
          </Text>

          <TouchableOpacity
            disabled={currentVerseId >= versesCount}
            onPress={() => animateAndGo("next")}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ opacity: currentVerseId >= versesCount ? 0.4 : 1 }}
          >
            <ChevronRight color={palette.accent} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
