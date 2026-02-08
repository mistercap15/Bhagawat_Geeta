import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { getSlok } from "@/utils/gitaData";
import MaterialLoader from "@/components/MaterialLoader";

// ✅ LOCAL JSON
import chaptersData from "@/data/gita.json";

/* ✅ TYPE DEFINITIONS (INLINE – QUICK FIX) */
type ChapterMeta = {
  chapter_number: number;
  verses_count: number;
};

type ChaptersJSON = {
  chapters: ChapterMeta[];
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";

  /* ✅ SAFE CAST JSON */
  const { chapters } = chaptersData as ChaptersJSON;

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // 1️⃣ Get all AsyncStorage keys
        const keys = await AsyncStorage.getAllKeys();

        // 2️⃣ Filter favorite keys
        const favKeys = keys.filter((key) =>
          key.startsWith("favorite_verse_")
        );

        // 3️⃣ Extract chapter & verse
        const favVerseInfos = favKeys.map((key) => {
          const [, , chapter, verse] = key.split("_");
          return [chapter, verse];
        });

        // 4️⃣ Fetch verse + enrich with verses_count from JSON
        const fetches = favVerseInfos.map(async ([chapter, verse]) => {
          const slok = await getSlok(chapter, verse);

          const chapterMeta = chapters.find(
            (c) => String(c.chapter_number) === String(chapter)
          );

          return {
            ...slok,
            verses_count: chapterMeta?.verses_count ?? 0,
          };
        });

        const results = await Promise.all(fetches);
        setFavorites(results.filter(Boolean));
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  /* ⏳ LOADER */
  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <MaterialLoader size="large" />
        <Text className={`mt-2 ${textColor}`}>Loading favorites...</Text>
      </View>
    );
  }

  /* 📭 EMPTY STATE */
  if (favorites.length === 0) {
    return (
      <View className={`flex-1 justify-center items-center ${bgColor}`}>
        <Text className={`text-lg ${textColor}`}>No favorites yet!</Text>
      </View>
    );
  }

  /* 📜 FAVORITES LIST */
  return (
    <ScrollView
      className={`flex-1 p-4 ${bgColor}`}
      scrollEventThrottle={16}
    >
      {favorites.map((verse, index) => (
        <TouchableOpacity
          key={`${verse.chapter}_${verse.verse}_${index}`}
          className={`mb-4 p-4 rounded-xl ${sectionBg}`}
          onPress={() =>
            router.push({
              pathname: "/home/chapters/[id]/[verse_id]",
              params: {
                id: String(verse.chapter),
                verse_id: String(verse.verse),
                verses_count: String(verse.verses_count),
              },
            })
          }
        >
          <Text className={`text-lg font-semibold ${textColor}`}>
            Chapter {verse.chapter}, Verse {verse.verse}
          </Text>

          <Text
            className={`text-sm mt-1 ${textColor}`}
            numberOfLines={3}
          >
            {verse.slok}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
