import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Music, PlayCircle, Clock, ChevronLeft } from "lucide-react-native";

const RECITATION_SOURCES = [
  {
    title: "Bhagavad Gita Chapter 1",
    description: "Traditional Sanskrit chanting with clear pronunciation.",
    embedUrl: "https://www.youtube.com/embed/V9Aczv1TTf4",
    duration: "43 min",
  },
  {
    title: "Bhagavad Gita Chapter 2",
    description: "Popular chapter on Karma Yoga and wisdom.",
    embedUrl: "https://www.youtube.com/embed/9YYx3v6N8V8",
    duration: "51 min",
  },
  {
    title: "Complete Bhagavad Gita Recitation",
    description: "Long-form listening for deep meditation sessions.",
    embedUrl: "https://www.youtube.com/embed/Tl4M7Yx9nsY",
    duration: "3 hr",
  },
];

export default function AudioRecitationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [selected, setSelected] = useState(RECITATION_SOURCES[0]);

  const c = useMemo(
    () => ({
      bg: isDarkMode ? "#040C18" : "#FFF3DC",
      card: isDarkMode ? "#081C30" : "#FFFDF8",
      text: isDarkMode ? "#E8F2FF" : "#1A0A00",
      sub: isDarkMode ? "#8AACC8" : "#7A5230",
      border: isDarkMode ? "#1A3550" : "#F0D080",
      activeTrack: isDarkMode ? "#0D2540" : "#FFF1E6",
    }),
    [isDarkMode]
  );

  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={[styles.headerIconWrap, { backgroundColor: "#9B59B620" }]}>
            <Music size={18} color="#9B59B6" />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>Audio Recitation</Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>Listen while you read</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {/* Player window */}
        <View
          style={[
            styles.playerWrap,
            { borderColor: c.border, backgroundColor: "#000" },
          ]}
        >
          <WebView
            source={{ uri: selected.embedUrl }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            style={{ flex: 1 }}
          />
        </View>

        {/* Now playing bar */}
        <View style={[styles.nowPlayingBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <PlayCircle size={16} color="#8A4D24" />
          <Text style={[styles.nowPlayingText, { color: c.text }]} numberOfLines={1}>
            {selected.title}
          </Text>
          <View style={styles.durationPill}>
            <Clock size={11} color={c.sub} />
            <Text style={[styles.durationText, { color: c.sub }]}>{selected.duration}</Text>
          </View>
        </View>

        {/* Track list */}
        <Text style={[styles.trackListLabel, { color: c.sub }]}>TRACKS</Text>

        {RECITATION_SOURCES.map((item) => {
          const active = selected.title === item.title;
          return (
            <TouchableOpacity
              key={item.title}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
              style={[
                styles.trackCard,
                {
                  backgroundColor: active ? c.activeTrack : c.card,
                  borderColor: active ? "#8A4D24" : c.border,
                  shadowOpacity: isDarkMode ? 0.2 : 0.06,
                },
              ]}
            >
              <View
                style={[
                  styles.trackIcon,
                  { backgroundColor: active ? "#8A4D2430" : (isDarkMode ? "#0D2540" : "#F3EDF7") },
                ]}
              >
                <PlayCircle
                  size={20}
                  color={active ? "#8A4D24" : c.sub}
                  fill={active ? "#8A4D2415" : "transparent"}
                />
              </View>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.trackDesc, { color: c.sub }]}>{item.description}</Text>
              </View>
              <Text style={[styles.trackDuration, { color: c.sub }]}>{item.duration}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 120 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6, marginTop: 4 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  headerIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 16 },

  playerWrap: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    height: 220,
    marginBottom: 14,
  },

  nowPlayingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  nowPlayingText: { flex: 1, fontSize: 13, fontWeight: "600" },
  durationPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  durationText: { fontSize: 11 },

  trackListLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },

  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  trackIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  trackDesc: { fontSize: 12 },
  trackDuration: { fontSize: 11, marginLeft: 8 },
});
