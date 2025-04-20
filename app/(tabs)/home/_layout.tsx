import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#fff7ed" },
        headerTitleStyle: { color: "#92400e" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen name="chapters" options={{ title: "Chapters" }} />
      <Stack.Screen name="shlokas" options={{ title: "Shlokas" }} />
      <Stack.Screen name="shlokaDetails" options={{ title: "Shloka Details" }} />
    </Stack>
  );
}
