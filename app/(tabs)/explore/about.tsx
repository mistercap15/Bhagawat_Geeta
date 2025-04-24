import React from 'react';
import { View, Text, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStyle } from '@/hooks/useThemeStyle'; // Importing the custom hook
import { useTheme } from '@/context/ThemeContext';

const About = () => {
   const { isDarkMode } = useTheme();
   const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
   const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
   const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <ScrollView className={`flex-1 ${bgColor} px-6 py-8`}>
      <Text className={`text-2xl font-bold mb-4 ${textColor}`}>About</Text>
      <Text className={`text-base leading-relaxed mb-6 ${textColor}`}>
        I'm Khilan Patel — a full stack developer passionate about building spiritual, minimal, and modern apps. I work with React, Next.js, Nuxt.js, Vue.js, Express, Node.js, Expo, and React Native.
        {'\n\n'}
        I built this Bhagavad Gita app to help bring the eternal wisdom of the Gita to more people — completely free and ad-free, for a peaceful experience.
      </Text>

      <TouchableOpacity
        className={`rounded-xl px-4 py-3 bg-yellow-500`} // Hardcoding buttonBg as it's a specific color, adjust accordingly
        onPress={() => Linking.openURL('https://www.buymeacoffee.com/khilanpatel')}
      >
        <Text className="text-center text-white font-semibold text-lg">☕ Buy Me a Coffee</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default About;
