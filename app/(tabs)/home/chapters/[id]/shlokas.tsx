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
import api from "@/utils/api";
import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle } from "lucide-react-native";

export default function ShlokasScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const secondaryText = isDarkMode ? "text-gray-400" : "text-gray-600";
  const [readVerses, setReadVerses] = useState<Set<number>>(new Set());

  const fetchChapterData = async () => {
    try {
      const chapterRes = await api.get(`/chapter/${id}/`);
      const versesCount = chapterRes.data.verses_count;

      // Prepare the read verses
      const readSet = new Set<number>();
      for (let i = 1; i <= versesCount; i++) {
        const key = `read_verse_${
          i + (chapterRes.data.chapter_number - 1) * 100
        }`;
        const isRead = await AsyncStorage.getItem(key);
        if (isRead === "true") {
          readSet.add(i);
        }
      }

      setReadVerses(readSet);
      setChapter(chapterRes.data);
      setVerses(
        Array.from({ length: versesCount }, (_, index) => ({
          verse_number: index + 1,
        }))
      );
    } catch (error) {
      console.error("Error fetching chapter or verses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterData();
  }, [id]);

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
      colors={isDarkMode ? ["#111827", "#1f2937"] : ["#fff7ed", "#fefce8"]}
      className="flex-1"
    >
      <ScrollView
        className={`px-6 pt-6 ${bgColor}`}
        contentContainerStyle={{ paddingBottom: 25 }}
      >
        <View
          className={`mb-8 p-6 rounded-3xl ${sectionBg} shadow-md`}
          style={{
            shadowColor: isDarkMode ? "#000" : "#fbbf24",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
            📖 अध्याय {chapter.chapter_number}: {chapter.transliteration}
          </Text>
          <Text className={`italic mb-4 text-[15px] ${secondaryText}`}>
            “{chapter.meaning.en}”
          </Text>
          <Text className={`leading-relaxed text-[16px] ${textColor}`}>
            {chapter.summary.en}
          </Text>
        </View>

        {/* Verse List */}
        {verses.map((verse) => (
          <TouchableOpacity
            key={verse.verse_number}
            onPress={() =>
              router.push(
                `/home/chapters/${id}/${verse.verse_number}?verses_count=${chapter.verses_count}`
              )
            }
            className={`rounded-2xl p-5 mb-4 shadow ${sectionBg}`}
            style={{
              shadowColor: isDarkMode ? "#000" : "#fbbf24",
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="border-l-4 border-amber-500 pl-4 flex-1">
                <Text className={`text-lg font-semibold mb-2 ${textColor}`}>
                  Verse {verse.verse_number}
                </Text>
                <Text className={`text-base ${textColor}`}>
                  श्लोक {verse.verse_number}
                </Text>
              </View>
              {readVerses.has(verse.verse_number) && (
                <CheckCircle size={22} color="#22c55e" className="ml-2" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
