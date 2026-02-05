import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";

interface ThemedLayoutProps {
  children: ReactNode;
}

export default function ThemedLayout({ children }: ThemedLayoutProps) {
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "#000" : "#fff7ed";
  const statusStyle = isDarkMode ? "light" : "dark";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={statusStyle} backgroundColor={bgColor} translucent={false} />
      {children}
    </SafeAreaView>
  );
}
