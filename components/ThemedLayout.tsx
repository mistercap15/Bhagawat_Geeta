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

  const topBg = isDarkMode ? "#040C18" : "#FFF3DC";
  const bottomBg = isDarkMode ? "#081C30" : "#FFE8B0";
  const statusStyle = isDarkMode ? "light" : "dark";

  useEffect(() => {
    // App background (used for splash + system surfaces)
    SystemUI.setBackgroundColorAsync(topBg).catch(() => undefined);

    // Android bottom navigation bar — match gradient bottom
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(bottomBg);
      NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
    }
  }, [topBg, bottomBg, isDarkMode]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: topBg }}
      edges={["top"]}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: bottomBg }}
        edges={["bottom"]}
      >
      <StatusBar
        style={statusStyle}
        backgroundColor={topBg}
        translucent={false}
      />
      {children}
      </SafeAreaView>
    </SafeAreaView>
  );
}
