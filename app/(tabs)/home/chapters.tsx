import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ProgressBar } from "react-native-paper";  // Make sure you install react-native-paper for ProgressBar

const chapters = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}`,
  subtitle: `Some spiritual essence here`,
  progress: Math.random() * 100,  // Dummy progress data
}));

export default function ChaptersScreen() {
  const router = useRouter();

  return (
    <ScrollView className="p-2 px-6 bg-[#fff7ed]">
      <Text className="text-2xl font-bold text-amber-900 mb-4 ms-1">
        📖 All Chapters
      </Text>

      {chapters.map((chapter) => (
        <TouchableOpacity
          key={chapter.number}
          className="bg-white rounded-2xl p-4 mb-4 shadow"
          onPress={() => router.push("/(tabs)/home/shlokas")}
        >
          <View className="flex-row items-center">
            <View className="bg-amber-200 p-3 rounded-full mr-4">
              <BookOpen size={24} color="#92400e" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-amber-900">
                {chapter.title}
              </Text>
              <Text className="text-sm text-gray-600">{chapter.subtitle}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4">
            <ProgressBar
              progress={chapter.progress / 100}
              color="#facc15"
              style={{ height: 8, borderRadius: 4 }}
            />
            <Text className="text-sm text-gray-500 mt-1 text-right">
              {Math.round(chapter.progress)}% Read
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
