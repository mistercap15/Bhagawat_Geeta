import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const DAILY_NOTIFICATION_KEY = "daily-gita-notification";

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
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const scheduleDailyNotification = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const existing = await AsyncStorage.getItem(DAILY_NOTIFICATION_KEY);
      if (existing === "true") return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Morning Gita Reflection",
          body:
            "Begin your day with a verse of wisdom. Open the Gita and find your शांत क्षण today.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 7,
          minute: 30,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(DAILY_NOTIFICATION_KEY, "true");
    };

    scheduleDailyNotification();
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
              marginBottom: 10,
              height: 62,
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
              tabBarIcon: ({ color }) => (
                <HomeIcon color={color} size={20} />
              ),
            }}
          />

          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color }) => (
                <SearchIcon color={color} size={20} />
              ),
            }}
          />
        </Tabs>
      </ThemedLayout>

      <Toast />
    </>
  );
}
