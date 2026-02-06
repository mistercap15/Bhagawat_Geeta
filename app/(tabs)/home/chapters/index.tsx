import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { BookOpen } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ProgressBar } from "react-native-paper";
import { useCallback, useState } from "react";
import { getChapters } from "@/utils/gitaData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import MaterialLoader from "@/components/MaterialLoader";
import { useScrollTabBar } from "@/hooks/useScrollTabBar";

export default function ChaptersScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const handleScroll = useScrollTabBar();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const cardBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";
  const textMeaningColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  const fetchChapters = async () => {
    try {
      const chaptersData = await getChapters();

      const updatedChapters = await Promise.all(
        chaptersData.map(async (chapter: any) => {
          let readCount = 0;

          for (let i = 1; i <= chapter.verses_count; i++) {
            const key = `read_verse_${chapter.chapter_number}_${i}`;
            const isRead = await AsyncStorage.getItem(key);
            if (isRead === "true") readCount++;
          }

          const progress = chapter.verses_count
            ? readCount / chapter.verses_count
            : 0;

          return {
            ...chapter,
            readCount,
            progress,
          };
        })
      );

      setChapters(updatedChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChapters();
    }, [])
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? "bg-[#1C1B1F]" : "bg-[#FFF8F1]"}`}>
        <MaterialLoader size="large" />
        <Text className={`mt-2 ${textColor}`}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        className="p-2 px-6"
        contentContainerStyle={{ paddingBottom: 90 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text className={`text-3xl font-bold mb-5 mt-3 ${textColor}`}>📖 All Chapters</Text>

        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.chapter_number}
            className={`${cardBg} rounded-3xl p-4 mb-4 border border-[#E8D5C4]`}
            onPress={() =>
              router.push(`/(tabs)/home/chapters/${chapter.chapter_number}/shlokas`)
            }
          >
            <View className="flex-row items-center">
              <View className="bg-[#FFDDB8] p-3 rounded-full mr-4">
                <BookOpen size={24} color="#8A4D24" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Chapter {chapter.chapter_number}: {chapter.name}
                </Text>
                <Text className={`text-sm ${textMeaningColor}`}>{chapter.meaning.en}</Text>
                <Text className={`text-sm ${textMeaningColor}`}>{chapter.meaning.hi}</Text>
              </View>
            </View>

            <View className="mt-4">
              <ProgressBar
                progress={chapter.progress}
                color={isDarkMode ? "#D0BCFF" : "#8A4D24"}
                style={{ height: 10, borderRadius: 10, backgroundColor: isDarkMode ? "#4A4458" : "#F8E7DA" }}
              />
              <Text className={`text-sm mt-1 text-right ${textMeaningColor}`}>
                {Math.round(chapter.progress * 100)}% Read
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
