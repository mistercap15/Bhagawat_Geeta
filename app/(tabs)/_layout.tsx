import { Tabs } from "expo-router";
import {
  HomeIcon,
  BookOpen,
  Compass,
  Target,
  User,
} from "lucide-react-native";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";

// The active tab's icon sits in a soft "lit" gradient pill; inactive icons are
// plain. This gives the bar a premium, tactile selected state.
function TabIcon({
  Icon,
  color,
  focused,
  isDarkMode,
}: {
  Icon: typeof HomeIcon;
  color: string;
  focused: boolean;
  isDarkMode: boolean;
}) {
  if (focused) {
    return (
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isDarkMode ? "rgba(255,181,157,0.15)" : "#F7DAC6",
            borderWidth: 1,
            borderColor: isDarkMode
              ? "rgba(255,181,157,0.26)"
              : "rgba(138,77,36,0.16)",
          },
        ]}
      >
        <Icon color={color} size={22} strokeWidth={2.5} />
      </View>
    );
  }
  return (
    <View style={styles.pill}>
      <Icon color={color} size={21} strokeWidth={2} />
    </View>
  );
}

export default function TabsLayout() {
  const { isDarkMode } = useTheme();
  const t = useTranslation();

  const barGradient = isDarkMode
    ? (["#102A44", "#091A2B"] as const)
    : (["#FFFCF5", "#FFEED6"] as const);
  const barBorder = isDarkMode
    ? "rgba(255,255,255,0.07)"
    : "rgba(138,77,36,0.10)";

  const icon = (Icon: typeof HomeIcon) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <TabIcon Icon={Icon} color={color} focused={focused} isDarkMode={isDarkMode} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: isDarkMode ? "#FFC4AE" : "#8A4D24",
        tabBarInactiveTintColor: isDarkMode ? "#6F869C" : "#A99C8E",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 9,
          paddingBottom: 8,
        },
        // Gradient surface for depth, with a hairline border for crispness.
        tabBarBackground: () => (
          <LinearGradient
            colors={barGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.barBg, { borderColor: barBorder }]}
          />
        ),
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 14,
          marginBottom: 12,
          height: 70,
          borderRadius: 26,
          borderTopWidth: 0,
          // Solid fallback so Android elevation has a surface to cast from;
          // the gradient background sits on top of it.
          backgroundColor: isDarkMode ? "#0B1E32" : "#FFF3DC",
          elevation: 12,
          shadowColor: isDarkMode ? "#000" : "#8A4D24",
          shadowOpacity: isDarkMode ? 0.4 : 0.22,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t.tabHome, tabBarIcon: icon(HomeIcon) }}
      />
      <Tabs.Screen
        name="read"
        options={{ title: t.tabRead, tabBarIcon: icon(BookOpen) }}
      />
      <Tabs.Screen
        name="guidance"
        options={{ title: t.tabGuidance, tabBarIcon: icon(Compass) }}
      />
      <Tabs.Screen
        name="practice"
        options={{ title: t.tabPractice, tabBarIcon: icon(Target) }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: t.tabYou, tabBarIcon: icon(User) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  barBg: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
  },
});
