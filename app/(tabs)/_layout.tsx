import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { setupDailyReminder } from "@/utils/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LayoutContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setupDailyReminder();
  }, []);

  return (
    <>
      <ThemedLayout>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,

            tabBarActiveTintColor: isDarkMode ? "#FFB59D" : "#8A4D24",
            tabBarInactiveTintColor: isDarkMode ? "#B8B2C1" : "#9A8F86",

            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
              marginTop: -2,
            },

            tabBarItemStyle: {
              paddingVertical: 6,
            },

            tabBarStyle: {
              position: "absolute",
              marginHorizontal: 16,
              marginBottom: insets.bottom > 0 ? insets.bottom : 10,
              height: 62 + insets.bottom,
              paddingBottom: insets.bottom,

              borderRadius: 32,

              backgroundColor: isDarkMode
                ? "rgba(43, 41, 48, 0.95)"
                : "rgba(255, 253, 249, 0.95)",

              borderTopWidth: 0,

              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 14,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => <HomeIcon color={color} size={20} />,
            }}
          />

          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color }) => <SearchIcon color={color} size={20} />,
            }}
          />
        </Tabs>
      </ThemedLayout>

      <Toast />
    </>
  );
}
