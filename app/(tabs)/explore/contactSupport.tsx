import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, MessageCircle, ChevronLeft } from "lucide-react-native";

const ContactSupport = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const isHindi = t.meaningKey === "hi";

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text} />
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: "#E67E2220" }]}>
            <MessageCircle size={36} color="#E67E22" />
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>
            {isHindi ? "सहायता से संपर्क करें" : "Contact Support"}
          </Text>
          <Text style={[styles.heroSub, { color: c.sub }]}>
            {isHindi
              ? "प्रश्न, सुझाव, या बग रिपोर्ट?" + "\n" + "मैं हर संदेश पढ़ता हूँ।"
              : "Questions, suggestions, or bug reports?" + "\n" + "I read every message."}
          </Text>
        </View>

        {/* Email card */}
        <View style={[styles.emailCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.emailCardRow}>
            <Mail size={16} color="#E67E22" />
            <Text style={[styles.emailLabel, { color: c.text }]}>{isHindi ? "ईमेल" : "Email"}</Text>
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
            <Text style={styles.ctaBtnText}>{isHindi ? "ईमेल भेजें" : "Send Email"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ContactSupport;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center", marginBottom: 8, marginLeft: -4 },

  hero: { alignItems: "center", marginBottom: 28, marginTop: 10 },
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
