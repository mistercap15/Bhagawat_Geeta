import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import api from "@/utils/api"; // Custom Axios instance
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useTheme } from "@/context/ThemeContext";

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerseId, setCurrentVerseId] = useState(
    parseInt(verse_id as string)
  );

  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  const fetchVerseData = async (chapterId: string, verseId: number) => {
    try {
      const response = await api.get(`/slok/${chapterId}/${verseId}`);
      setVerse(response.data);
    } catch (error) {
      console.error("Error fetching verse details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVerseData(id as string, currentVerseId);
  }, [id, currentVerseId]);

  const goToPrevious = () => {
    if (currentVerseId > 1) {
      setCurrentVerseId(currentVerseId - 1);
    }
  };

  const goToNext = () => {
    if (currentVerseId < parseInt(verses_count as string)) {
      setCurrentVerseId(currentVerseId + 1);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-2 ${textColor}`}>Loading verse...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/appBackground.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.15 }}
    >
      <ScrollView className={`px-6 py-4 ${bgColor}`}>
        <Text className={`text-2xl font-semibold mb-4 ${textColor}`}>
          Chapter {verse.chapter}, Verse {verse.verse}
        </Text>

        <View className="border-l-4 border-amber-500 pl-4 mb-6">
          <Text className={`text-2xl font-bold leading-relaxed ${textColor}`}>
            {verse.slok}
          </Text>
        </View>

        <View className={`mb-6`}>
          <Text className={`text-lg font-semibold mb-2 text-amber-800`}>
            Hindi Translation
          </Text>
          <Text className={`text-base leading-relaxed ${textColor}`}>
            {verse.tej.ht}
          </Text>
        </View>

        <View className={`mb-6`}>
          <Text className={`text-lg font-semibold mb-2 text-amber-800`}>
            English Translation
          </Text>
          <Text className={`text-base leading-relaxed ${textColor}`}>
            {verse.siva.et}
          </Text>
        </View>
      </ScrollView>

      <View className={`px-6 py-4 ${bgColor}`}>
  <View className="flex-row justify-between items-center w-full mb-3">
    <TouchableOpacity
      onPress={goToPrevious}
      disabled={currentVerseId <= 1}
      className={`w-10 h-10 rounded-full justify-center items-center ${
        currentVerseId > 1 ? sectionBg : "bg-gray-400"
      }`}
    >
      {currentVerseId > 1 && <ChevronLeft color="#92400e" size={24} />}
    </TouchableOpacity>

    <TouchableOpacity
      onPress={goToNext}
      disabled={currentVerseId >= parseInt(verses_count as string)}
      className={`w-10 h-10 rounded-full justify-center items-center ${
        currentVerseId < parseInt(verses_count as string)
          ? sectionBg
          : "bg-gray-400"
      }`}
    >
      {currentVerseId < parseInt(verses_count as string) && (
        <ChevronRight color="#92400e" size={24} />
      )}
    </TouchableOpacity>
  </View>

  <Text className={`text-center text-lg ${textColor}`}>
    Verse {currentVerseId} of {verses_count}
  </Text>
</View>


    </ImageBackground>
  );
}
