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
import { LinearGradient } from "expo-linear-gradient";
import api from "@/utils/api"; // Custom Axios instance
import { ChevronLeft, ChevronRight } from "lucide-react-native";

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerseId, setCurrentVerseId] = useState(
    parseInt(verse_id as string)
  );

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

  // Navigation functions
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
      <View className="flex-1 justify-center items-center bg-[#fff7ed]">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="mt-2 text-amber-900">Loading verse...</Text>
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
      <ScrollView className="px-6 py-4">
        <Text className="text-2xl font-semibold text-amber-900 mb-4">
          Chapter {verse.chapter}, Verse {verse.verse}
        </Text>

        <View className="border-l-4 border-amber-500 pl-4 mb-6">
          <Text className="text-2xl font-bold text-gray-900 leading-relaxed">
            {verse.slok}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-amber-800 mb-2">
            Hindi Translation
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {verse.tej.ht}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-amber-800 mb-2">
            English Translation
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {verse.siva.et}
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row justify-between items-center w-full px-6">
        <TouchableOpacity
          onPress={goToPrevious}
          disabled={currentVerseId <= 1}
          className="w-10 h-10 rounded-full bg-amber-100 justify-center items-center"
        >
          {currentVerseId > 1 && <ChevronLeft color="#92400e" size={24} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNext}
          disabled={currentVerseId >= parseInt(verses_count as string)}
          className="w-10 h-10 rounded-full bg-amber-100 justify-center items-center"
        >
          {currentVerseId < parseInt(verses_count as string) && (
            <ChevronRight color="#92400e" size={24} />
          )}
        </TouchableOpacity>
      </View>

      <View className="px-6 mb-6">
        <Text className="text-center text-lg text-amber-900">
          Verse {currentVerseId} of {verses_count}
        </Text>
      </View>
    </ImageBackground>
  );
}
