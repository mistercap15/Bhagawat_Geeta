import { Tabs } from "expo-router";
import {
  HomeIcon,
  BookOpen,
  Compass,
  Target,
  User,
} from "lucide-react-native";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";

// Icon wrapped in a soft rounded "pill" that highlights the active tab.
function TabIcon({
  Icon,
  color,
  focused,
  activeBg,
}: {
  Icon: typeof HomeIcon;
  color: string;
  focused: boolean;
  activeBg: string;
}) {
  return (
    <View
      style={{
        width: 52,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? activeBg : "transparent",
      }}
    >
      <Icon color={color} size={21} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const activeBg = isDarkMode ? "rgba(255, 181, 157, 0.18)" : "#F6DAC6";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: isDarkMode ? "#FFB59D" : "#8A4D24",
        tabBarInactiveTintColor: isDarkMode ? "#4A7BA0" : "#9A8F86",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 7,
        },
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 12,
          // ThemedLayout (root) owns the bottom safe-area inset, so the floating
          // pill keeps a fixed height and just clears it by a constant margin.
          marginBottom: 10,
          height: 68,
          borderRadius: 34,
          backgroundColor: isDarkMode
            ? "rgba(8, 28, 48, 0.97)"
            : "rgba(255, 243, 220, 0.97)",
          borderTopWidth: 0,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 14,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={HomeIcon} color={color} focused={focused} activeBg={activeBg} />
          ),
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: t.tabRead,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={BookOpen} color={color} focused={focused} activeBg={activeBg} />
          ),
        }}
      />
      <Tabs.Screen
        name="guidance"
        options={{
          title: t.tabGuidance,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Compass} color={color} focused={focused} activeBg={activeBg} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t.tabPractice,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Target} color={color} focused={focused} activeBg={activeBg} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: t.tabYou,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} activeBg={activeBg} />
          ),
        }}
      />
    </Tabs>
  );
}
