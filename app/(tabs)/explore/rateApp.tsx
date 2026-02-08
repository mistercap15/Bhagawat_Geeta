import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const RateApp = () => {
  const { isDarkMode } = useTheme();
  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-6">
        <Text className={`text-xl font-semibold mb-2 ${textColor}`}>
          Enjoying the app?
        </Text>
        <Text className={`text-sm mb-4 text-center ${subTextColor}`}>
          Your rating helps more seekers discover the Gita.
        </Text>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://play.google.com/store/apps/details?id=your.app.id")
          }
          className="bg-[#8A4D24] px-5 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Rate on Play Store</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default RateApp;
