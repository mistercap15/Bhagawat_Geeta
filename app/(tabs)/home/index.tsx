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
  BookText,
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { Dimensions } from "react-native";
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
  const screenHeight = Dimensions.get("window").height;
  const viewRef = useRef<any>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const handlePresentModalPress = () => {
    actionSheetRef.current?.show();
  };

  const fetchShloka = async () => {
    setLoading(true);
    setError(false);
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

          <View
            className={`mx-5 rounded-[28px] ${cardBg} p-4 border border-[#E8D5C4]`}
          >
            <Text className={`text-xl font-semibold mb-4 ${textColor}`}>
              🙏 Explore Your Spiritual Journey
            </Text>

            {[
              {
                icon: <BookOpen size={24} color="#8A4D24" />,
                title: "Read Chapters",
                desc: "Explore all 18 chapters with deep meanings",
                onPress: () => router.push("/(tabs)/home/chapters"),
                color: "bg-[#FFDDB8]",
              },
              {
                icon: <Star size={24} color="#8A4D24" />,
                title: "Favorites",
                desc: "Keep your most loved verses in one place",
                onPress: () => router.push("/(tabs)/home/favorite"),
                color: "bg-[#FFE4C4]",
              },
              {
                icon: <Headphones size={24} color="#8A4D24" />,
                title: "Audio Recitations",
                desc: "Sanskrit chants and guided listening",
                onPress: handlePresentModalPress,
                color: "bg-[#FFEAD7]",
                soon: true,
              },
              {
                icon: <Sun size={24} color="#8A4D24" />,
                title: "Daily Practice",
                desc: "Build a mindful reading routine",
                onPress: handlePresentModalPress,
                color: "bg-[#FFEAD7]",
                soon: true,
              },
            ].map((item, index) => (
              <Animated.View
                key={item.title}
                entering={FadeInDown.duration(1100 + index * 200)}
                className="mb-3"
              >
                <TouchableOpacity
                  onPress={item.onPress}
                  className="rounded-3xl px-4 py-4 flex-row items-center border border-[#EEDBC8]"
                >
                  <View className={`${item.color} rounded-full p-3 mr-4`}>
                    {item.icon}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${textColor}`}>
                      {item.title}
                    </Text>
                    <Text className={`text-sm mt-1 ${subTextColor}`}>
                      {item.desc}
                    </Text>
                  </View>
                  {item.soon && (
                    <View className="bg-[#EADDFF] px-2 py-1 rounded-full">
                      <Text className="text-xs text-[#4A4458] font-semibold">
                        Coming Soon
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
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
      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
          minHeight: screenHeight * 0.15,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <Text
          style={{
            color: isDarkMode ? "#E8DEF8" : "#3E2723",
          }}
          className="text-center p-8 text-base"
        >
          This feature is still in development. It will be available soon.
        </Text>
      </ActionSheet>
      </>
    // </GestureHandlerRootView>
  );
}
