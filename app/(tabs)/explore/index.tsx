import React from "react";
import { ScrollView, Text, Switch, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2 } from "lucide-react-native";

const Explore = () => {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";

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
    <ScrollView
      className={`flex-1 ${bgColor} px-6 py-8`}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text className={`text-3xl font-bold mb-6 ${textColor}`}>Explore</Text>

      <View
        className={`p-4 rounded-xl mb-6 ${sectionBg} flex-row justify-between items-center`}
      >
        <Text className={`text-lg font-medium ${textColor}`}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? "#fbbf24" : "#fcd34d"}
          trackColor={{ false: "#d1d5db", true: "#78350f" }}
        />
      </View>

      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`p-4 rounded-xl mb-4 ${sectionBg}`}
          onPress={item.onPress}
        >
          <Text className={`text-lg ${textColor}`}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        className={`p-4 rounded-xl mt-6 mb-10 border border-red-400 flex-row items-center justify-center space-x-2`}
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
        <Trash2 size={20} color="#ef4444" />
        <Text className="text-red-400 font-medium text-lg ms-2">
          Clear All Data
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Explore;
