import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { getSlok } from "@/utils/gitaData";
import MaterialLoader from "@/components/MaterialLoader";
import { LinearGradient } from "expo-linear-gradient";
import { Heart } from "lucide-react-native";
import chaptersData from "@/data/gita.json";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const secondaryText = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";
  const sectionBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";
  const borderColor = isDarkMode ? "#4A4458" : "#E8D5C4";

  const { chapters } = chaptersData as any;

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        setLoading(true);
        try {
          const keys = await AsyncStorage.getAllKeys();
          const favKeys = keys.filter((k) =>
            k.startsWith("favorite_verse_")
          );

          const favVerseInfos = favKeys.map((key) => {
            const [, , chapter, verse] = key.split("_");
            return [chapter, verse];
          });

          const results = await Promise.all(
            favVerseInfos.map(async ([chapter, verse]) => {
              const slok = await getSlok(chapter, verse);
              const chapterMeta = chapters.find(
                (c: any) =>
                  String(c.chapter_number) === String(chapter)
              );

              return {
                ...slok,
                verses_count: chapterMeta?.verses_count ?? 0,
              };
            })
          );

          setFavorites(results.filter(Boolean));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadFavorites();
    }, [])
  );

  /* ⏳ LOADING */
  if (loading) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1C1B1F", "#2B2930"]
            : ["#FFF8F1", "#FFEAD7"]
        }
        className="flex-1 justify-center items-center"
      >
        <MaterialLoader size="large" />
        <Text className={`mt-3 ${textColor}`}>
          Loading favorites...
        </Text>
      </LinearGradient>
    );
  }

  /* 📭 EMPTY STATE */
  if (favorites.length === 0) {
    return (
      <LinearGradient
        colors={
          isDarkMode
            ? ["#1C1B1F", "#2B2930"]
            : ["#FFF8F1", "#FFEAD7"]
        }
        className="flex-1 justify-center items-center px-6"
      >
        <Heart
          size={42}
          color={isDarkMode ? "#D0BCFF" : "#8A4D24"}
        />
        <Text className={`text-xl font-semibold mt-4 ${textColor}`}>
          No Favorites Yet
        </Text>
        <Text className={`text-center mt-2 ${secondaryText}`}>
          Tap the heart icon while reading to save verses here 🙏
        </Text>
      </LinearGradient>
    );
  }

  /* 📜 FAVORITES LIST */
  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ["#1C1B1F", "#2B2930"]
          : ["#FFF8F1", "#FFEAD7"]
      }
      className="flex-1"
    >
      <ScrollView
        className="px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 90 }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
      >
        <Text className={`text-3xl font-bold mb-6 ${textColor}`}>
          ❤️ Your Favorite Verses
        </Text>

        {favorites.map((verse, index) => (
          <TouchableOpacity
            key={`${verse.chapter}_${verse.verse}_${index}`}
            activeOpacity={0.85}
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
            className={`mb-5 rounded-3xl p-5 ${sectionBg}`}
            style={{
              borderWidth: 1,
              borderColor,
              elevation: 3,
            }}
          >
            {/* Accent Strip */}
            <View className="border-l-4 border-[#D97706] pl-4">
              <Text className={`text-base font-semibold ${textColor}`}>
                Chapter {verse.chapter}, Verse {verse.verse}
              </Text>

              <Text
                className={`text-[16px] mt-2 leading-6 ${secondaryText}`}
                numberOfLines={4}
              >
                {verse.slok}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
