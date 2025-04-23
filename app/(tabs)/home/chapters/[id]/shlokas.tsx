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

export default function ShlokasScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <View className="flex-1 justify-center items-center bg-[#fff7ed]">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="mt-2 text-amber-900">Loading chapter...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#fff7ed", "#fffbeb"]} className="flex-1">
      <ScrollView className="px-6 py-4">
        <View className="mb-6 p-5 bg-white rounded-2xl shadow">
          <Text className="text-2xl font-bold text-amber-900 mb-1">
            📖 Chapter {chapter.chapter_number}: {chapter.transliteration}
          </Text>
          <Text className="text-base text-gray-700 italic mb-3">
            "{chapter.meaning.en}"
          </Text>
          <Text className="text-gray-800 leading-relaxed text-[16px]">
            {chapter.summary.en}
          </Text>
        </View>

        {verses.map((verse, index) => (
          <View
            key={verse.verse_number}
            className="bg-white rounded-2xl p-5 mb-5 shadow"
          >
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/home/chapters/${id}/${verse.verse_number}?verses_count=${chapter.verses_count}`
                )
              }
              className="text-amber-900"
            >
              <View className="border-l-4 border-amber-500 pl-4">
                <Text className="text-lg font-semibold text-amber-900 mb-2">
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
              <Text className="ml-2 text-amber-900 font-medium">
                {favorites[index] ? "Added to Favorites" : "Add to Favorites"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
  