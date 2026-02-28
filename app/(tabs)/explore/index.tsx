import React, { useRef, useCallback } from "react";
import {
  ScrollView,
  Text,
  Switch,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useTranslation } from "@/utils/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Trash2,
  ChevronRight,
  Moon,
  FileText,
  Shield,
  Star,
  Mail,
  Info,
  Languages,
  Check,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const MENU_SECTIONS = [
  {
    title: "LEGAL",
    items: [
      {
        labelKey: "termsConditions" as const,
        icon: FileText,
        color: "#3B82F6",
        route: "/(tabs)/explore/termsCondition",
      },
      {
        labelKey: "privacyPolicy" as const,
        icon: Shield,
        color: "#22C55E",
        route: "/(tabs)/explore/privacyPolicy",
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        labelKey: "rateApp" as const,
        icon: Star,
        color: "#F59E0B",
        route: "/(tabs)/explore/rateApp",
      },
      {
        labelKey: "contactSupport" as const,
        icon: Mail,
        color: "#E67E22",
        route: "/(tabs)/explore/contactSupport",
      },
      {
        labelKey: "about" as const,
        icon: Info,
        color: "#9B59B6",
        route: "/(tabs)/explore/about",
      },
    ],
  },
];

const LANG_OPTIONS: { lang: Language; flag: string; name: string; sub: string }[] = [
  { lang: "en", flag: "🇺🇸", name: "English", sub: "English" },
  { lang: "hi", flag: "🇮🇳", name: "हिंदी",   sub: "Hindi"   },
];

const Explore = () => {
  const router = useRouter();
  const { toggleTheme, isDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const sheetRef = useRef<BottomSheetModal>(null);

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
    sheetBg: isDarkMode ? "#081C30" : "#FFFDF8",
    handleColor: isDarkMode ? "#1A3550" : "#D9D0C7",
  };

  const openSheet = useCallback(() => sheetRef.current?.present(), []);
  const closeSheet = useCallback(() => sheetRef.current?.dismiss(), []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    [],
  );

  const currentLangOption = LANG_OPTIONS.find((o) => o.lang === language)!;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <LinearGradient
        colors={isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.pageTitle, { color: c.text }]}>{t.exploreTitle}</Text>
          <Text style={[styles.pageSub, { color: c.sub }]}>{t.exploreSubtitle}</Text>

          {/* ── Appearance ── */}
          <Text style={[styles.sectionLabel, { color: c.sub }]}>{t.appearance}</Text>
          <View style={[styles.groupCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {/* Dark Mode row */}
            <View style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: "#D0BCFF30" }]}>
                <Moon size={18} color={isDarkMode ? "#D0BCFF" : "#7D5260"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: c.text }]}>{t.darkMode}</Text>
                <Text style={[styles.menuSub, { color: c.sub }]}>{t.darkModeSub}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={isDarkMode ? "#FFB59D" : "#8A4D24"}
                trackColor={{ false: "#F0D080", true: "#1A3550" }}
              />
            </View>

            {/* Language row */}
            <TouchableOpacity
              activeOpacity={0.72}
              style={styles.menuRow}
              onPress={openSheet}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#F59E0B22" }]}>
                <Languages size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: c.text }]}>{t.languageSection}</Text>
                <Text style={[styles.menuSub, { color: c.sub }]}>{t.languageSectionSub}</Text>
              </View>
              {/* Active language pill */}
              <View style={[styles.activePill, { backgroundColor: isDarkMode ? "#0D2540" : "#FFF1E6" }]}>
                <Text style={styles.activePillFlag}>{currentLangOption.flag}</Text>
                <Text style={[styles.activePillText, { color: isDarkMode ? "#FFB59D" : "#8A4D24" }]}>
                  {currentLangOption.name}
                </Text>
              </View>
              <ChevronRight size={16} color={c.sub} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {/* ── Sectioned menus ── */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title}>
              <Text style={[styles.sectionLabel, { color: c.sub }]}>
                {/* translate section title */}
                {section.title === "LEGAL" ? t.legal : t.support}
              </Text>
              <View style={[styles.groupCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  return (
                    <TouchableOpacity
                      key={item.labelKey}
                      onPress={() => router.push(item.route as any)}
                      activeOpacity={0.72}
                      style={[
                        styles.menuRow,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: c.border },
                      ]}
                    >
                      <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                        <Icon size={18} color={item.color} />
                      </View>
                      <Text style={[styles.menuLabel, { color: c.text, flex: 1 }]}>
                        {t[item.labelKey]}
                      </Text>
                      <ChevronRight size={16} color={c.sub} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* ── Danger zone ── */}
          <Text style={[styles.sectionLabel, { color: c.sub }]}>{t.dangerZone}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.dangerCard, { backgroundColor: isDarkMode ? "#2B1A1A" : "#FFF5F5" }]}
            onPress={() => {
              Alert.alert(
                t.clearAllDataConfirmTitle,
                t.clearAllDataConfirmMsg,
                [
                  { text: t.cancel, style: "cancel" },
                  {
                    text: t.clearAll,
                    style: "destructive",
                    onPress: async () => {
                      await AsyncStorage.clear();
                      Alert.alert(t.cleared, t.dataRemoved);
                    },
                  },
                ],
              );
            }}
          >
            <View style={styles.dangerIcon}>
              <Trash2 size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerLabel}>{t.clearAllData}</Text>
              <Text style={styles.dangerSub}>{t.clearAllDataSub}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* ── Language Bottom Sheet ── */}
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: c.handleColor, width: 40 }}
        backgroundStyle={{
          backgroundColor: c.sheetBg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: Platform.OS === "ios" ? 44 : 32 }]}>

          {/* Close button */}
          <TouchableOpacity
            onPress={closeSheet}
            activeOpacity={0.7}
            style={[styles.closeBtn, { backgroundColor: isDarkMode ? "#0D2540" : "#F5EDE5" }]}
          >
            <X size={18} color={c.sub} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.sheetIconWrap}>
            <LinearGradient
              colors={["#8A4D24", "#D97706"]}
              style={styles.sheetIconCircle}
            >
              <Languages size={22} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.sheetTitle, { color: c.text }]}>
            {t.meaningKey === "en" ? "Choose Language" : "भाषा चुनें"}
          </Text>
          <Text style={[styles.sheetSub, { color: c.sub }]}>
            {t.meaningKey === "en"
              ? "Select your preferred language for the app"
              : "ऐप के लिए अपनी पसंदीदा भाषा चुनें"}
          </Text>

          {/* Language options */}
          <View style={styles.optionsWrap}>
            {LANG_OPTIONS.map(({ lang, flag, name, sub }) => {
              const isSelected = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.82}
                  onPress={() => {
                    setLanguage(lang);
                    setTimeout(() => closeSheet(), 220);
                  }}
                  style={styles.optionOuter}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={isDarkMode ? ["#6B3010", "#B8650A"] : ["#8A4D24", "#E8913A"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.optionCard}
                    >
                      {/* Decorative ring */}
                      <View style={styles.optionRing} />

                      <Text style={styles.optionFlag}>{flag}</Text>
                      <View style={styles.optionTextCol}>
                        <Text style={[styles.optionName, { color: "#fff" }]}>{name}</Text>
                        <Text style={[styles.optionSub, { color: "rgba(255,255,255,0.70)" }]}>{sub}</Text>
                      </View>
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#fff" strokeWidth={3} />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.optionCard,
                        styles.optionCardInactive,
                        { backgroundColor: isDarkMode ? "#0D2540" : "#FAF6F2", borderColor: c.border },
                      ]}
                    >
                      <Text style={styles.optionFlag}>{flag}</Text>
                      <View style={styles.optionTextCol}>
                        <Text style={[styles.optionName, { color: c.text }]}>{name}</Text>
                        <Text style={[styles.optionSub, { color: c.sub }]}>{sub}</Text>
                      </View>
                      <View style={[styles.checkCircleEmpty, { borderColor: c.border }]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sheetFooter, { color: c.sub }]}>
            {t.meaningKey === "en"
              ? "Your choice is saved automatically 🙏"
              : "आपकी पसंद स्वतः सहेज ली जाती है 🙏"}
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },

  pageTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  pageSub: { fontSize: 13, marginBottom: 24 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },

  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuLabel: { fontSize: 15, fontWeight: "600" },
  menuSub: { fontSize: 12, marginTop: 1 },

  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activePillFlag: { fontSize: 14 },
  activePillText: { fontSize: 13, fontWeight: "700" },

  dangerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    marginBottom: 10,
  },
  dangerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EF444422",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  dangerLabel: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
  dangerSub: { color: "#EF4444", fontSize: 12, opacity: 0.7, marginTop: 2 },

  // ── Bottom Sheet ──────────────────────────────────────────────
  sheetContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 0,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  sheetIconWrap: { marginTop: 8, marginBottom: 14 },
  sheetIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  sheetSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  optionsWrap: { width: "100%", gap: 12, marginBottom: 20 },

  optionOuter: { width: "100%" },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#8A4D24",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  optionCardInactive: {
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  optionRing: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
  },
  optionFlag: { fontSize: 34, marginRight: 16 },
  optionTextCol: { flex: 1 },
  optionName: { fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  optionSub: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  sheetFooter: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
  },
});
