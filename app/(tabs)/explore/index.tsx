import React from 'react';
import { ScrollView, Text, Switch, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext'; 
import { useThemeStyle } from '@/hooks/useThemeStyle';

const Explore = () => {
  const router = useRouter();
  const { toggleTheme } = useTheme(); 
  const { isDarkMode } = useTheme(); 
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-amber-50';
  const textColor = isDarkMode ? 'text-white' : 'text-amber-900';
  const sectionBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

  const options = [
    { label: 'Terms & Conditions', onPress: () => router.push('/(tabs)/explore/termsCondition') },
    { label: 'Privacy Policy', onPress: () => router.push('/(tabs)/explore/privacyPolicy') },
    { label: 'Rate the App', onPress: () => router.push('/(tabs)/explore/rateApp') },
    { label: 'Contact Support', onPress: () => router.push('/(tabs)/explore/contactSupport') },
    { label: 'About', onPress: () => router.push('/(tabs)/explore/about') },
  ];

  return (
    <ScrollView className={`flex-1 ${bgColor} px-6 py-8`}>
      <Text className={`text-3xl font-bold mb-6 ${textColor}`}>Explore</Text>

      <View className={`p-4 rounded-xl mb-6 ${sectionBg} flex-row justify-between items-center`}>
        <Text className={`text-lg font-medium ${textColor}`}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? '#fbbf24' : '#fcd34d'}
          trackColor={{ false: '#d1d5db', true: '#78350f' }}
        />
      </View>

      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`p-4 rounded-xl mb-4 ${sectionBg}`}
          onPress={item.onPress}
        >
          <Text className={`text-lg ${textColor}`}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Explore;
