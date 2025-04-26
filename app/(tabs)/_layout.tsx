import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();
  const statusBarStyle = isDarkMode ? "light" : "dark";
  const statusBarBackground = isDarkMode ? "#000" : "#fff7ed";
  const tabBarStyle = {
    backgroundColor: isDarkMode ? "#333" : "#fff",
    height: 60,
    paddingBottom: 10,
    paddingTop: 5,
  };

  return (
    <ThemedLayout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <HomeIcon color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <SearchIcon color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </ThemedLayout>
  );
}
