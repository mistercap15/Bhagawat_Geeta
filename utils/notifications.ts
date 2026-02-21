import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_NOTIFICATION_SETUP_KEY = "daily-gita-notification:v3";
const DAILY_NOTIFICATION_ID_KEY = "daily-gita-notification:id";
const DAILY_COMPLETION_FLAG_KEY = "daily-practice-complete:";

// ─── Safe init: only schedules if not already set up ────────────────────────
export async function initializeDailyReminder(
  hour: number = 7,
  minute: number = 30
) {
  const alreadySetup = await isDailyReminderSetup();

  if (alreadySetup) {
    console.log("Daily reminder already exists, skipping setup");
    return { scheduled: true, alreadyExists: true };
  }

  console.log("No reminder found, scheduling for the first time");
  return await setupDailyReminder(hour, minute);
}

// ─── Check if a valid scheduled notification already exists ──────────────────
async function isDailyReminderSetup(): Promise<boolean> {
  const [isSetup, notificationId] = await Promise.all([
    AsyncStorage.getItem(DAILY_NOTIFICATION_SETUP_KEY),
    AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY),
  ]);

  if (isSetup !== "true" || !notificationId) return false;

  // Verify the notification still exists in the OS scheduler
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const stillExists = scheduled.some((n) => n.identifier === notificationId);

  if (!stillExists) {
    // Stored ID is stale, clear it so we reschedule next time
    await AsyncStorage.multiRemove([
      DAILY_NOTIFICATION_SETUP_KEY,
      DAILY_NOTIFICATION_ID_KEY,
    ]);
    console.log("Stale notification ID cleared");
    return false;
  }

  return true;
}

// ─── Force schedule (use when user changes time in settings) ─────────────────
export async function setupDailyReminder(
  hour: number = 7,
  minute: number = 30
) {
  console.log(`Scheduling daily reminder for ${hour}:${minute}`);

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

  // Cancel any existing notification before creating new one
  const existingId = await AsyncStorage.getItem(DAILY_NOTIFICATION_ID_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(
      () => null
    );
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌅 Morning Gita Reflection",
      body: "Take 5 mindful minutes for one verse and its meaning.",
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "daily-reminder" }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.multiSet([
    [DAILY_NOTIFICATION_SETUP_KEY, "true"],
    [DAILY_NOTIFICATION_ID_KEY, notificationId],
  ]);

  console.log(`Reminder scheduled: ID ${notificationId} at ${hour}:${minute}`);
  return { scheduled: true, notificationId, alreadyExists: false };
}

// ─── Reset (e.g. user changes time in settings) ──────────────────────────────
export async function resetDailyReminder(
  hour: number = 7,
  minute: number = 30
) {
  await cancelAllNotifications();
  return await setupDailyReminder(hour, minute);
}

// ─── Practice complete notification (fires immediately, once per day) ─────────
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
      ...(Platform.OS === "android" && { channelId: "daily-reminder" }),
    },
    trigger: null,
  });

  await AsyncStorage.setItem(flagKey, "true");
}

// ─── Debug helpers ────────────────────────────────────────────────────────────
export async function checkScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log(
    "Scheduled notifications:",
    scheduled.map((n) => ({
      id: n.identifier,
      trigger: n.trigger,
      title: n.content.title,
    }))
  );
  return scheduled;
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.multiRemove([
    DAILY_NOTIFICATION_SETUP_KEY,
    DAILY_NOTIFICATION_ID_KEY,
  ]);
  console.log("All notifications cancelled");
}

// ─── Test helper: fires X minutes from now ────────────────────────────────────
export async function setupTestNotification(minutesFromNow: number = 1) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesFromNow);

  const testHour = now.getHours();
  const testMinute = now.getMinutes();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧪 TEST - Gita Reminder",
      body: `Should appear in ~${minutesFromNow} minute(s)`,
      sound: "default",
      ...(Platform.OS === "android" && { channelId: "daily-reminder" }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutesFromNow * 60,
      repeats: false,
    },
  });

  console.log(`Test notification set for ${testHour}:${testMinute}`, notificationId);
  return notificationId;
}