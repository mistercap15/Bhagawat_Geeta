import React from "react";
import { Text, ScrollView, View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Shield } from "lucide-react-native";

const SECTIONS = [
  {
    title: "No Data Collection",
    body: "This app does not collect, store, or share any personal user data. No accounts, no emails, no registration required.",
  },
  {
    title: "Works Fully Offline",
    body: "All 700 verses are bundled with the app. No internet connection is needed for reading. Only external links (if any) require connectivity.",
  },
  {
    title: "No Analytics or Tracking",
    body: "We do not use analytics services or tracking SDKs of any kind. Your usage is completely private.",
  },
  {
    title: "No Ads",
    body: "This app is and will remain completely ad-free. Your spiritual practice deserves peace and focus.",
  },
];

const PrivacyPolicy = () => {
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
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={[styles.headerIcon, { backgroundColor: "#22C55E20" }]}>
            <Shield size={20} color="#22C55E" />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>Privacy Policy</Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>Last updated: January 2025</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {SECTIONS.map((section, i) => (
          <View
            key={i}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>{section.title}</Text>
            <Text style={[styles.cardBody, { color: c.sub }]}>{section.body}</Text>
          </View>
        ))}

        <Text style={[styles.closing, { color: c.sub }]}>
          Your privacy is sacred — just like the message of the Gita. 🙏
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },

  pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 6 },
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
