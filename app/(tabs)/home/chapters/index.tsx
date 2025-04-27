import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { BookOpen } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ProgressBar } from "react-native-paper";
import { useCallback, useState } from "react";
import api from "@/utils/api";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

export default function ChaptersScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const textMeaningColor = isDarkMode ? "text-gray-400" : "text-gray-700";

  const fetchChapters = async () => {
    try {
      const response = await api.get("/chapters");
      const chaptersData = response.data;

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
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-2 ${textColor}`}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`p-2 px-6 ${bgColor}`}
    contentContainerStyle={{ paddingBottom: 20}}
    >
      <Text className={`text-2xl font-bold mb-4 ms-1 ${textColor}`}>
        📖 All Chapters
      </Text>

      {chapters.map((chapter) => (
        <TouchableOpacity
          key={chapter.chapter_number}
          className={`${sectionBg} rounded-2xl p-4 mb-4 shadow`}
          onPress={() =>
            router.push(
              `/(tabs)/home/chapters/${chapter.chapter_number}/shlokas`
            )
          }
        >
          <View className="flex-row items-center">
            <View className="bg-amber-200 p-3 rounded-full mr-4">
              <BookOpen size={24} color="#92400e" />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${textColor}`}>
                Chapter {chapter.chapter_number}: {chapter.name}
              </Text>
              <Text className={`text-sm ${textMeaningColor}`}>
                {chapter.meaning.en}
              </Text>
              <Text className={`text-sm ${textMeaningColor}`}>
                {chapter.meaning.hi}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <ProgressBar
              progress={chapter.progress}
              color="#facc15"
              style={{ height: 8, borderRadius: 4 }}
            />
            <Text className="text-sm text-gray-500 mt-1 text-right">
              {Math.round(chapter.progress * 100)}% Read
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
