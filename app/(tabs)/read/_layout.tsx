import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function ReadLayout() {
  const { isDarkMode } = useTheme();
  // Must match the app's theme background so the back-swipe animation on
  // Android doesn't expose a white flash behind the stack.
  const themeBg = isDarkMode ? "#040C18" : "#FFF3DC";

  return (
    <View style={{ flex: 1, backgroundColor: themeBg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "ios_from_right",
          contentStyle: { backgroundColor: themeBg },
        }}
      />
    </View>
  );
}
