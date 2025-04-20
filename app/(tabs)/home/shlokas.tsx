import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Headphones, Star } from "lucide-react-native"; // Only using Star icon
import Animated, { FadeInUp } from "react-native-reanimated";
import { useState } from "react";
import { useRouter } from "expo-router";

const shlokas = [
  {
    chapter: 2,
    verse: 47,
    text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action...",
  },
  {
    chapter: 3,
    verse: 16,
    text: "एवं प्रवर्तितं चक्रं नानुवर्तयतीह य: | अघायुरिन्द्रियारामो मोघं पार्थ स जीवति ||",
    translation:
      "Arjuna, the person who does not follow the wheel of creation set of going in this world, sinful and sensual, lives in vain.",
  },
  // Add more shlokas as needed
];

export default function ShlokasScreen() {
  const [favorites, setFavorites] = useState<boolean[]>(
    new Array(shlokas.length).fill(false)
  ); // Track favorite state
   const router = useRouter();
  // Toggle the favorite status for a specific shloka
  const toggleFavorite = (index: number) => {
    const updatedFavorites = [...favorites];
    updatedFavorites[index] = !updatedFavorites[index];
    setFavorites(updatedFavorites);
  };

  return (
    <LinearGradient colors={["#fff7ed", "#fffbeb"]} className="flex-1">
      <ScrollView className="px-6 py-2">
        <Text className="text-3xl font-bold text-amber-900 mb-6 text-center">
          Bhagavad Gita Shlokas
        </Text>
      
        {shlokas.map((shloka, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.duration(1000).delay(200 * index)}
            className="bg-white rounded-2xl shadow-md p-6 mb-6"
          >
          <TouchableOpacity
          key={index}
          className="bg-white rounded-2xl p-4 mb-4 shadow"
          onPress={() => router.push("/(tabs)/home/shlokaDetails")}
        >
            <Text className="text-xl font-semibold text-amber-900 mb-3">
              Chapter {shloka.chapter}, Verse {shloka.verse}
            </Text>
            <View className="border-l-4 border-amber-500 pl-4 mb-4">
              <Text className="text-2xl font-bold text-gray-900 leading-relaxed mb-3">
                {shloka.text}
              </Text>
              <Text className="text-base text-gray-700 leading-relaxed">
                {shloka.translation}
              </Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 rounded-2xl bg-amber-100 mt-4"
              onPress={() =>
                console.log(`Play Audio for Verse ${shloka.verse}`)
              }
            >
              <Headphones size={24} color="#92400e" />
              <Text className="text-lg font-semibold text-amber-900">
                Play Audio
              </Text>
            </TouchableOpacity>

            {/* Favorite Star Button */}
            <TouchableOpacity
              className="flex-row items-center justify-start mt-4"
              onPress={() => toggleFavorite(index)}
            >
              <Star
                size={24}
                color={favorites[index] ? "#f59e0b" : "#d1d5db"} // Change color based on favorite status
              />
              <Text className="ml-2 text-lg font-semibold text-amber-900">
                {favorites[index] ? "Added to Favorites" : "Add to Favorites"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
