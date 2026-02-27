import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function HomeLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#2B2930" : "#FFFDF9";
  const headerText = isDarkMode ? "#FFB59D" : "#8A4D24";
  // Must match the app's theme background exactly.
  // Android briefly exposes this wrapper during the back-swipe animation —
  // keeping it themed prevents the white flash.
  const themeBg = isDarkMode ? "#1C1B1F" : "#FFF8F1";

  return (
    <View style={{ flex: 1, backgroundColor: themeBg }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTitleStyle: { color: headerText, fontWeight: "700" },
          headerTintColor: headerText,
          animation: "ios_from_right",
          headerTitleAlign: "center",
          // Second line of defence: each screen's own container background
          contentStyle: { backgroundColor: themeBg },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen
          name="chapters/index"
          options={{ title: "Chapters", headerShown: false }}
        />
        <Stack.Screen
          name="chapters/[id]/shlokas"
          options={{ title: "Shlokas", headerShown: false }}
        />
        <Stack.Screen
          name="chapters/[id]/[verse_id]"
          options={{ title: "Shloka Details", headerShown: false }}
        />
        <Stack.Screen
          name="favorite/index"
          options={{ title: "Favorites", headerShown: false }}
        />
        <Stack.Screen
          name="continue-reading"
          options={{ title: "Continue Reading", headerShown: false }}
        />
        <Stack.Screen
          name="daily-practice"
          options={{ title: "Daily Practice", headerShown: false }}
        />
        <Stack.Screen
          name="audio-recitation"
          options={{ title: "Audio Recitation", headerShown: false }}
        />
        <Stack.Screen
          name="achievements"
          options={{ title: "My Journey", headerShown: false }}
        />
      </Stack>
    </View>
  );
}
