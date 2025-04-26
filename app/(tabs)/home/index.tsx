import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Share2, BookText, BookOpen, Star, Headphones, Sun } from "lucide-react-native";
import { useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import api from "@/utils/api";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";  // Import view-shot
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
  const [shlokaOfTheDay, setShlokaOfTheDay] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);  // New state for permissions
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-amber-50";
  const textColor = isDarkMode ? "text-white" : "text-amber-900";
  const sectionBg = isDarkMode ? "bg-gray-800" : "bg-white";
  
  const viewRef = useRef<any>(null); // Reference to the view to capture

  const fetchShloka = async () => {
    setLoading(true);
    setError(false);
    const randomChapter = Math.floor(Math.random() * 18) + 1;
    const versesCount: any = {
      1: 47,
      2: 47,
      3: 43,
      4: 42,
      5: 29,
      6: 47,
      7: 30,
      8: 28,
      9: 34,
      10: 42,
      11: 55,
      12: 20,
      13: 35,
      14: 27,
      15: 20,
      16: 24,
      17: 28,
      18: 78,
    };
    const randomVerse =
      Math.floor(Math.random() * versesCount[randomChapter]) + 1;
    try {
      const response = await api.get(`/slok/${randomChapter}/${randomVerse}`);
      const slokaData = response.data;
      setShlokaOfTheDay({
        chapter: slokaData.chapter,
        verse: slokaData.verse,
        text: slokaData.slok,
        translation: slokaData.siva.et,
      });
    } catch (error) {
      console.error("Error fetching sloka of the day:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShloka();
    requestPermissions();  // Request permissions when component mounts
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShloka();
    setRefreshing(false);
  };

  // Request Media Library Permissions
  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      setPermissionGranted(true);
    } else {
      console.log("Permission to access media library was denied.");
    }
  };


  const shareShloka = async () => {
    if (viewRef.current && permissionGranted) {
      try {
        const uri = await captureRef(viewRef, {
          format: "png",
          quality: 0.8,
        });
        const asset = await MediaLibrary.createAssetAsync(uri);
        const album = await MediaLibrary.getAlbumAsync("Shlokas");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Shlokas", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
        }
        await Sharing.shareAsync(uri);
  
        // SUCCESS TOAST
        Toast.show({
          type: 'success',
          text1: 'Shloka Shared!',
          text2: 'Successfully saved and ready to share 📜',
        });
  
      } catch (error) {
        // ERROR TOAST
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong while sharing 😔',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Cannot access media library. Please allow permissions.',
      });
    }
  };
  

  return (
    <View className={`flex-1 ${bgColor}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="items-center mt-6 mb-8">
          <BookText size={80} color="#92400e" />
          <Text className={`text-4xl font-bold mt-4 ${textColor}`}>
            Bhagavad Gita
          </Text>
          <Text className={`text-base mt-1 ${textColor}`}>
            Daily Wisdom for the Soul
          </Text>
        </View>

        {/* Shloka Card */}
        <View ref={viewRef} className={`mx-5 ${sectionBg} rounded-3xl shadow-md p-6 mb-8`}>
          <Text className={`text-xl font-semibold mb-3 ${textColor}`}>
            📜 Shloka of the Day
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#92400e" />
          ) : error ? (
            <Text className={`text-base ${textColor} text-center`}>
              No data available at the moment. Pull to refresh.
            </Text>
          ) : shlokaOfTheDay ? (
            <View className="border-l-4 border-amber-500 pl-4">
              <Text className={`text-base mb-2 ${textColor}`}>
                Chapter {shlokaOfTheDay.chapter}, Verse {shlokaOfTheDay.verse}
              </Text>
              <Text className={`text-2xl font-bold leading-relaxed mb-3 ${textColor}`}>
                {shlokaOfTheDay.text}
              </Text>
              <Text className={`text-base leading-relaxed ${textColor}`}>
                {shlokaOfTheDay.translation}
              </Text>
            </View>
          ) : null}
          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              className="flex-row items-center space-x-1"
              onPress={shareShloka} // Share the image on button click
            >
              <Share2 size={18} color="#92400e" />
              <Text className="text-amber-700 font-semibold">Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Explore Gita */}
        <View className={`mx-5 mb-5 rounded-3xl ${sectionBg} p-4`}>
          <Text className={`text-xl font-semibold mb-4 ${textColor}`}>
            🌼 Explore the Gita
          </Text>

          <View className="space-y-4">
            {/* Read Chapters */}
            <Animated.View
              entering={FadeInDown.duration(1200)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <BookOpen size={24} color="#92400e" />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/chapters")}
                className="flex-1 justify-center"
              >
                <View>
                  <Text className={`text-lg font-semibold ${textColor}`}>
                    Read Chapters
                  </Text>
                  <Text className={`text-sm ${textColor} opacity-70`}>
                    Explore all 18 chapters with meanings
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Favorites */}
            <Animated.View
              entering={FadeInDown.duration(1800)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-yellow-200 rounded-full p-3 mr-4 shadow-inner shadow-yellow-300">
                <Star size={24} color="#b45309" />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home/favorite")}
                className="flex-1 justify-center"
              >
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Favorites
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Bookmark shlokas you love the most
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Audio Recitations */}
            <Animated.View
              entering={FadeInDown.duration(1400)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-amber-200 rounded-full p-3 mr-4 shadow-inner shadow-amber-300">
                <Headphones size={24} color="#92400e" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Audio Recitations
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Listen to Sanskrit recitations anytime
                </Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded-full">
                <Text className="text-xs text-orange-900 font-semibold">
                  Coming Soon
                </Text>
              </View>
            </Animated.View>

            {/* Daily Practice */}
            <Animated.View
              entering={FadeInDown.duration(1600)}
              className={`flex-row items-center ${sectionBg} rounded-3xl px-5 py-4`}
            >
              <View className="bg-orange-200 rounded-full p-3 mr-4 shadow-inner shadow-orange-300">
                <Sun size={24} color="#c2410c" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textColor}`}>
                  Daily Practice
                </Text>
                <Text className={`text-sm ${textColor} opacity-70`}>
                  Set a daily reminder to read or reflect
                </Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded-full">
                <Text className="text-xs text-orange-900 font-semibold">
                  Coming Soon
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(2000)}
              className="items-center mt-8"
            >
              <Text className={`text-sm ${textColor} opacity-60`}>
                Crafted with ❤️ by{" "}
                <Text className="text-amber-800 font-semibold">
                  Khilan Patel
                </Text>
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
