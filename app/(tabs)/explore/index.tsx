import React from "react";
import {
  ScrollView,
  Text,
  Switch,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_SECTIONS = [
  {
    title: "LEGAL",
    items: [
      {
        label: "Terms & Conditions",
        icon: FileText,
        color: "#3B82F6",
        route: "/(tabs)/explore/termsCondition",
      },
      {
        label: "Privacy Policy",
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
        label: "Rate the App",
        icon: Star,
        color: "#F59E0B",
        route: "/(tabs)/explore/rateApp",
      },
      {
        label: "Contact Support",
        icon: Mail,
        color: "#E67E22",
        route: "/(tabs)/explore/contactSupport",
      },
      {
        label: "About",
        icon: Info,
        color: "#9B59B6",
        route: "/(tabs)/explore/about",
      },
    ],
  },
];

const Explore = () => {
  const router = useRouter();
  const { toggleTheme, isDarkMode } = useTheme();

  const c = {
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <LinearGradient
        colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.pageTitle, { color: c.text }]}>Explore</Text>
          <Text style={[styles.pageSub, { color: c.sub }]}>
            Preferences & app information
          </Text>

          {/* ── Appearance ── */}
          <Text style={[styles.sectionLabel, { color: c.sub }]}>APPEARANCE</Text>
          <View
            style={[
              styles.groupCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: "#D0BCFF30" }]}>
                <Moon size={18} color={isDarkMode ? "#D0BCFF" : "#7D5260"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: c.text }]}>Dark Mode</Text>
                <Text style={[styles.menuSub, { color: c.sub }]}>
                  Switch between light & dark
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={isDarkMode ? "#FFB59D" : "#8A4D24"}
                trackColor={{ false: "#E8D5C4", true: "#4A4458" }}
              />
            </View>
          </View>

          {/* ── Sectioned menus ── */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title}>
              <Text style={[styles.sectionLabel, { color: c.sub }]}>
                {section.title}
              </Text>
              <View
                style={[
                  styles.groupCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => router.push(item.route as any)}
                      activeOpacity={0.72}
                      style={[
                        styles.menuRow,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: c.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.menuIcon,
                          { backgroundColor: item.color + "22" },
                        ]}
                      >
                        <Icon size={18} color={item.color} />
                      </View>
                      <Text style={[styles.menuLabel, { color: c.text, flex: 1 }]}>
                        {item.label}
                      </Text>
                      <ChevronRight size={16} color={c.sub} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* ── Danger zone ── */}
          <Text style={[styles.sectionLabel, { color: c.sub }]}>DANGER ZONE</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.dangerCard,
              { backgroundColor: isDarkMode ? "#2B1A1A" : "#FFF5F5" },
            ]}
            onPress={() => {
              Alert.alert(
                "Clear All Data",
                "This will erase all reading progress, favorites, and settings. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                      await AsyncStorage.clear();
                      Alert.alert("Cleared", "All data has been removed.");
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.dangerIcon}>
              <Trash2 size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerLabel}>Clear All Data</Text>
              <Text style={styles.dangerSub}>Removes progress & favorites</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
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
});
