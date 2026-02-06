import { Tabs } from "expo-router";
import { HomeIcon, SearchIcon } from "lucide-react-native";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Toast from "react-native-toast-message";
import { TabBarVisibilityProvider, useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    <ThemeProvider>
      <TabBarVisibilityProvider>
        <LayoutContent />
      </TabBarVisibilityProvider>
    </ThemeProvider>
  );
}

function LayoutContent() {
  const { isDarkMode } = useTheme();
  const { visible } = useTabBarVisibility();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 90,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  useEffect(() => {
    const scheduleDailyNotification = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const existing = await AsyncStorage.getItem(DAILY_NOTIFICATION_KEY);
      if (existing === "true") return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Morning Gita Reflection",
          body: "Begin your day with a verse of wisdom. Open the Gita and find your शांत क्षण today.",
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
              transform: [{ translateY }],
              opacity: translateY.interpolate({
                inputRange: [0, 90],
                outputRange: [1, 0],
              }),
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
