import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { getSlok } from "@/utils/gitaData";
import MaterialLoader from "@/components/MaterialLoader";
import { LinearGradient } from "expo-linear-gradient";

// LOCAL JSON
import chaptersData from "@/data/gita.json";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const sectionBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";

  const { chapters } = chaptersData as any;

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const favKeys = keys.filter((k) => k.startsWith("favorite_verse_"));

        const favVerseInfos = favKeys.map((key) => {
          const [, , chapter, verse] = key.split("_");
          return [chapter, verse];
        });

        const results = await Promise.all(
          favVerseInfos.map(async ([chapter, verse]) => {
            const slok = await getSlok(chapter, verse);
            const chapterMeta = chapters.find(
              (c: any) => String(c.chapter_number) === String(chapter),
            );

            return {
              ...slok,
              verses_count: chapterMeta?.verses_count ?? 0,
            };
          }),
        );

        setFavorites(results.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  /* ⏳ LOADING */
  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        className="flex-1 justify-center items-center"
      >
        <MaterialLoader size="large" />
        <Text className={`mt-2 ${textColor}`}>Loading favorites...</Text>
      </LinearGradient>
    );
  }

  /* 📭 EMPTY */
  if (favorites.length === 0) {
    return (
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        className="flex-1 justify-center items-center"
      >
        <Text className={`text-lg ${textColor}`}>No favorites yet!</Text>
      </LinearGradient>
    );
  }

  /* 📜 LIST */
  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        className="p-4"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        scrollEventThrottle={16}
      >
        {favorites.map((verse, index) => (
          <TouchableOpacity
            key={`${verse.chapter}_${verse.verse}_${index}`}
            className={`mb-4 p-4 rounded-2xl ${sectionBg} border border-[#E8D5C4]`}
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

            <Text className={`text-sm mt-1 ${textColor}`} numberOfLines={3}>
              {verse.slok}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
