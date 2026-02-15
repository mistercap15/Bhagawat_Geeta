import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_NOTIFICATION_SETUP_KEY = "daily-gita-notification:v3";
const DAILY_NOTIFICATION_ID_KEY = "daily-gita-notification:id";
const DAILY_COMPLETION_FLAG_KEY = "daily-practice-complete:";

// Set notification handler (call this in your App.tsx or index.tsx)
export function initializeNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setupDailyReminder(hour: number = 7, minute: number = 30) {
  console.log(`Setting up daily reminder for ${hour}:${minute}`);
  
  // Android channel
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
    console.log("Notification permissions not granted");
    return { scheduled: false };
  }

  // CRITICAL: Cancel ALL scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("Cancelled all existing notifications");

  // Clear stored IDs
  await AsyncStorage.multiRemove([
    DAILY_NOTIFICATION_SETUP_KEY,
    DAILY_NOTIFICATION_ID_KEY,
  ]);

  // Schedule daily repeating notification with parameters
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌅 Morning Gita Reflection",
      body: "Take 5 mindful minutes for one verse and its meaning.",
      sound: "default",
      ...(Platform.OS === "android" && {
        channelId: "daily-reminder",
      }),
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  console.log(`Scheduled notification with ID: ${notificationId} for ${hour}:${minute}`);

  await AsyncStorage.multiSet([
    [DAILY_NOTIFICATION_SETUP_KEY, "true"],
    [DAILY_NOTIFICATION_ID_KEY, notificationId],
  ]);

  // Verify notification was scheduled
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("All scheduled notifications after setup:", JSON.stringify(scheduled, null, 2));

  return { scheduled: true, notificationId };
}

export async function sendPracticeCompleteNotification() {
  const todayKey = new Date().toISOString().split("T")[0];
  const flagKey = DAILY_COMPLETION_FLAG_KEY + todayKey;

  const alreadySent = await AsyncStorage.getItem(flagKey);
  if (alreadySent === "true") return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🙏 Sadhana Complete",
      body: "You completed today's Gita practice. Beautiful consistency.",
      sound: "default",
      ...(Platform.OS === "android" && {
        channelId: "daily-reminder",
      }),
    },
    trigger: null,
  });

  await AsyncStorage.setItem(flagKey, "true");
}

// Helper function to test with current time + offset
export async function setupTestNotification(minutesFromNow: number = 1) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesFromNow);
  
  const testHour = now.getHours();
  const testMinute = now.getMinutes();

  console.log(`Setting up TEST notification for ${testHour}:${testMinute} (${minutesFromNow} minutes from now)`);

  // Cancel all first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧪 TEST - Morning Gita Reflection",
      body: `This should appear at ${testHour}:${testMinute}`,
      sound: "default",
      ...(Platform.OS === "android" && {
        channelId: "daily-reminder",
      }),
    },
    trigger: {
      hour: testHour,
      minute: testMinute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  console.log("Test notification scheduled:", {
    hour: testHour,
    minute: testMinute,
    id: notificationId,
  });

  // Verify
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Scheduled notifications:", JSON.stringify(scheduled, null, 2));

  return notificationId;
}

// Helper to check what notifications are scheduled
export async function checkScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log("Currently scheduled notifications:", 
    scheduled.map(n => ({
      id: n.identifier,
      trigger: n.trigger,
      title: n.content.title,
    }))
  );
  return scheduled;
}

// Helper to cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.multiRemove([
    DAILY_NOTIFICATION_SETUP_KEY,
    DAILY_NOTIFICATION_ID_KEY,
  ]);
  console.log("All notifications cancelled and storage cleared");
}