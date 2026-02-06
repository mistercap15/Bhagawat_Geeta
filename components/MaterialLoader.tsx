import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type MaterialLoaderProps = {
  size?: "small" | "large";
};

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

export default function MaterialLoader({ size = "large" }: MaterialLoaderProps) {
  const { isDarkMode } = useTheme();
  const pulseValues = useRef(GOOGLE_COLORS.map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    const animations = pulseValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(value, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 520,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [pulseValues]);

  const dotSize = size === "large" ? 12 : 8;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
      }}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {GOOGLE_COLORS.map((color, index) => (
        <Animated.View
          key={color}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: 4,
            backgroundColor: color,
            opacity: pulseValues[index],
            transform: [
              {
                scale: pulseValues[index].interpolate({
                  inputRange: [0.35, 1],
                  outputRange: [0.9, 1.15],
                }),
              },
            ],
            shadowColor: isDarkMode ? "#000" : color,
            shadowOpacity: isDarkMode ? 0.2 : 0.35,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          }}
        />
      ))}
    </View>
  );
}
