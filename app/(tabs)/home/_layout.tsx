import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";

export default function HomeLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#1f2937" : "#fff7ed"; // dark: gray-800, light: amber-50
  const headerText = isDarkMode ? "#facc15" : "#92400e"; // dark: amber-400, light: amber-900

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTitleStyle: { color: headerText },
        headerTintColor: headerText,
        presentation: "transparentModal"
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen name="chapters/index" options={{ title: "Chapters" }} />
      <Stack.Screen name="chapters/[id]/shlokas" options={{ title: "Shlokas" }} />
      <Stack.Screen
        name="chapters/[id]/[verse_id]"
        options={{ title: "Shloka Details" }}
      />
    </Stack>
  );
}
