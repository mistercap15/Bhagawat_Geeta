import "../global.css";
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AchievementProvider } from "@/context/AchievementContext";
import ThemedLayout from "@/components/ThemedLayout";
import AchievementUnlockedModal from "@/components/AchievementUnlockedModal";
import Toast from "react-native-toast-message";
import { initializeDailyReminder } from "@/utils/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AchievementProvider>
              <RootNav />
            </AchievementProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Root stack: the tab navigator plus screens that should sit OVER the tabs
// (e.g. the verse reader), so back always returns to wherever you opened them
// from — regardless of which tab you were on.
function RootNav() {
  const { isDarkMode } = useTheme();
  const themeBg = isDarkMode ? "#040C18" : "#FFF3DC";

  useEffect(() => {
    initializeDailyReminder(7, 30);
  }, []);

  return (
    <ThemedLayout>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "ios_from_right",
          contentStyle: { backgroundColor: themeBg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="verse/[id]/[verse_id]" />
      </Stack>
      <AchievementUnlockedModal />
      <Toast />
    </ThemedLayout>
  );
}
