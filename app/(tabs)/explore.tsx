import React, { useState } from 'react';
import { View, Text, Switch, useColorScheme } from 'react-native';

const Explore = () => {
  const systemTheme = useColorScheme(); // 'light' or 'dark'
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  const toggleSwitch = () => setIsDarkMode((prev) => !prev);

  return (
    <View
      className={`flex-1 justify-center items-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-amber-50'
      }`}
    >
      <Text
        className={`text-2xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-amber-900'
        }`}
      >
        Explore
      </Text>

      <View className="flex-row items-center space-x-3">
        <Text className={isDarkMode ? 'text-white' : 'text-amber-900'}>
          Light
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleSwitch}
          thumbColor={isDarkMode ? '#fbbf24' : '#fcd34d'}
          trackColor={{ false: '#d1d5db', true: '#78350f' }}
        />
        <Text className={isDarkMode ? 'text-white' : 'text-amber-900'}>
          Dark
        </Text>
      </View>
    </View>
  );
};

export default Explore;
