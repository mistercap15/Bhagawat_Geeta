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
import { getSlok } from "@/utils/gitaData";
import { useTheme } from "@/context/ThemeContext";
import MaterialLoader from "@/components/MaterialLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useScrollTabBar } from "@/hooks/useScrollTabBar";

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentVerseId, setCurrentVerseId] = useState(parseInt(verse_id as string));
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const { isDarkMode } = useTheme();
  const handleScroll = useScrollTabBar();
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
    setError(false);
    try {
      const slokData = await getSlok(chapterId, verseId);
      if (!slokData) {
        throw new Error("Shloka not found in local data");
      }
      setVerse(slokData);

      const favoriteStatus = await AsyncStorage.getItem(`favorite_verse_${chapterId}_${verseId}`);
      setIsFavorite(favoriteStatus === "true");

      const readStatus = await AsyncStorage.getItem(`read_verse_${chapterId}_${verseId}`);
      setIsRead(readStatus === "true");
    } catch (error) {
      console.error("Error fetching verse details:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVerseData(id as string, currentVerseId);
  }, [id, currentVerseId]);

  useEffect(() => {
    swipeX.setValue(0);
  }, [currentVerseId, swipeX]);

  const goToPrevious = () => {
    if (currentVerseId > 1) {
      setCurrentVerseId(currentVerseId - 1);
    }
  };

  const goToNext = () => {
    if (currentVerseId < versesCount) {
      setCurrentVerseId(currentVerseId + 1);
    }
  };

  const toggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    if (newFavoriteStatus) {
      await AsyncStorage.setItem(`favorite_verse_${id}_${currentVerseId}`, "true");
    } else {
      await AsyncStorage.removeItem(`favorite_verse_${id}_${currentVerseId}`);
    }
  };

  const toggleRead = async () => {
    const newReadStatus = !isRead;
    setIsRead(newReadStatus);
    await AsyncStorage.setItem(`read_verse_${id}_${currentVerseId}`, newReadStatus.toString());
  };



  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          swipeX.setValue(gesture.dx);
        },
        onPanResponderRelease: (_, gesture) => {
          const threshold = 70;
          if (gesture.dx < -threshold) {
            swipeX.setValue(0);
            goToNext();
          } else if (gesture.dx > threshold) {
            swipeX.setValue(0);
            goToPrevious();
          }
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        },
      }),
    [currentVerseId, versesCount]
  );

  if (loading) {
    return (
      <LinearGradient colors={palette.gradient as [string, string]} className="flex-1 justify-center items-center">
        <MaterialLoader size="large" />
        <Text style={{ color: palette.text }} className="mt-2 text-base">
          {error ? "Missing local shloka data." : "Opening your verse..."}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={palette.gradient as [string, string]} className="flex-1">
      <ScrollView
        className="px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="items-center mb-4">
          <BookOpenText color={palette.accent} size={26} />
          <Text style={{ color: palette.accent }} className="mt-1 font-semibold">
            Chapter {verse.chapter} · Verse {currentVerseId}
          </Text>
          <Text style={{ color: palette.muted }} className="text-xs mt-1">
            Swipe left/right on the verse card to move between shlokas
          </Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateX: swipeX }] }}
          className="rounded-[28px] p-5"
        >
          <View
            style={{ backgroundColor: palette.page, borderColor: palette.pageBorder }}
            className="rounded-[28px] border p-6"
          >
            <Text style={{ color: palette.accent }} className="text-xs tracking-[1.5px] uppercase font-semibold mb-2">
              Sanskrit
            </Text>
            <Text style={{ color: palette.text }} className="text-[25px] leading-10 font-semibold mb-6">
              {verse.slok}
            </Text>

            <View style={{ backgroundColor: isDarkMode ? "#312C3A" : "#FDF2E5" }} className="rounded-2xl p-4 mb-4">
              <Text style={{ color: palette.accent }} className="text-sm font-semibold mb-1">
                हिंदी भावार्थ
              </Text>
              <Text style={{ color: palette.text }} className="text-base leading-7">
                {verse.tej.ht}
              </Text>
            </View>

            <View style={{ backgroundColor: isDarkMode ? "#312C3A" : "#FDF2E5" }} className="rounded-2xl p-4">
              <Text style={{ color: palette.accent }} className="text-sm font-semibold mb-1">
                English Meaning
              </Text>
              <Text style={{ color: palette.text }} className="text-base leading-7">
                {verse.siva.et}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-row mt-5 gap-3">
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{ backgroundColor: palette.buttonBg, borderColor: palette.pageBorder }}
            className="flex-1 border rounded-2xl px-4 py-3 flex-row items-center justify-center"
          >
            <Heart color={isFavorite ? "#E11D48" : palette.muted} size={20} />
            <Text style={{ color: palette.text }} className="ml-2 font-medium">
              {isFavorite ? "Favorited" : "Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRead}
            style={{ backgroundColor: palette.buttonBg, borderColor: palette.pageBorder }}
            className="flex-1 border rounded-2xl px-4 py-3 flex-row items-center justify-center"
          >
            {isRead ? <CheckSquare color="#5BB974" size={20} /> : <Square color={palette.muted} size={20} />}
            <Text style={{ color: palette.text }} className="ml-2 font-medium">
              {isRead ? "Read" : "Mark Read"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9", borderColor: palette.pageBorder }} className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 border-t">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPrevious}
            disabled={currentVerseId <= 1}
            style={{
              backgroundColor: palette.buttonBg,
              opacity: currentVerseId <= 1 ? 0.4 : 1,
            }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <ChevronLeft color={palette.accent} size={24} />
          </TouchableOpacity>

          <Text style={{ color: palette.text }} className="text-base font-semibold">
            {currentVerseId} / {versesCount}
          </Text>

          <TouchableOpacity
            onPress={goToNext}
            disabled={currentVerseId >= versesCount}
            style={{
              backgroundColor: palette.buttonBg,
              opacity: currentVerseId >= versesCount ? 0.4 : 1,
            }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <ChevronRight color={palette.accent} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
