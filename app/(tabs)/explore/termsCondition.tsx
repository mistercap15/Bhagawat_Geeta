import React from "react";
import { Text, ScrollView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useScrollTabBar } from "@/hooks/useScrollTabBar";

const TermsAndConditions = () => {
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
        <Text className={`text-2xl font-bold mb-4 ${textColor}`}>
          Terms & Conditions
        </Text>
        <Text className={`text-base leading-relaxed ${subTextColor}`}>
          This Bhagavad Gita app is provided as an educational and spiritual
          resource. All content is sourced from public domain translations and
          presented with the intention of promoting inner peace and
          understanding of Hindu philosophy.
          {"\n\n"}
          Users are expected to use this app respectfully. No part of this app
          may be used for commercial purposes without permission. This app is
          ad-free and does not collect personal data.
          {"\n\n"}
          By using this app, you agree to engage with the content in a peaceful,
          respectful manner.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default TermsAndConditions;
