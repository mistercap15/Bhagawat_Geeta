// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { HomeIcon, SearchIcon } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  const theme = useColorScheme();
  const isLight = theme === 'light';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isLight ? '#fff7ed' : '#000' }}>
      <StatusBar
        style={isLight ? 'light' : 'dark'}
        backgroundColor="#fff7ed"
        translucent={false}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            paddingTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => <SearchIcon color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
