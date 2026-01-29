import {
  Image,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  useColorScheme,
  Text,
} from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
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

const shlokas = [
  {
    chapter: 2,
    verse: 47,
    text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action...",
  },
];

export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState(shlokas[0]);
  const router = useRouter();
  useEffect(() => {
    setShlokaOfTheDay(shlokas[Math.floor(Math.random() * shlokas.length)]);
  }, []);
console.log('shlokaOfTheDay', shlokaOfTheDay)
  return (
    <LinearGradient colors={["#fff7ed", "#fffbeb"]} className="flex-1">
      <ScrollView>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(800)}
          className="items-center mt-6 mb-8"
        >
          <BookText size={80} color="#92400e" />
          <Text className="text-4xl font-bold text-amber-900 mt-4">
            Bhagavad Gita
          </Text>
          <Text className="text-base text-amber-700 mt-1">
            Daily Wisdom for the Soul
          </Text>
        </Animated.View>

        {/* Shloka Card */}
        <Animated.View
          entering={FadeInDown.duration(1000)}
          className="mx-5 bg-white rounded-3xl shadow-md p-6 mb-8"
        >
          <Text className="text-xl font-semibold text-amber-900 mb-3">
            📜 Shloka of the Day
          </Text>
          <View className="border-l-4 border-amber-500 pl-4">
            <Text className="text-base text-gray-600 mb-2">
              Chapter {shlokaOfTheDay.chapter}, Verse {shlokaOfTheDay.verse}
            </Text>
            <Text className="text-2xl font-bold text-gray-900 leading-relaxed mb-3">
              {shlokaOfTheDay.text}
            </Text>
            <Text className="text-base text-gray-700 leading-relaxed">
              {shlokaOfTheDay.translation}
            </Text>
          </View>
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
        <View className="mx-5 mb-5 rounded-3xl">
          <Text className="text-xl font-semibold p-4 text-amber-900 mb-4 rounded-3xl">
            🌼 Explore the Gita
          </Text>

          <View className="space-y-4">
            {/* Read Chapters */}
            <Animated.View
              entering={FadeInDown.duration(1200)}
              className="flex-row items-center bg-amber-50 rounded-3xl px-5 py-4"
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <BookOpen size={24} color="#92400e" />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/chapters")}
                className="flex-1 justify-center"
              >
                <View>
                  <Text className="text-lg font-semibold text-amber-900">
                    Read Chapters
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Explore all 18 chapters with meanings
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Audio Recitations */}
            <Animated.View
              entering={FadeInDown.duration(1400)}
              className="flex-row items-center bg-amber-50 rounded-3xl px-5 py-4"
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <Headphones size={24} color="#92400e" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-amber-900">
                  Audio Recitations
                </Text>
                <Text className="text-sm text-gray-600">
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
              className="flex-row items-center bg-orange-50 rounded-3xl px-5 py-4"
            >
              <View className="bg-orange-200 rounded-full p-3 mr-4 shadow-inner shadow-orange-300">
                <Sun size={24} color="#c2410c" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-amber-900">
                  Daily Practice
                </Text>
                <Text className="text-sm text-gray-600">
                  Set a daily reminder to read or reflect
                </Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded-full">
                <Text className="text-xs text-orange-900 font-semibold">
                  Coming Soon
                </Text>
              </View>
            </Animated.View>

            {/* Favorites */}
            <Animated.View
              entering={FadeInDown.duration(1800)}
              className="flex-row items-center bg-yellow-50 rounded-3xl px-5 py-4"
            >
              <View className="bg-yellow-200 rounded-full p-3 mr-4 shadow-inner shadow-yellow-300">
                <Star size={24} color="#b45309" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-amber-900">
                  Favorites
                </Text>
                 
                <Text className="text-sm text-gray-600">
                  Bookmark shlokas you love the most
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
              <Text className="text-sm text-gray-500">
                Crafted with ❤️ by{" "}
                <Text className="text-amber-800 font-semibold">
                  Khilan Patel
                </Text>
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
