import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";

const ContactSupport = () => {
  const { isDarkMode } = useTheme();
  const { setVisible } = useTabBarVisibility();
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";

  useEffect(() => {
    setVisible(true);
  }, [setVisible]);

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-6">
        <Text className={`text-base mb-4 text-center ${subTextColor}`}>
          For questions, suggestions, or bug reports, feel free to reach out.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:khilanpatel15@gmail.com")}
          className="bg-[#8A4D24] px-5 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Email Support</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ContactSupport;
