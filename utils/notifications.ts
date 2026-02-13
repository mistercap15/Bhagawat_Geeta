import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_NOTIFICATION_SETUP_KEY = "daily-gita-notification:v2";
const DAILY_NOTIFICATION_ID_KEY = "daily-gita-notification:id";

export async function setupDailyReminder() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminder", {
      name: "Daily Gita Reminder",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8A4D24",
      sound: "default",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    return { scheduled: false, reason: "permission_denied" as const };
  }

  const isAlreadySetup = await AsyncStorage.getItem(DAILY_NOTIFICATION_SETUP_KEY);
  if (isAlreadySetup === "true") {
    return { scheduled: true, reason: "already_configured" as const };
  }

  const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => null);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Morning Gita Reflection",
      body: "Take 5 mindful minutes for one verse and its meaning.",
      sound: Platform.OS === "android" ? "default" : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 30,
      channelId: Platform.OS === "android" ? "daily-reminder" : undefined,
    },
  });

  await AsyncStorage.multiSet([
    [DAILY_NOTIFICATION_SETUP_KEY, "true"],
    [DAILY_NOTIFICATION_ID_KEY, notificationId],
  ]);

  return { scheduled: true, reason: "configured" as const };
}

export async function sendPracticeCompleteNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Great job! 🙏",
      body: "You completed today's Gita practice. See you tomorrow.",
      sound: Platform.OS === "android" ? "default" : undefined,
    },
    trigger: null,
  });
}
