import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ThemedLayout from "@/components/ThemedLayout";

export default function HomeLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#1f2937" : "#fff7ed";
  const headerText = isDarkMode ? "#facc15" : "#92400e";
  const bgColor = isDarkMode ? "#000" : "#fff7ed";

  return (
    <ThemedLayout>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTitleStyle: { color: headerText },
          headerTintColor: headerText,
          animation: "ios_from_right",
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen name="chapters/index" options={{ title: "Chapters" }} />
        <Stack.Screen
          name="chapters/[id]/shlokas"
          options={{ title: "Shlokas" }}
        />
        <Stack.Screen
          name="chapters/[id]/[verse_id]"
          options={{ title: "Shloka Details" }}
        />
        <Stack.Screen
          name="favorite/index"
          options={{ title: "Favorites" }}
          />
      </Stack>
    </ThemedLayout>
  );
}
