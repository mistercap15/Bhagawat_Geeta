import {
  Image,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import {
  Share2,
  BookOpen,
  Headphones,
  BookText,
  Star,
  Sun,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import api from "@/utils/api";

export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(false); // Track error state
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";

  const fetchShloka = async () => {
    setLoading(true); // Start loading
    setError(false); // Reset error state
    const randomChapter = Math.floor(Math.random() * 18) + 1;
    const versesCount: any = {
      1: 47,
      2: 47,
      3: 43,
      4: 42,
      5: 29,
      6: 47,
      7: 30,
      8: 28,
      9: 34,
      10: 42,
      11: 55,
      12: 20,
      13: 35,
      14: 27,
      15: 20,
      16: 24,
      17: 28,
      18: 78,
    };
    const randomVerse =
      Math.floor(Math.random() * versesCount[randomChapter]) + 1;
    try {
      const response = await api.get(`/slok/${randomChapter}/${randomVerse}`);
      const slokaData = response.data;
      setShlokaOfTheDay({
        chapter: slokaData.chapter,
        verse: slokaData.verse,
        text: slokaData.slok,
        translation: slokaData.siva.et,
      });
    } catch (error) {
      console.error("Error fetching sloka of the day:", error);
      setError(true); // Set error state if fetch fails
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchShloka();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShloka();
    setRefreshing(false);
  };

  return (
    <View className={`flex-1 ${bgColor}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(800)}
          className="items-center mt-6 mb-8"
        >
          <BookText size={80} color="#92400e" />
          <Text className={`text-4xl font-bold mt-4 ${textColor}`}>
            Bhagavad Gita
          </Text>
          <Text className={`text-base mt-1 ${textColor}`}>
            Daily Wisdom for the Soul
          </Text>
        </Animated.View>

        {/* Shloka Card */}
        <Animated.View
          entering={FadeInDown.duration(1000)}
          className={`mx-5 ${sectionBg} rounded-3xl shadow-md p-6 mb-8`}
        >
          <Text className={`text-xl font-semibold mb-3 ${textColor}`}>
            📜 Shloka of the Day
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#92400e" /> // Show spinner while loading
          ) : error ? (
            <Text className={`text-base ${textColor} text-center`}>
              No data available at the moment. Pull to refresh.
            </Text>
          ) : shlokaOfTheDay ? (
            <View className="border-l-4 border-amber-500 pl-4">
              <Text className={`text-base mb-2 ${textColor}`}>
                Chapter {shlokaOfTheDay.chapter}, Verse {shlokaOfTheDay.verse}
              </Text>
              <Text
                className={`text-2xl font-bold leading-relaxed mb-3 ${textColor}`}
              >
                {shlokaOfTheDay.text}
              </Text>
              <Text className={`text-base leading-relaxed ${textColor}`}>
                {shlokaOfTheDay.translation}
              </Text>
            </View>
          ) : null}
          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              className="flex-row items-center space-x-1"
              onPress={() => console.log("Share shloka")}
            >
              <Share2 size={18} color="#92400e" />
              <Text className="text-amber-700 font-semibold">Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Explore Gita */}
        <View className={`mx-5 mb-5 rounded-3xl ${sectionBg} p-4`}>
          <Text className={`text-xl font-semibold mb-4 ${textColor}`}>
            🌼 Explore the Gita
          </Text>

          <View className="space-y-4">
            {/* Read Chapters */}
            <Animated.View
              entering={FadeInDown.duration(1200)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <BookOpen size={24} color="#92400e" />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/chapters")}
                className="flex-1 justify-center"
              >
                <View>
                  <Text className={`text-lg font-semibold ${textColor}`}>
                    Read Chapters
                  </Text>
                  <Text className={`text-sm ${textColor} opacity-70`}>
                    Explore all 18 chapters with meanings
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Favorites */}
            <Animated.View
              entering={FadeInDown.duration(1800)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-yellow-200 rounded-full p-3 mr-4 shadow-inner shadow-yellow-300">
                <Star size={24} color="#b45309" />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/favorite")}
                className="flex-1 justify-center"
              >
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Favorites
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Bookmark shlokas you love the most
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Audio Recitations */}
            <Animated.View
              entering={FadeInDown.duration(1400)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <Headphones size={24} color="#92400e" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Audio Recitations
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Listen to Sanskrit recitations anytime
                </Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded-full">
                <Text className="text-xs text-orange-900 font-semibold">
                  Coming Soon
                </Text>
              </View>
            </Animated.View>

            {/* Daily Practice */}
            <Animated.View
              entering={FadeInDown.duration(1600)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-orange-200 rounded-full p-3 mr-4 shadow-inner shadow-orange-300">
                <Sun size={24} color="#c2410c" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Daily Practice
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Set a daily reminder to read or reflect
                </Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded-full">
                <Text className="text-xs text-orange-900 font-semibold">
                  Coming Soon
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(2000)}
              className="items-center mt-8"
            >
              <Text className={`text-sm ${textColor} opacity-60`}>
                Crafted with ❤️ by{" "}
                <Text className="text-amber-800 font-semibold">
                  Khilan Patel
                </Text>
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
