import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import api from "@/utils/api";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const favKeys = keys.filter((key) => key.startsWith("favorite_verse_"));
        const favVerseInfos:any = favKeys.map((key) => key.split("_").slice(2));
        
        const fetches = favVerseInfos.map(([chapter, verse]:any) =>
          api.get(`/slok/${chapter}/${verse}`).then(res => res.data)
        );

        const results = await Promise.all(fetches);
        setFavorites(results);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-2 ${textColor}`}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <Text className={`text-lg ${textColor}`}>No favorites yet!</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 p-4 ${bgColor}`}>
      {favorites.map((verse, index) => (
        <TouchableOpacity
          key={index}
          className={`mb-4 p-4 rounded-xl ${sectionBg}`}
          onPress={() =>
            router.push(`/home/chapters/${verse.chapter}/${verse.verse}`)
          }
        >
          <Text className={`text-lg font-semibold ${textColor}`}>
            Chapter {verse.chapter}, Verse {verse.verse}
          </Text>
          <Text className={`text-sm mt-1 ${textColor}`}>{verse.slok}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
