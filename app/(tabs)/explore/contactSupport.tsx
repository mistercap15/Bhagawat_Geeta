import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useThemeStyle } from '@/hooks/useThemeStyle';
import { useTheme } from '@/context/ThemeContext';

const ContactSupport = () => {
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <View className={`flex-1 ${bgColor} justify-center items-center px-6`}>
      <Text className={`text-base mb-4 ${textColor}`}>
        For questions, suggestions, or bug reports, feel free to reach out.
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openURL('mailto:khilanpatel15@gmail.com')}
        className="bg-yellow-500 px-4 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Email Support</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactSupport;
