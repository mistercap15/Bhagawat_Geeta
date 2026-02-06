import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getChapter } from "@/utils/gitaData";
import { useTheme } from "@/context/ThemeContext";
import MaterialLoader from "@/components/MaterialLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle } from "lucide-react-native";
import { useScrollTabBar } from "@/hooks/useScrollTabBar";

export default function ShlokasScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const handleScroll = useScrollTabBar();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const sectionBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";
  const secondaryText = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";
  const borderColor = isDarkMode ? "#4A4458" : "#E8D5C4";

  const fetchChapterData = async () => {
    try {
      const chapterData = await getChapter(id as string);
      const versesCount = chapterData.verses_count;
      const readSet = new Set<number>();
      for (let i = 1; i <= versesCount; i++) {
        const key = `read_verse_${chapterData.chapter_number}_${i}`;
        const isRead = await AsyncStorage.getItem(key);
        if (isRead === "true") {
          readSet.add(i);
        }
      }

      setReadVerses(readSet);
      setChapter(chapterData);
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

  const [readVerses, setReadVerses] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      fetchChapterData();
    }, [id])
  );

  if (loading || !chapter) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? "bg-[#1C1B1F]" : "bg-[#FFF8F1]"}`}>
        <MaterialLoader size="large" />
        <Text className={`mt-2 ${textColor}`}>Loading chapter...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        className="px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 90 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          className={`mb-8 p-6 rounded-3xl ${sectionBg}`}
          style={{
            borderWidth: 1,
            borderColor,
          }}
        >
          <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
            📖 अध्याय {chapter.chapter_number}: {chapter.transliteration}
          </Text>
          <Text className={`italic mb-4 text-[15px] ${secondaryText}`}>
            “{chapter.meaning.en}”
          </Text>
          <Text className={`leading-relaxed text-[16px] ${secondaryText}`}>
            {chapter.summary.en}
          </Text>
        </View>

        {verses.map((verse) => (
          <TouchableOpacity
            key={verse.verse_number}
            onPress={() =>
              router.push(
                `/home/chapters/${id}/${verse.verse_number}?verses_count=${chapter.verses_count}`
              )
            }
            className={`rounded-3xl p-5 mb-4 ${sectionBg}`}
            style={{ borderWidth: 1, borderColor }}
          >
            <View className="flex-row justify-between items-center">
              <View className="border-l-4 border-[#D97706] pl-4 flex-1">
                <Text className={`text-lg font-semibold mb-1 ${textColor}`}>
                  Verse {verse.verse_number}
                </Text>
                <Text className={`text-base ${secondaryText}`}>
                  श्लोक {verse.verse_number}
                </Text>
              </View>
              {readVerses.has(verse.verse_number) && (
                <CheckCircle size={22} color="#5BB974" className="ml-2" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
