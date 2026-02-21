import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, MessageCircle } from "lucide-react-native";

const ContactSupport = () => {
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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: "#E67E2220" }]}>
            <MessageCircle size={36} color="#E67E22" />
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>Contact Support</Text>
          <Text style={[styles.heroSub, { color: c.sub }]}>
            Questions, suggestions, or bug reports?{"\n"}I read every message.
          </Text>
        </View>

        {/* Email card */}
        <View style={[styles.emailCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.emailCardRow}>
            <Mail size={16} color="#E67E22" />
            <Text style={[styles.emailLabel, { color: c.text }]}>Email</Text>
          </View>
          <Text style={[styles.emailAddress, { color: c.sub }]}>
            khilanpatel15@gmail.com
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:khilanpatel15@gmail.com")}
          activeOpacity={0.8}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={["#E67E22", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Mail size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Send Email</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ContactSupport;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60, flexGrow: 1, justifyContent: "center" },

  hero: { alignItems: "center", marginBottom: 32 },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  emailCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  emailCardRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  emailLabel: { fontSize: 14, fontWeight: "700" },
  emailAddress: { fontSize: 14 },

  ctaWrap: { borderRadius: 18, overflow: "hidden" },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
