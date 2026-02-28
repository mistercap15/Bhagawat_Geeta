import React, { useRef, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { LinearGradient } from "expo-linear-gradient";
import { Code2, Heart, Download, IndianRupee, X, ChevronLeft } from "lucide-react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// ⚠️ Place your UPI QR code image at: assets/images/upi-qr.png
import upiQrImage from "../../../assets/images/upi-qr.jpeg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QR_SIZE = SCREEN_WIDTH * 0.6;
const TAB_BAR_HEIGHT = 62;
const About = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const isHindi = t.meaningKey === "hi";
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const c = {
    text: isDarkMode ? "#E8F2FF" : "#1A0A00",
    sub: isDarkMode ? "#8AACC8" : "#7A5230",
    card: isDarkMode ? "#081C30" : "#FFFDF8",
    border: isDarkMode ? "#1A3550" : "#F0D080",
    sheetBg: isDarkMode ? "#081C30" : "#FFFDF8",
    handleColor: isDarkMode ? "#1A3550" : "#E0C060",
  };

  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

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

  const saveQrToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: isHindi ? "अनुमति अस्वीकृत" : "Permission Denied",
          text2: isHindi ? "छवियाँ सहेजने के लिए पहुँच की अनुमति दें" : "Please allow access to save images",
        });
        return;
      }

      const asset = Asset.fromModule(upiQrImage);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error("Could not resolve image");
      }

      const filename = `upi_qr_khilan_patel_${Date.now()}.png`;
      const destUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.copyAsync({ from: asset.localUri, to: destUri });

      await MediaLibrary.saveToLibraryAsync(destUri);

      Toast.show({
        type: "success",
        text1: isHindi ? "QR कोड सहेजा गया!" : "QR Code Saved!",
        text2: isHindi ? "आपकी फ़ोटो गैलरी में सहेजा गया 📸" : "Saved to your photo gallery 📸",
      });
    } catch (err) {
      console.error("Save QR error:", err);
      Toast.show({
        type: "error",
        text1: isHindi ? "QR कोड सहेजा नहीं जा सका" : "Could not save QR code",
        text2: isHindi ? "कृपया पुनः प्रयास करें" : "Please try again",
      });
    }
  };

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
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text} />
        </TouchableOpacity>

        {/* Developer avatar */}
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={["#8A4D24", "#D97706"]}
            style={styles.avatarCircle}
          >
            <Code2 size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.devName, { color: c.text }]}>Khilan Patel</Text>
          <Text style={[styles.devRole, { color: c.sub }]}>
            {isHindi ? "फुल स्टैक डेवलपर" : "Full Stack Developer"}
          </Text>
        </View>

        {/* About the app card */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Heart size={16} color="#C41E3A" fill="#C41E3A" />
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {isHindi ? "ऐप के बारे में" : "About the App"}
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: c.sub }]}>
            {isHindi
              ? "मैंने यह भगवद् गीता ऐप गीता के शाश्वत ज्ञान को अधिक से अधिक लोगों तक पहुँचाने के लिए बनाया है — पूरी तरह मुफ़्त और विज्ञापन-मुक्त, एक शांतिपूर्ण और ध्यानपूर्ण आध्यात्मिक अनुभव के लिए।"
              : "I built this Bhagavad Gita app to bring the eternal wisdom of the Gita to more people — completely free and ad-free, for a peaceful, distraction-free spiritual experience."}
          </Text>
        </View>

        {/* Tech stack card */}
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Code2 size={16} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {isHindi ? "तकनीक" : "Built With"}
            </Text>
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

        {/* Donate via UPI button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.ctaWrap}
          onPress={openSheet}
        >
          <LinearGradient
            colors={["#8A4D24", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <IndianRupee size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>{isHindi ? "UPI से सहयोग करें" : "Support via UPI"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.ctaHint, { color: c.sub }]}>
          {isHindi ? "आपका सहयोग इस ऐप को मुफ़्त और विज्ञापन-मुक्त रखता है 🙏" : "Your support keeps this app free & ad-free 🙏"}
        </Text>
      </ScrollView>

      {/* ── UPI QR Bottom Sheet Modal ── */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: c.handleColor,
          width: 40,
        }}
        backgroundStyle={{
          backgroundColor: c.sheetBg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* Close button */}
          <TouchableOpacity
            onPress={closeSheet}
            style={[
              styles.closeBtn,
              { backgroundColor: isDarkMode ? "#0D2540" : "#F5EDE5" },
            ]}
            activeOpacity={0.7}
          >
            <X size={18} color={c.sub} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[styles.sheetTitle, { color: c.text }]}>
            {isHindi ? "इस ऐप को सहयोग करें" : "Support This App"}
          </Text>
          <Text style={[styles.sheetSub, { color: c.sub }]}>
            {isHindi ? "दान करने के लिए किसी भी UPI ऐप से QR कोड स्कैन करें" : "Scan the QR code with any UPI app to donate"}
          </Text>

          {/* QR Code Image */}
          <View style={[styles.qrWrapper, { borderColor: c.border }]}>
            <Image
              source={upiQrImage}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          {/* Name */}
          <Text style={[styles.upiName, { color: c.text }]}>Khilan Patel</Text>

          {/* Save button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDarkMode ? "#0D2540" : "#FFF1E6",
                borderColor: c.border,
              },
            ]}
            onPress={saveQrToGallery}
          >
            <Download size={18} color={isDarkMode ? "#FFB59D" : "#8A4D24"} />
            <Text
              style={[
                styles.actionBtnText,
                { color: isDarkMode ? "#FFB59D" : "#8A4D24" },
              ]}
            >
              {isHindi ? "QR गैलरी में सेव करें" : "Save QR to Gallery"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={[styles.sheetFooter, { color: c.sub }]}>
            {isHindi ? "प्रत्येक योगदान गीता को सबके लिए मुफ़्त रखने में मदद करता है 🙏" : "Every contribution helps keep the Gita free for everyone 🙏"}
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    </LinearGradient>
  );
};

export default About;

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 60 },
  container: { padding: 24 },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center", marginBottom: 8, marginLeft: -4 },
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardBody: { fontSize: 14, lineHeight: 24 },

  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 7,
  },
  techDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D97706",
  },
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
  ctaHint: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
  },

  // ── Bottom Sheet ──
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
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
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  sheetSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 19,
  },
  qrWrapper: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrImage: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 8,
  },
  upiName: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 14,
    letterSpacing: 0.3,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: "100%",
    marginTop: 20,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  sheetFooter: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
    opacity: 0.7,
  },
});
