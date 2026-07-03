import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function HomeLayout() {
  const { isDarkMode } = useTheme();
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
