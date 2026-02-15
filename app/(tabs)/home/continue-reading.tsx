import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen } from "lucide-react-native";
import MaterialLoader from "@/components/MaterialLoader";
import { getChapter } from "@/utils/gitaData";

export default function ContinueReadingScreen() {
  const [lastRead, setLastRead] = useState<any>(null);
  const [versesCount, setVersesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const cardBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";
  const subText = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  useFocusEffect(
    useCallback(() => {
      const loadLastRead = async () => {
        setLoading(true);

        const stored = await AsyncStorage.getItem("last_read");

        if (stored) {
          const parsed = JSON.parse(stored);
          setLastRead(parsed);

          // ✅ Fetch correct verses_count
          const chapterData = await getChapter(
            parsed.chapter.toString()
          );

          if (chapterData) {
            setVersesCount(chapterData.verses_count);
          }
        } else {
          setLastRead(null);
          setVersesCount(null);
        }

        setLoading(false);
      };

      loadLastRead();
    }, [])
  );

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDarkMode ? "bg-[#1C1B1F]" : "bg-[#FFF8F1]"
        }`}
      >
        <MaterialLoader size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ["#1C1B1F", "#2B2930"]
          : ["#FFF8F1", "#FFEAD7"]
      }
      className="flex-1"
    >
      <ScrollView className="px-6 pt-6">
        <Text className={`text-3xl font-bold mb-6 ${textColor}`}>
          📖 Continue Reading
        </Text>

        {!lastRead ? (
          <Text className={`text-base ${subText}`}>
            You haven't started reading yet 🙏
          </Text>
        ) : (
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/home/chapters/${lastRead.chapter}/${lastRead.verse}?verses_count=${versesCount}`
              )
            }
            className={`${cardBg} rounded-3xl p-6 border border-[#E8D5C4]`}
          >
            <View className="flex-row items-center">
              <View className="bg-[#FFDDB8] p-3 rounded-full mr-4">
                <BookOpen size={24} color="#8A4D24" />
              </View>

              <View>
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Chapter {lastRead.chapter}
                </Text>
                <Text className={`text-sm ${subText}`}>
                  Resume from Verse {lastRead.verse}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
