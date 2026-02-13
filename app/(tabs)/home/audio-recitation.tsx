import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@/context/ThemeContext";

const RECITATION_SOURCES = [
  {
    title: "Bhagavad Gita Chapter 1",
    description: "Traditional Sanskrit chanting with clear pronunciation.",
    embedUrl: "https://www.youtube.com/embed/V9Aczv1TTf4",
  },
  {
    title: "Bhagavad Gita Chapter 2",
    description: "Popular chapter on Karma Yoga and wisdom.",
    embedUrl: "https://www.youtube.com/embed/9YYx3v6N8V8",
  },
  {
    title: "Complete Bhagavad Gita Recitation",
    description: "Long-form listening for meditation sessions.",
    embedUrl: "https://www.youtube.com/embed/Tl4M7Yx9nsY",
  },
];

export default function AudioRecitationScreen() {
  const { isDarkMode } = useTheme();
  const [selected, setSelected] = useState(RECITATION_SOURCES[0]);

  const palette = useMemo(
    () => ({
      background: isDarkMode ? "#1C1B1F" : "#FFF8F1",
      card: isDarkMode ? "#2B2930" : "#FFFDF9",
      text: isDarkMode ? "#F3EDF7" : "#3E2723",
      subText: isDarkMode ? "#CAC4D0" : "#625B71",
      accent: "#8A4D24",
      border: isDarkMode ? "#4A4458" : "#E8D5C4",
    }),
    [isDarkMode],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
    >
      <Text
        style={{ color: palette.text, fontSize: 24, fontWeight: "700", marginBottom: 6 }}
      >
        Audio Recitation
      </Text>
      <Text style={{ color: palette.subText, marginBottom: 16 }}>
        Start with curated recitation tracks. You can listen while reading verses in the app.
      </Text>

      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 12,
          marginBottom: 14,
        }}
      >
        {RECITATION_SOURCES.map((item) => {
          const active = selected.title === item.title;
          return (
            <TouchableOpacity
              key={item.title}
              onPress={() => setSelected(item)}
              style={{
                padding: 12,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: active ? palette.accent : palette.border,
                backgroundColor: active ? "#FBEEDF" : "transparent",
              }}
            >
              <Text style={{ color: palette.text, fontWeight: "600" }}>{item.title}</Text>
              <Text style={{ color: palette.subText, marginTop: 4 }}>{item.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 230, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: palette.border }}>
        <WebView source={{ uri: selected.embedUrl }} allowsFullscreenVideo mediaPlaybackRequiresUserAction />
      </View>
    </ScrollView>
  );
}
