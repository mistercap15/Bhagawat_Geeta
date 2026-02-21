import React from "react";
import { Text, Linking, TouchableOpacity, ScrollView, View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Code2, Heart, Coffee } from "lucide-react-native";

const About = () => {
  const { isDarkMode } = useTheme();

  const c = {
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Developer avatar */}
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={["#8A4D24", "#D97706"]}
            style={styles.avatarCircle}
          >
            <Code2 size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.devName, { color: c.text }]}>Khilan Patel</Text>
          <Text style={[styles.devRole, { color: c.sub }]}>Full Stack Developer</Text>
        </View>

        {/* About the app card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Heart size={16} color="#C41E3A" fill="#C41E3A" />
            <Text style={[styles.cardTitle, { color: c.text }]}>About the App</Text>
          </View>
          <Text style={[styles.cardBody, { color: c.sub }]}>
            I built this Bhagavad Gita app to bring the eternal wisdom of the
            Gita to more people — completely free and ad-free, for a peaceful,
            distraction-free spiritual experience.
          </Text>
        </View>

        {/* Tech stack card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Code2 size={16} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: c.text }]}>Built With</Text>
          </View>
          {[
            "React Native & Expo",
            "TypeScript",
            "NativeWind (Tailwind CSS)",
            "Expo Router",
            "react-native-reanimated",
          ].map((tech) => (
            <View key={tech} style={styles.techRow}>
              <View style={styles.techDot} />
              <Text style={[styles.techText, { color: c.sub }]}>{tech}</Text>
            </View>
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.ctaWrap}
          onPress={() =>
            Linking.openURL("https://www.buymeacoffee.com/khilanpatel")
          }
        >
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Coffee size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Buy Me a Coffee</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default About;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },

  avatarWrap: { alignItems: "center", marginBottom: 28, marginTop: 10 },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  devName: { fontSize: 22, fontWeight: "800" },
  devRole: { fontSize: 13, marginTop: 4 },

  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardBody: { fontSize: 14, lineHeight: 24 },

  techRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 7 },
  techDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D97706" },
  techText: { fontSize: 14 },

  ctaWrap: { borderRadius: 18, overflow: "hidden", marginTop: 4 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
