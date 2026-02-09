import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";

interface ThemedLayoutProps {
  children: ReactNode;
}

export default function ThemedLayout({ children }: ThemedLayoutProps) {
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "#1C1B1F" : "#FFF8F1";
  const statusStyle = isDarkMode ? "light" : "dark";

  useEffect(() => {
    // App background (used for splash + system surfaces)
    SystemUI.setBackgroundColorAsync(bgColor).catch(() => undefined);

    // Android bottom navigation bar
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(bgColor);
      NavigationBar.setButtonStyleAsync(
        isDarkMode ? "light" : "dark"
      );
    }
  }, [bgColor, isDarkMode]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar
        style={statusStyle}
        backgroundColor={bgColor}
        translucent={false}
      />
      {children}
    </SafeAreaView>
  );
}
