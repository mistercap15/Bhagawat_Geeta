import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckSquare,
  Square,
} from "lucide-react-native";
import api from "@/utils/api";
import { useTheme } from "@/context/ThemeContext";
import MaterialLoader from "@/components/MaterialLoader";
import { ProgressBar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerseId, setCurrentVerseId] = useState(
    parseInt(verse_id as string)
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";

  const fetchVerseData = async (chapterId: string, verseId: number) => {
    try {
      const response = await api.get(`/slok/${chapterId}/${verseId}`);
      setVerse(response.data);

      const favoriteStatus = await AsyncStorage.getItem(`favorite_verse_${chapterId}_${verseId}`);
      setIsFavorite(favoriteStatus === "true");

      const readStatus = await AsyncStorage.getItem(`read_verse_${chapterId}_${verseId}`);
      setIsRead(readStatus === "true");      
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

  const toggleFavorite = async () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    if (newFavoriteStatus) {
      await AsyncStorage.setItem(
        `favorite_verse_${id}_${verse.verse}`,
        "true"
      );
    } else {
      await AsyncStorage.removeItem(`favorite_verse_${id}_${verse.verse}`);
    }
  };

  const toggleRead = async () => {
    const newReadStatus = !isRead;
    setIsRead(newReadStatus);
    await AsyncStorage.setItem(
      `read_verse_${id}_${currentVerseId}`,
      newReadStatus.toString()
    );
  };  

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <MaterialLoader size="large" />
        <Text className={`mt-2 ${textColor}`}>Loading verse...</Text>
      </View>
    );
  }

  return (
    <>
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

        <View className={`mb-8`}>
          <Text className={`text-lg font-semibold mb-2 text-amber-800`}>
            English Translation
          </Text>
          <Text className={`text-base leading-relaxed ${textColor}`}>
            {verse.siva.et}
          </Text>
        </View>

        <View className="flex-row justify-between mb-6 space-x-6">
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity onPress={toggleFavorite}>
              {isFavorite ? (
                <Heart color="#f59e0b" size={28} />
              ) : (
                <Heart color="#d1d5db" size={28} />
              )}
            </TouchableOpacity>
            <Text className={`${textColor} text-lg ms-2`}>
              {isFavorite ? "In Favorites" : "Add to Favorites"}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity onPress={toggleRead}>
              {isRead ? (
                <CheckSquare color="#34d399" size={28} />
              ) : (
                <Square color="#d1d5db" size={28} />
              )}
            </TouchableOpacity>
            <Text className={`${textColor} text-lg ms-2`}>
              {isRead ? "Marked as Read" : "Mark as Read"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className={`px-6 py-4 ${bgColor}`}>
        <View className="flex-row items-center justify-between w-full mb-3">
          <View className="flex-1 items-start">
            {currentVerseId > 1 && (
              <TouchableOpacity
                onPress={goToPrevious}
                className={`w-10 h-10 rounded-full justify-center items-center ${sectionBg}`}
              >
                <ChevronLeft color="#92400e" size={24} />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1 items-center">
            <Text className={`text-lg ${textColor}`}>
              Verse {currentVerseId} of {verses_count}
            </Text>
          </View>

          <View className="flex-1 items-end">
            {currentVerseId < parseInt(verses_count as string) && (
              <TouchableOpacity
                onPress={goToNext}
                className={`w-10 h-10 rounded-full justify-center items-center ${sectionBg}`}
              >
                <ChevronRight color="#92400e" size={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
