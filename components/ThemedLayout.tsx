import { ReactNode, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import * as SystemUI from "expo-system-ui";

interface ThemedLayoutProps {
  children: ReactNode;
}

export default function ThemedLayout({ children }: ThemedLayoutProps) {
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "#1C1B1F" : "#FFF8F1";
  const statusStyle = isDarkMode ? "light" : "dark";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bgColor).catch(() => undefined);
  }, [bgColor]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={statusStyle} backgroundColor={bgColor} translucent={false} />
      {children}
    </SafeAreaView>
  );
}
