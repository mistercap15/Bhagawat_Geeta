import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAchievements } from "@/context/AchievementContext";
import { useTheme } from "@/context/ThemeContext";
import { Achievement } from "@/utils/achievements";

const SPARKLES = ["✨", "⭐", "💫", "🌟", "🎊", "🎉"];
const AUTO_DISMISS_MS = 4000;

function SparkleParticle({ emoji, index }: { emoji: string; index: number }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const angle = (index / SPARKLES.length) * Math.PI * 2;
    const dist = 80 + Math.random() * 40;
    const targetX = Math.cos(angle) * dist;
    const targetY = Math.sin(angle) * dist - 20;
    const delay = index * 60;

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(500, withTiming(0, { duration: 400 }))
      )
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      )
    );
    tx.value = withDelay(delay, withTiming(targetX, { duration: 900, easing: Easing.out(Easing.cubic) }));
    ty.value = withDelay(delay, withTiming(targetY, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.sparkle, animStyle]}>
      <Text style={styles.sparkleText}>{emoji}</Text>
    </Animated.View>
  );
}

function AchievementCard({
  achievement,
  onDismiss,
  isDarkMode,
}: {
  achievement: Achievement;
  onDismiss: () => void;
  isDarkMode: boolean;
}) {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const emojiScale = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    translateY.value = withTiming(400, { duration: 300, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 300 }, () => runOnJS(onDismiss)());
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    translateY.value = withSpring(0, { damping: 14, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12 });
    emojiScale.value = withDelay(300, withSpring(1, { damping: 6, stiffness: 200 }));

    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const bg = isDarkMode ? "#2B2930" : "#FFFDF9";
  const text = isDarkMode ? "#E8DEF8" : "#3E2723";
  const sub = isDarkMode ? "#CAC4D0" : "#625B71";

  return (
    <Animated.View style={[styles.card, { backgroundColor: bg }, cardStyle]}>
      <LinearGradient
        colors={["#D97706", "#F59E0B", "#FCD34D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      />

      {/* Sparkle particles */}
      <View style={styles.sparkleContainer} pointerEvents="none">
        {SPARKLES.map((emoji, i) => (
          <SparkleParticle key={i} emoji={emoji} index={i} />
        ))}
      </View>

      {/* Unlocked label */}
      <View style={styles.unlockedRow}>
        <Text style={styles.unlockedLabel}>🎉 ACHIEVEMENT UNLOCKED</Text>
      </View>

      {/* Big emoji */}
      <Animated.View style={[styles.emojiBubble, emojiStyle]}>
        <LinearGradient
          colors={["#FFF1E6", "#FFE4CC"]}
          style={styles.emojiBubbleInner}
        >
          <Text style={styles.bigEmoji}>{achievement.emoji}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Text style={[styles.title, { color: text }]}>{achievement.title}</Text>
      <Text style={[styles.description, { color: sub }]}>
        {achievement.description}
      </Text>

      {/* Dismiss button */}
      <TouchableOpacity
        onPress={dismiss}
        activeOpacity={0.8}
        style={styles.dismissBtn}
      >
        <LinearGradient
          colors={["#8A4D24", "#D97706"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dismissBtnInner}
        >
          <Text style={styles.dismissBtnText}>Awesome! 🙏</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AchievementUnlockedModal() {
  const { pendingUnlock, clearFirstPending } = useAchievements();
  const { isDarkMode } = useTheme();
  const overlayOpacity = useSharedValue(0);

  const achievement = pendingUnlock[0] ?? null;
  const visible = !!achievement;

  useEffect(() => {
    overlayOpacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.overlay} onPress={clearFirstPending}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBg, overlayStyle]} />
        <Pressable onPress={() => {}}>
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onDismiss={clearFirstPending}
            isDarkMode={isDarkMode}
          />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  overlayBg: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  card: {
    borderRadius: 28,
    paddingBottom: 24,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  topBar: {
    height: 5,
    width: "100%",
  },
  sparkleContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    width: 0,
    height: 0,
  },
  sparkle: {
    position: "absolute",
  },
  sparkleText: {
    fontSize: 18,
  },
  unlockedRow: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  unlockedLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8A4D24",
    letterSpacing: 1.5,
  },
  emojiBubble: {
    marginBottom: 16,
  },
  emojiBubbleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F59E0B",
  },
  bigEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 28,
    lineHeight: 20,
    marginBottom: 24,
  },
  dismissBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  dismissBtnInner: {
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  dismissBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
