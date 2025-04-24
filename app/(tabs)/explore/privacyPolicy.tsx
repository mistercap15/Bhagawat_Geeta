import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useThemeStyle } from '@/hooks/useThemeStyle';
import { useTheme } from '@/context/ThemeContext';

const PrivacyPolicy = () => {
  const { isDarkMode } = useTheme(); 
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <ScrollView className={`flex-1 ${bgColor} px-6 py-8`}>
      <Text className={`text-2xl font-bold mb-4 ${textColor}`}>Privacy Policy</Text>
      <Text className={`text-base leading-relaxed ${textColor}`}>
        This Bhagavad Gita app does not collect, store, or share any personal user data. We believe in a distraction-free, respectful spiritual experience. No ads, no tracking, no intrusive permissions.
        {'\n\n'}
        Your usage of this app is entirely private. We do not collect analytics or log your data. All features work fully offline (except external links, if any).
        {'\n\n'}
        Your privacy is sacred — just like the message of the Gita.
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicy;
