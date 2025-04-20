import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react-native";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";

const { height } = Dimensions.get("window");

const shlokas = [
  {
    chapter: 2,
    verse: 47,
    text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    translation:
      "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action...",
    explanation:
      "This verse teaches detachment from the results of actions while staying committed to your duties.",
  },
  {
    chapter: 3,
    verse: 16,
    text: "एवं प्रवर्तितं चक्रं नानुवर्तयतीह य: | अघायुरिन्द्रियारामो मोघं पार्थ स जीवति ||",
    translation:
      "Arjuna, the person who does not follow the wheel of creation set of going in this world, sinful and sensual, lives in vain.",
    explanation:
      "It emphasizes the importance of righteous living in harmony with divine order.",
  },
  {
    chapter: 4,
    verse: 7,
    text: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदाऽअत्मानं सृजाम्यहम्॥",
    translation:
      "Whenever there is a decline in righteousness and a rise in unrighteousness, O Arjuna, at that time I manifest Myself on earth.",
    explanation: "This reveals Lord Krishna’s promise to uphold dharma and protect the good.",
  },
];

export default function ShlokaDetailScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRead, setIsRead] = useState(false); // Track if shloka is marked as read
  const currentShloka = shlokas[currentIndex];

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < shlokas.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const markAsRead = () => {
    setIsRead(true); // Mark current shloka as read
  };

  return (
    <LinearGradient
      colors={["#fff7ed", "#fffbeb"]}
      className="flex-1 justify-center items-center px-4 py-10"
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        className="w-full bg-white rounded-2xl shadow-lg p-6"
        style={{ minHeight: height * 0.55 }}
      >
        <Text className="text-xl font-semibold text-amber-900 mb-4 text-center">
          Chapter {currentShloka.chapter}, Verse {currentShloka.verse}
        </Text>

        <View className="border-l-4 border-amber-500 pl-4 space-y-3">
          <Text className="text-2xl font-bold text-gray-900 leading-relaxed">
            {currentShloka.text}
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {currentShloka.translation}
          </Text>
          <Text className="text-sm text-gray-600 italic">
            {currentShloka.explanation}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity className="flex-row items-center mt-6">
          <Star size={22} color="#facc15" />
          <Text className="ml-2 text-lg font-medium text-amber-800">
            Add to Favorites
          </Text>
        </TouchableOpacity>

        {/* Mark as Read Button */}
        <TouchableOpacity
          onPress={markAsRead}
          className={`flex-row items-center mt-4 ${
            isRead ? "text-green-600" : "text-amber-800"
          }`}
        >
          <CheckCircle size={22} color={isRead ? "#4CAF50" : "#facc15"} />
          <Text className="ml-2 text-lg font-medium">
            {isRead ? "Marked as Read" : "Mark as Read"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Navigation Controls */}
      <View className="flex-row justify-between items-center w-full mt-8 px-6">
        <TouchableOpacity
          onPress={goToPrevious}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full bg-amber-100 justify-center items-center"
        >
          {currentIndex > 0 && <ChevronLeft color="#92400e" size={24} />}
        </TouchableOpacity>

        <Text className="text-base text-amber-900 font-semibold">
          {currentIndex + 1} / {shlokas.length}
        </Text>

        <TouchableOpacity
          onPress={goToNext}
          disabled={currentIndex === shlokas.length - 1}
          className="w-10 h-10 rounded-full bg-amber-100 justify-center items-center"
        >
          {currentIndex < shlokas.length - 1 && <ChevronRight color="#92400e" size={24} />}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
