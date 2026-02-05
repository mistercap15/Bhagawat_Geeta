import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useThemeStyle } from '@/hooks/useThemeStyle';
import { useTheme } from '@/context/ThemeContext';

const RateApp = () => {
  const { isDarkMode } = useTheme(); 
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <View className={`flex-1 ${bgColor} justify-center items-center px-6`}>
      <Text className={`text-xl font-semibold mb-4 ${textColor}`}>Enjoying the app?</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=your.app.id')}
        className="bg-yellow-500 px-4 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Rate on Play Store</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RateApp;
