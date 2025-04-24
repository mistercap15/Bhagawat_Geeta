import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useThemeStyle } from '@/hooks/useThemeStyle'; // Import the custom hook
import { useTheme } from '@/context/ThemeContext';

const TermsAndConditions = () => {
  const { isDarkMode } = useTheme(); 
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <ScrollView className={`flex-1 ${bgColor} px-6 py-8`}>
      <Text className={`text-2xl font-bold mb-4 ${textColor}`}>Terms & Conditions</Text>
      <Text className={`text-base leading-relaxed ${textColor}`}>
        This Bhagavad Gita app is provided as an educational and spiritual resource. All content is sourced from public domain translations and presented with the intention of promoting inner peace and understanding of Hindu philosophy.
        {'\n\n'}
        Users are expected to use this app respectfully. No part of this app may be used for commercial purposes without permission. This app is ad-free and does not collect personal data.
        {'\n\n'}
        By using this app, you agree to engage with the content in a peaceful, respectful manner.
      </Text>
    </ScrollView>
  );
};

export default TermsAndConditions;
