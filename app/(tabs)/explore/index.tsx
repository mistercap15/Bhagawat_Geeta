import React from "react";
import { ScrollView, Text, Switch, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const Explore = () => {
  const router = useRouter();
  const { toggleTheme, isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-[#E8DEF8]" : "text-[#3E2723]";
  const subTextColor = isDarkMode ? "text-[#CAC4D0]" : "text-[#625B71]";
  const sectionBg = isDarkMode ? "bg-[#2B2930]" : "bg-[#FFFDF9]";

  const options = [
    {
      label: "Terms & Conditions",
      onPress: () => router.push("/(tabs)/explore/termsCondition"),
    },
    {
      label: "Privacy Policy",
      onPress: () => router.push("/(tabs)/explore/privacyPolicy"),
    },
    {
      label: "Rate the App",
      onPress: () => router.push("/(tabs)/explore/rateApp"),
    },
    {
      label: "Contact Support",
      onPress: () => router.push("/(tabs)/explore/contactSupport"),
    },
    { label: "About", onPress: () => router.push("/(tabs)/explore/about") },
  ];

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 px-6 py-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        scrollEventThrottle={16}
      >
        <Text className={`text-3xl font-bold mb-2 ${textColor}`}>Explore</Text>
        <Text className={`text-sm mb-6 ${subTextColor}`}>
          Manage preferences and learn more about the app.
        </Text>

        <View
          className={`p-4 rounded-2xl mb-6 ${sectionBg} flex-row justify-between items-center border border-[#E8D5C4]`}
        >
          <View>
            <Text className={`text-lg font-semibold ${textColor}`}>Dark Mode</Text>
            <Text className={`text-xs mt-1 ${subTextColor}`}>
              Toggle light and dark appearance
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            thumbColor={isDarkMode ? "#FFB59D" : "#8A4D24"}
            trackColor={{ false: "#E8D5C4", true: "#4A4458" }}
          />
        </View>

        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`p-4 rounded-2xl mb-4 ${sectionBg} border border-[#E8D5C4]`}
            onPress={item.onPress}
          >
            <Text className={`text-lg font-medium ${textColor}`}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="p-4 rounded-2xl mb-10 border border-[#FCA5A5] flex-row items-center justify-center"
          onPress={() => {
            Alert.alert(
              "Clear All Data",
              "Are you sure you want to clear your data? This will erase all your favourite verses and reading progress.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Clear All",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                      Alert.alert("Success", "All your data has been cleared.");
                    } catch (error) {
                      Alert.alert(
                        "Error",
                        "Something went wrong while clearing data."
                      );
                      console.error("Clear AsyncStorage error:", error);
                    }
                  },
                },
              ]
            );
          }}
        >
          <Trash2 size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-lg ms-2">
            Clear All Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default Explore;
