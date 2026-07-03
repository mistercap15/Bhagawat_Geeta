import React from "react";
import { Text, ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    en: { title: "No Data Collection", body: "This app does not collect, store, or share any personal user data. No accounts, no emails, no registration required." },
    hi: { title: "कोई डेटा संग्रह नहीं", body: "यह ऐप कोई भी व्यक्तिगत उपयोगकर्ता डेटा संग्रह, संग्रहीत या साझा नहीं करता है। कोई खाता, कोई ईमेल, कोई पंजीकरण आवश्यक नहीं।" },
  },
  {
    en: { title: "Works Fully Offline", body: "All 700 verses are bundled with the app. No internet connection is needed for reading. Only external links (if any) require connectivity." },
    hi: { title: "पूरी तरह ऑफलाइन काम करता है", body: "सभी 700 श्लोक ऐप के साथ बंडल किए गए हैं। पढ़ने के लिए इंटरनेट कनेक्शन की आवश्यकता नहीं है। केवल बाहरी लिंक (यदि कोई हो) के लिए कनेक्टिविटी आवश्यक है।" },
  },
  {
    en: { title: "No Analytics or Tracking", body: "We do not use analytics services or tracking SDKs of any kind. Your usage is completely private." },
    hi: { title: "कोई एनालिटिक्स या ट्रैकिंग नहीं", body: "हम किसी भी प्रकार की एनालिटिक्स सेवाओं या ट्रैकिंग SDK का उपयोग नहीं करते। आपका उपयोग पूरी तरह निजी है।" },
  },
  {
    en: { title: "No Ads", body: "This app is and will remain completely ad-free. Your spiritual practice deserves peace and focus." },
    hi: { title: "कोई विज्ञापन नहीं", body: "यह ऐप पूरी तरह विज्ञापन-मुक्त है और रहेगा। आपकी आध्यात्मिक साधना शांति और एकाग्रता की हकदार है।" },
  },
];

const TAB_BAR_HEIGHT = 62;

const PrivacyPolicy = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
  };

  const isHindi = t.meaningKey === "hi";

  return (
    <LinearGradient
      colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 40 },
        ]}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: "#22C55E20" }]}>
            <Shield size={20} color="#22C55E" />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>
              {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
            </Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>
              {isHindi ? "अंतिम अपडेट: जनवरी 2025" : "Last updated: January 2025"}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {SECTIONS.map((section, i) => {
          const s = isHindi ? section.hi : section.en;
          return (
            <View
              key={i}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <Text style={[styles.cardTitle, { color: c.text }]}>{s.title}</Text>
              <Text style={[styles.cardBody, { color: c.sub }]}>{s.body}</Text>
            </View>
          );
        })}

        <Text style={[styles.closing, { color: c.sub }]}>
          {isHindi
            ? "आपकी गोपनीयता पवित्र है — जैसे गीता का संदेश। 🙏"
            : "Your privacy is sacred — just like the message of the Gita. 🙏"}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: { padding: 24 },
  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 6 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  headerIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 18 },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 7 },
  cardBody: { fontSize: 14, lineHeight: 22 },
  closing: { textAlign: "center", fontSize: 14, marginTop: 8, fontStyle: "italic" },
});
