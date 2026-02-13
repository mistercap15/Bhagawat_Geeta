import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { sendPracticeCompleteNotification } from "@/utils/notifications";

const PRACTICE_KEY = "daily-practice-progress";
const STREAK_KEY = "daily-practice-streak";

const getTodayKey = () => new Date().toISOString().split("T")[0];

type DailyProgress = {
  date: string;
  done: number;
  target: number;
};

export default function DailyPracticeScreen() {
  const { isDarkMode } = useTheme();
  const [progress, setProgress] = useState<DailyProgress>({
    date: getTodayKey(),
    done: 0,
    target: 3,
  });
  const [streak, setStreak] = useState(0);

  const palette = useMemo(
    () => ({
      background: isDarkMode ? "#1C1B1F" : "#FFF8F1",
      card: isDarkMode ? "#2B2930" : "#FFFDF9",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      subText: isDarkMode ? "#CAC4D0" : "#625B71",
      border: isDarkMode ? "#4A4458" : "#E8D5C4",
      accent: "#8A4D24",
      success: "#2E7D32",
    }),
    [isDarkMode],
  );

  const load = useCallback(async () => {
    const today = getTodayKey();
    const rawProgress = await AsyncStorage.getItem(PRACTICE_KEY);
    const rawStreak = await AsyncStorage.getItem(STREAK_KEY);

    if (rawStreak) {
      setStreak(Number(rawStreak));
    }

    if (!rawProgress) {
      setProgress({ date: today, done: 0, target: 3 });
      return;
    }

    const parsed = JSON.parse(rawProgress) as DailyProgress;
    if (parsed.date !== today) {
      const wasComplete = parsed.done >= parsed.target;
      const nextStreak = wasComplete ? Number(rawStreak || 0) + 1 : 0;
      setStreak(nextStreak);
      await AsyncStorage.setItem(STREAK_KEY, String(nextStreak));
      const reset = { date: today, done: 0, target: parsed.target || 3 };
      setProgress(reset);
      await AsyncStorage.setItem(PRACTICE_KEY, JSON.stringify(reset));
      return;
    }

    setProgress(parsed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const updateProgress = async (next: DailyProgress) => {
    setProgress(next);
    await AsyncStorage.setItem(PRACTICE_KEY, JSON.stringify(next));
    if (next.done === next.target) {
      await sendPracticeCompleteNotification();
    }
  };

  const percent = Math.min(100, Math.round((progress.done / progress.target) * 100));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.background }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      <Text style={{ color: palette.text, fontSize: 24, fontWeight: "700", marginBottom: 6 }}>Daily Practice</Text>
      <Text style={{ color: palette.subText, marginBottom: 16 }}>
        Build consistency by completing a small daily verse target.
      </Text>

      <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 16, marginBottom: 14 }}>
        <Text style={{ color: palette.subText }}>Current streak</Text>
        <Text style={{ color: palette.accent, fontSize: 32, fontWeight: "800" }}>{streak} days 🔥</Text>
      </View>

      <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.border, padding: 16 }}>
        <Text style={{ color: palette.text, fontWeight: "600" }}>Today's Goal</Text>
        <Text style={{ color: palette.subText, marginTop: 4 }}>
          {progress.done}/{progress.target} verses completed ({percent}%)
        </Text>

        <View style={{ height: 10, borderRadius: 999, backgroundColor: "#E8D5C4", marginTop: 12, overflow: "hidden" }}>
          <View style={{ width: `${percent}%`, height: 10, backgroundColor: palette.success }} />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => updateProgress({ ...progress, done: Math.max(0, progress.done - 1) })}
            style={{ flex: 1, borderColor: palette.accent, borderWidth: 1, borderRadius: 12, padding: 12 }}
          >
            <Text style={{ textAlign: "center", color: palette.accent, fontWeight: "600" }}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateProgress({ ...progress, done: Math.min(progress.target, progress.done + 1) })}
            style={{ flex: 1, backgroundColor: palette.accent, borderRadius: 12, padding: 12 }}
          >
            <Text style={{ textAlign: "center", color: "white", fontWeight: "700" }}>Mark Verse Done</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: palette.subText, marginTop: 16 }}>
          Tip: Open any chapter and read mindfully. Return here and tap "Mark Verse Done" after each completed verse.
        </Text>
      </View>
    </ScrollView>
  );
}
