import React from "react";
import { Text, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useScrollTabBar } from "@/hooks/useScrollTabBar";

const PrivacyPolicy = () => {
  const { isDarkMode } = useTheme();
  const handleScroll = useScrollTabBar();
  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 px-6 py-8"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text className={`text-2xl font-bold mb-4 ${textColor}`}>Privacy Policy</Text>
        <Text className={`text-base leading-relaxed ${subTextColor}`}>
          This Bhagavad Gita app does not collect, store, or share any personal
          user data. We believe in a distraction-free, respectful spiritual
          experience. No ads, no tracking, no intrusive permissions.
          {"\n\n"}
          Your usage of this app is entirely private. We do not collect analytics
          or log your data. All features work fully offline (except external
          links, if any).
          {"\n\n"}
          Your privacy is sacred — just like the message of the Gita.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default PrivacyPolicy;
