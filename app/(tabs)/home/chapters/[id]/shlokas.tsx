import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";
import api from "@/utils/api";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useTheme } from "@/context/ThemeContext";

export default function ShlokasScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
   const { isDarkMode } = useTheme();
   const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
   const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
   const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  const fetchChapterData = async () => {
    try {
      const chapterRes = await api.get(`/chapter/${id}/`);
      const versesCount = chapterRes.data.verses_count;
      const versesList = Array.from({ length: versesCount }, (_, index) => ({
        verse_number: index + 1,
      }));

      setChapter(chapterRes.data);
      setVerses(versesList);
      setFavorites(new Array(versesCount).fill(false));
    } catch (error) {
      console.error("Error fetching chapter or verses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterData();
  }, [id]);

  const toggleFavorite = (index: number) => {
    const updated = [...favorites];
    updated[index] = !updated[index];
    setFavorites(updated);
  };

  if (loading || !chapter) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-2 ${textColor}`}>Loading chapter...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#fff7ed", "#fffbeb"]}
      className="flex-1"
    >
      <ScrollView className={`px-6 py-4 ${bgColor}`}>
        <View className={`mb-6 p-5 rounded-2xl shadow ${sectionBg}`}>
          <Text className={`text-2xl font-bold mb-1 ${textColor}`}>
            📖 Chapter {chapter.chapter_number}: {chapter.transliteration}
          </Text>
          <Text className="text-base text-gray-500 italic mb-3">
            "{chapter.meaning.en}"
          </Text>
          <Text className={`leading-relaxed text-[16px] ${textColor}`}>
            {chapter.summary.en}
          </Text>
        </View>

        {verses.map((verse, index) => (
          <View
            key={verse.verse_number}
            className={`rounded-2xl p-5 mb-5 shadow ${sectionBg}`}
          >
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/home/chapters/${id}/${verse.verse_number}?verses_count=${chapter.verses_count}`
                )
              }
            >
              <View className="border-l-4 border-amber-500 pl-4">
                <Text className={`text-lg font-semibold mb-2 ${textColor}`}>
                  Verse {verse.verse_number}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center mt-4"
              onPress={() => toggleFavorite(index)}
            >
              <Star
                size={24}
                color={favorites[index] ? "#f59e0b" : "#d1d5db"}
              />
              <Text className={`ml-2 font-medium ${textColor}`}>
                {favorites[index] ? "Added to Favorites" : "Add to Favorites"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
