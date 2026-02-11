import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";

export default function ExploreLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#2B2930" : "#FFFDF9";
  const headerText = isDarkMode ? "#FFB59D" : "#8A4D24";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: headerBg },
        headerTitleStyle: { color: headerText, fontWeight: "700" },
        headerTintColor: headerText,
        animation: "ios_from_right",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Explore" }} />
      <Stack.Screen
        name="termsCondition"
        options={{ title: "Terms & Conditions" }}
      />
      <Stack.Screen
        name="privacyPolicy"
        options={{ title: "Privacy Policy" }}
      />
      <Stack.Screen
        name="contactSupport"
        options={{ title: "Contact Support" }}
      />
      <Stack.Screen name="rateApp" options={{ title: "Rate App" }} />
      <Stack.Screen name="about" options={{ title: "About US" }} />
    </Stack>
  );
}
