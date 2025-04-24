import { ScrollView, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ProgressBar } from "react-native-paper";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import SkeletonCard from "@/components/skeletonCard";
import { useThemeStyle } from "@/hooks/useThemeStyle";

export default function ChaptersScreen() {
  const router = useRouter();
  const [chapters, setChapters] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const { textColor, bgColor, sectionBg } = useThemeStyle();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await api.get("/chapters");
        setChapters(response.data);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-2 ${textColor}`}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`p-2 px-6 ${bgColor}`}>
      <Text className={`text-2xl font-bold mb-4 ms-1 ${textColor}`}>📖 All Chapters</Text>

      {chapters.map((chapter: any) => (
        <TouchableOpacity
          key={chapter.chapter_number}
          className={`${sectionBg} rounded-2xl p-4 mb-4 shadow`}
          onPress={() => router.push(`/(tabs)/home/chapters/${chapter.chapter_number}/shlokas`)}
        >
          <View className="flex-row items-center">
            <View className="bg-amber-200 p-3 rounded-full mr-4">
              <BookOpen size={24} color="#92400e" />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${textColor}`}>
                Chapter {chapter.chapter_number}: {chapter.transliteration}
              </Text>
              <Text className="text-sm text-gray-600">{chapter.meaning.en}</Text>
            </View>
          </View>

          <View className="mt-4">
            <ProgressBar
              progress={0}
              color="#facc15"
              style={{ height: 8, borderRadius: 4 }}
            />
            <Text className="text-sm text-gray-500 mt-1 text-right">0% Read</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
