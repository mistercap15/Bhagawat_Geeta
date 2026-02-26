import React from "react";
import { Text, ScrollView, View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { FileText } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 62;

const SECTIONS = [
  {
    en: { title: "Educational Purpose", body: "This app provides the Bhagavad Gita as an educational and spiritual resource. All content is sourced from public domain translations and is presented to promote inner peace and understanding of philosophy." },
    hi: { title: "शैक्षणिक उद्देश्य", body: "यह ऐप भगवद् गीता को एक शैक्षणिक और आध्यात्मिक संसाधन के रूप में प्रदान करता है। सभी सामग्री सार्वजनिक डोमेन अनुवादों से ली गई है और आंतरिक शांति तथा दर्शन की समझ को बढ़ावा देने के लिए प्रस्तुत की गई है।" },
  },
  {
    en: { title: "Respectful Use", body: "Users are expected to engage with the content in a peaceful and respectful manner, as befitting sacred scripture." },
    hi: { title: "सम्मानजनक उपयोग", body: "उपयोगकर्ताओं से अपेक्षा है कि वे पवित्र शास्त्र के अनुरूप सामग्री के साथ शांतिपूर्ण और सम्मानजनक तरीके से जुड़ें।" },
  },
  {
    en: { title: "Non-Commercial", body: "No part of this app may be reproduced or used for commercial purposes without explicit permission from the developer." },
    hi: { title: "गैर-व्यावसायिक", body: "डेवलपर की स्पष्ट अनुमति के बिना इस ऐप का कोई भी हिस्सा व्यावसायिक उद्देश्यों के लिए पुनः उत्पादित या उपयोग नहीं किया जा सकता।" },
  },
  {
    en: { title: "Ad-Free Commitment", body: "This app does not display advertisements and does not collect personal data. It is offered freely as a service to spiritual seekers worldwide." },
    hi: { title: "विज्ञापन-मुक्त प्रतिबद्धता", body: "यह ऐप न तो विज्ञापन प्रदर्शित करता है और न ही व्यक्तिगत डेटा संग्रहित करता है। इसे दुनिया भर के आध्यात्मिक साधकों की सेवा में निःशुल्क प्रदान किया गया है।" },
  },
];

const TermsAndConditions = () => {
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const isHindi = t.meaningKey === "hi";

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 40 },
        ]}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={[styles.headerIcon, { backgroundColor: "#3B82F620" }]}>
            <FileText size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: c.text }]}>
              {isHindi ? "नियम और शर्तें" : "Terms & Conditions"}
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
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: c.text }]}>{s.title}</Text>
              <Text style={[styles.cardBody, { color: c.sub }]}>{s.body}</Text>
            </View>
          );
        })}

        <Text style={[styles.closing, { color: c.sub }]}>
          {isHindi
            ? "इस ऐप का उपयोग करके, आप सामग्री के साथ सम्मानजनक व्यवहार करने के लिए सहमत होते हैं। 🙏"
            : "By using this app, you agree to engage with the content respectfully. 🙏"}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  container: { padding: 24 },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
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

  closing: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
});