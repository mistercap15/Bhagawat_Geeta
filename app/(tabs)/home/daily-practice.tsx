import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { sendPracticeCompleteNotification } from "@/utils/notifications";

const TARGET_KEY = "daily_target";
const LOG_KEY = "daily_read_log";
const DEFAULT_TARGET = 3;

const getTodayKey = () => new Date().toISOString().split("T")[0];

export default function DailyPracticeScreen() {
  const { isDarkMode } = useTheme();
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);

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
    [isDarkMode]
  );

  const calculateStreak = (log: any, currentTarget: number) => {
    const dates = Object.keys(log).sort().reverse();
    let currentStreak = 0;

    for (let date of dates) {
      if (log[date].length >= currentTarget) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const load = useCallback(async () => {
    const today = getTodayKey();

    const rawLog = await AsyncStorage.getItem(LOG_KEY);
    const rawTarget = await AsyncStorage.getItem(TARGET_KEY);

    const parsedLog = rawLog ? JSON.parse(rawLog) : {};
    const savedTarget = rawTarget ? Number(rawTarget) : DEFAULT_TARGET;

    setTarget(savedTarget);

    const todayReads = parsedLog[today] || [];
    const count = todayReads.length;

    setTodayCount(count);

    const streakValue = calculateStreak(parsedLog, savedTarget);
    setStreak(streakValue);

    // 🔔 Trigger completion notification once
    if (count >= savedTarget) {
      await sendPracticeCompleteNotification();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateTarget = async (value: number) => {
    setTarget(value);
    await AsyncStorage.setItem(TARGET_KEY, String(value));
  };

  const percent = Math.min(100, Math.round((todayCount / target) * 100));
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        🌅 Daily Reading Mission
      </Text>

      <Text style={{ color: palette.subText, marginBottom: 20 }}>
        Set your personal daily verse goal and build consistency.
      </Text>

      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: palette.subText }}>Current streak</Text>
        <Text
          style={{
            color: palette.accent,
            fontSize: 32,
            fontWeight: "800",
          }}
        >
          {streak} days 🔥
        </Text>
      </View>

      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: palette.text,
            fontWeight: "600",
            marginBottom: 12,
          }}
        >
          🎯 Set Daily Target
        </Text>

        <FlatList
          data={numbers}
          keyExtractor={(item) => item.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = item === target;
            return (
              <TouchableOpacity
                onPress={() => updateTarget(item)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 18,
                  borderRadius: 30,
                  marginRight: 12,
                  backgroundColor: active
                    ? palette.accent
                    : palette.background,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <Text
                  style={{
                    color: active ? "white" : palette.text,
                    fontWeight: active ? "700" : "500",
                    fontSize: active ? 18 : 16,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 16,
        }}
      >
        <Text style={{ color: palette.text, fontWeight: "600" }}>
          Today's Progress
        </Text>

        <Text style={{ color: palette.subText, marginTop: 4 }}>
          {todayCount}/{target} verses read ({percent}%)
        </Text>

        <View
          style={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "#E8D5C4",
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${percent}%`,
              height: 10,
              backgroundColor:
                todayCount >= target
                  ? palette.success
                  : palette.accent,
            }}
          />
        </View>

        {todayCount >= target && (
          <Text
            style={{
              color: palette.success,
              marginTop: 14,
              fontWeight: "600",
            }}
          >
            🎉 Daily mission complete! Well done.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
