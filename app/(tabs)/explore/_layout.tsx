import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function ExploreLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? "#2B2930" : "#FFFDF9";
  const headerText = isDarkMode ? "#FFB59D" : "#8A4D24";
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
          contentStyle: { backgroundColor: themeBg },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Explore", headerShown: false }}
        />
        <Stack.Screen name="termsCondition" options={{ title: "Terms & Conditions" , headerShown: false }} />
        <Stack.Screen name="privacyPolicy" options={{ title: "Privacy Policy", headerShown: false }} />
        <Stack.Screen name="contactSupport" options={{ title: "Contact Support", headerShown: false }} />
        <Stack.Screen name="rateApp" options={{ title: "Rate App" , headerShown: false}} />
        <Stack.Screen name="about" options={{ title: "About Us", headerShown: false }} />
      </Stack>
    </View>
  );
}
