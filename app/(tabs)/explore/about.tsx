import React from "react";
import { Text, Linking, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const About = () => {
  const { isDarkMode } = useTheme();
  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        className="flex-1 px-6 py-8"
        scrollEventThrottle={16}
      >
        <Text className={`text-2xl font-bold mb-4 ${textColor}`}>About</Text>
        <Text className={`text-base leading-relaxed mb-6 ${subTextColor}`}>
          I'm Khilan Patel — a full stack developer passionate about building
          spiritual, minimal, and modern apps. I work with React, Next.js,
          Nuxt.js, Vue.js, Express, Node.js, Expo, and React Native.
          {"\n\n"}I built this Bhagavad Gita app to help bring the eternal
          wisdom of the Gita to more people — completely free and ad-free, for a
          peaceful experience.
        </Text>

        <TouchableOpacity
          className="rounded-2xl px-4 py-3 bg-[#8A4D24]"
          onPress={() =>
            Linking.openURL("https://www.buymeacoffee.com/khilanpatel")
          }
        >
          <Text className="text-center text-white font-semibold text-lg">
            ☕ Buy Me a Coffee
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default About;
