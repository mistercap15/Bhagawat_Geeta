import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import {
  Share2,
  BookOpen,
  Star,
  Headphones,
  Sun,
  Sparkles,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { getSlok } from "@/utils/gitaData";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaterialLoader from "@/components/MaterialLoader";
import homeLogo from "../../../assets/images/splashScreen.png";
export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";
  const cardBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";
  const viewRef = useRef<any>(null);

  const fetchShloka = async () => {
    setLoading(true);
    setError(false);
    const randomChapter = Math.floor(Math.random() * 18) + 1;
    const versesCount: Record<number, number> = {
      1: 47,
      2: 72,
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
      const slokaData = await getSlok(randomChapter, randomVerse);
      if (!slokaData) {
        throw new Error("Shloka not found in local data");
      }
      setShlokaOfTheDay({
        chapter: slokaData.chapter,
        verse: slokaData.verse,
        text: slokaData.slok,
        translation: slokaData.siva.et,
      });
    } catch (error) {
      console.error("Error fetching sloka of the day:", error);
      setError(true);
    } finally {
      setLoading(false);
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

  const shareShloka = async () => {
    try {
      if (!viewRef.current) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "View not ready to share",
        });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "error",
          text1: "Sharing not supported",
        });
        return;
      }

      // ⏳ Ensure layout & fonts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 300));

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri);

      Toast.show({
        type: "success",
        text1: "Shloka Shared!",
        text2: "Ready to inspire others 📜",
      });
    } catch (error) {
      console.error("Share error:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong while sharing 😔",
      });
    }
  };

  return (
    // <GestureHandlerRootView className="flex-1">
    <>
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        className="flex-1"
      >
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <View className="items-center mt-5 mb-6">
            {/* <View className="rounded-full p-3 bg-[#FFDDB8]"> */}
            <Image
              source={homeLogo}
              style={{
                width: 150,
                height: 150,
                resizeMode: "contain",
              }}
            />
            {/* </View> */}
            <Text className={`text-4xl font-bold mt-4 ${textColor}`}>
              Bhagavad Gita
            </Text>
            <Text className={`text-base mt-1 ${subTextColor}`}>
              Sacred wisdom, beautifully presented
            </Text>
          </View>

          <View
            ref={viewRef}
            collapsable={false}
            className={`mx-5 ${cardBg} rounded-[28px] p-6 mb-6 border border-[#E8D5C4]`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-xl font-semibold ${textColor}`}>
                🌸 Shloka of the Day
              </Text>
              <Sparkles size={20} color={isDarkMode ? "#D0BCFF" : "#7D5260"} />
            </View>
            {loading ? (
              <MaterialLoader size="large" />
            ) : error ? (
              <Text className={`text-base ${subTextColor} text-center`}>
                No data available right now. Pull to refresh.
              </Text>
            ) : shlokaOfTheDay ? (
              <View className="border-l-4 border-[#D97706] pl-4">
                <Text className={`text-base mb-2 ${subTextColor}`}>
                  Chapter {shlokaOfTheDay.chapter}, Verse {shlokaOfTheDay.verse}
                </Text>
                <Text
                  className={`text-[22px] font-semibold leading-9 mb-3 ${textColor}`}
                >
                  {shlokaOfTheDay.text}
                </Text>
                <Text className={`text-base leading-7 ${subTextColor}`}>
                  {shlokaOfTheDay.translation}
                </Text>
              </View>
            ) : null}
            <View className="flex-row justify-end mt-5">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={shareShloka}
              >
                <Share2 size={18} color={isDarkMode ? "#FFB59D" : "#8A4D24"} />
                <Text className="text-[#8A4D24] font-semibold ml-2">Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mx-5 mt-2 mb-8">
            <Text className={`text-xl font-semibold mb-6 ${textColor}`}>
              🙏 Begin Your Journey
            </Text>

            {/* ROW 1 */}
            <View className="flex-row justify-between mb-5">
              {/* Read Chapters */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/home/chapters")}
                className="w-[48%] rounded-[30px] p-5"
                style={{
                  backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#4A4458" : "#E8D5C4",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDarkMode ? 0.4 : 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <BookOpen size={26} color="#8A4D24" />
                </View>

                <Text className={`text-lg font-semibold mt-5 ${textColor}`}>
                  Read Chapters
                </Text>
                <Text className={`text-sm mt-1 ${subTextColor}`}>
                  Explore all 18 chapters
                </Text>
              </TouchableOpacity>

              {/* Favorites */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/home/favorite")}
                className="w-[48%] rounded-[30px] p-5"
                style={{
                  backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#4A4458" : "#E8D5C4",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDarkMode ? 0.4 : 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Star size={26} color="#8A4D24" />
                </View>

                <Text className={`text-lg font-semibold mt-5 ${textColor}`}>
                  Favorites
                </Text>
                <Text className={`text-sm mt-1 ${subTextColor}`}>
                  Your saved verses
                </Text>
              </TouchableOpacity>
            </View>

            {/* ROW 2 */}
            <View className="flex-row justify-between">
              {/* Continue Reading */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/home/continue-reading")}
                className="w-[48%] rounded-[30px] p-5"
                style={{
                  backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#4A4458" : "#E8D5C4",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDarkMode ? 0.4 : 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Sparkles size={26} color="#8A4D24" />
                </View>

                <Text className={`text-lg font-semibold mt-5 ${textColor}`}>
                  Continue Reading
                </Text>
                <Text className={`text-sm mt-1 ${subTextColor}`}>
                  Resume where you left
                </Text>
              </TouchableOpacity>

              {/* Daily Practice */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/home/daily-practice")}
                className="w-[48%] rounded-[30px] p-5"
                style={{
                  backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#4A4458" : "#E8D5C4",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDarkMode ? 0.4 : 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Sun size={26} color="#8A4D24" />
                </View>

                <Text className={`text-lg font-semibold mt-5 ${textColor}`}>
                  Daily Practice
                </Text>
                <Text className={`text-sm mt-1 ${subTextColor}`}>
                  Build spiritual habit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            entering={FadeInDown.duration(2000)}
            className="items-center mt-8"
          >
            <Text className={`text-sm ${textColor} opacity-60`}>
              Crafted with ❤️ by{" "}
              <Text className="text-amber-800 font-semibold">Khilan Patel</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
