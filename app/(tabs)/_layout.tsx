import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <ThemedLayout>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: isDarkMode ? "#FFB59D" : "#8A4D24",
            tabBarInactiveTintColor: isDarkMode ? "#B8B2C1" : "#8A7D74",
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 3,
            },
            tabBarStyle: {
              position: "absolute",
              marginHorizontal: 16,
              marginBottom: 14,
              borderRadius: 28,
              height: 68,
              paddingBottom: 8,
              paddingTop: 8,
              backgroundColor: isDarkMode ? "#2B2930" : "#FFFDF9",
              borderTopWidth: 0,
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
            },
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
      <Toast />
    </>
  );
}
