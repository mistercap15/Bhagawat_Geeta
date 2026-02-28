import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { Star, CheckCircle, ChevronLeft } from "lucide-react-native";

const FEATURES = {
  en: [
    "Free & ad-free forever",
    "Daily reading reminders at 7:30 AM",
    "Offline access to all 700 verses",
    "Favorites & reading progress tracking",
    "Dark mode support",
  ],
  hi: [
    "हमेशा के लिए मुफ़्त और विज्ञापन-मुक्त",
    "प्रतिदिन सुबह 7:30 बजे पढ़ाई की याद दिलाएं",
    "सभी 700 श्लोकों तक ऑफलाइन पहुँच",
    "पसंदीदा और पढ़ाई की प्रगति ट्रैकिंग",
    "डार्क मोड सपोर्ट",
  ],
};

const RateApp = () => {
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
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={34} color="#F59E0B" fill="#F59E0B" />
            ))}
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>
            {isHindi ? "ऐप पसंद आ रहा है?" : "Enjoying the App?"}
          </Text>
          <Text style={[styles.heroSub, { color: c.sub }]}>
            {isHindi
              ? "आपकी रेटिंग से और अधिक साधक गीता के ज्ञान को खोज सकते हैं 🙏"
              : "Your rating helps more seekers discover the wisdom of the Gita 🙏"}
          </Text>
        </View>

        {/* Features card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            {isHindi ? "आपको क्या मिलता है" : "What you get"}
          </Text>
          {(isHindi ? FEATURES.hi : FEATURES.en).map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <CheckCircle size={16} color="#22C55E" />
              <Text style={[styles.featureText, { color: c.sub }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.khilanpatel15.Bhagawat_Geeta"
            )
          }
          activeOpacity={0.8}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Star size={18} color="#fff" fill="#fff" />
            <Text style={styles.ctaBtnText}>{isHindi ? "Play Store पर रेट करें" : "Rate on Play Store"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default RateApp;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center", marginBottom: 8, marginLeft: -4 },

  hero: { alignItems: "center", marginBottom: 28, marginTop: 10 },
  starsRow: { flexDirection: "row", gap: 6, marginBottom: 18 },
  heroTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 290 },

  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  featureText: { fontSize: 14 },

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
