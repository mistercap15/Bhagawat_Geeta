import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/utils/translations";
import ThemedLayout from "@/components/ThemedLayout";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { initializeDailyReminder } from "@/utils/notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// Fix: shouldPlaySound must be true
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <BottomSheetModalProvider>
              <LayoutContent />
            </BottomSheetModalProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fix: use initializeDailyReminder instead of setupDailyReminder
    // This checks if already scheduled before creating a new one
    initializeDailyReminder(7, 30);
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
              title: t.tabHome,
              tabBarIcon: ({ color }) => <HomeIcon color={color} size={20} />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: t.tabExplore,
              tabBarIcon: ({ color }) => <SearchIcon color={color} size={20} />,
            }}
          />
        </Tabs>
      </ThemedLayout>
      <Toast />
    </>
  );
}