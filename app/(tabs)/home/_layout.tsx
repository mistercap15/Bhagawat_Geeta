import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";

export default function HomeLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#2B2930" : "#FFFDF9";
  const headerText = isDarkMode ? "#FFB59D" : "#8A4D24";

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTitleStyle: { color: headerText, fontWeight: "700" },
        headerTintColor: headerText,
        animation: "ios_from_right",
        headerTitleAlign: "center",
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
      <Stack.Screen name="favorite/index" options={{ title: "Favorites" }} />
    </Stack>
  );
}
