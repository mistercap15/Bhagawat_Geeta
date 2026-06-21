import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Distance / velocity past which a downward drag dismisses the sheet.
const CLOSE_DISTANCE_RATIO = 0.3; // 30% of sheet height
const CLOSE_VELOCITY = 800;

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  /** Sheet background colour. */
  backgroundColor?: string;
  /** Drag-handle colour. */
  handleColor?: string;
  /** Max backdrop opacity (0–1). */
  backdropOpacity?: number;
  /** Fired after the sheet finishes closing. */
  onDismiss?: () => void;
}

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 240,
  mass: 0.9,
  overshootClamping: false,
  restDisplacementThreshold: 0.2,
  restSpeedThreshold: 2,
};

/**
 * Lightweight bottom sheet — no external sheet library.
 * Smooth spring open, pan-down-to-close, animated backdrop and a drag handle.
 * Content is dynamically sized; just drop children inside.
 */
const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      backgroundColor = "#FFFFFF",
      handleColor = "#D9D0C7",
      backdropOpacity = 0.5,
      onDismiss,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    // translateY: 0 = fully open, sheetHeight = fully closed (off-screen).
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const progress = useSharedValue(0); // 0 closed → 1 open (drives backdrop)
    const sheetHeight = useSharedValue(SCREEN_HEIGHT);

    const open = useCallback(() => {
      translateY.value = withSpring(0, SPRING_CONFIG);
      progress.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    }, [progress, translateY]);

    const finishClose = useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    const close = useCallback(() => {
      const target = sheetHeight.value || SCREEN_HEIGHT;
      progress.value = withTiming(0, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(
        target,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(finishClose)();
        },
      );
    }, [finishClose, progress, sheetHeight, translateY]);

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          translateY.value = SCREEN_HEIGHT;
          progress.value = 0;
          setVisible(true);
        },
        dismiss: close,
      }),
      [close, progress, translateY],
    );

    // Animate in once the Modal has mounted.
    const handleShow = useCallback(() => {
      requestAnimationFrame(open);
    }, [open]);

    // Measure real content height so closed-position and clamping are accurate.
    const onSheetLayout = useCallback(
      (h: number) => {
        if (h > 0) sheetHeight.value = h;
      },
      [sheetHeight],
    );

    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        // Only allow dragging downward.
        translateY.value = Math.max(0, e.translationY);
        const h = sheetHeight.value || SCREEN_HEIGHT;
        progress.value = interpolate(
          translateY.value,
          [0, h],
          [1, 0],
          Extrapolation.CLAMP,
        );
      })
      .onEnd((e) => {
        const h = sheetHeight.value || SCREEN_HEIGHT;
        const shouldClose =
          e.translationY > h * CLOSE_DISTANCE_RATIO ||
          e.velocityY > CLOSE_VELOCITY;

        if (shouldClose) {
          progress.value = withTiming(0, { duration: 200 });
          translateY.value = withTiming(
            h,
            { duration: 220, easing: Easing.in(Easing.cubic) },
            (finished) => {
              if (finished) runOnJS(finishClose)();
            },
          );
        } else {
          translateY.value = withSpring(0, SPRING_CONFIG);
          progress.value = withTiming(1, { duration: 200 });
        }
      });

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: progress.value * backdropOpacity,
    }));

    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onShow={handleShow}
        onRequestClose={close}
      >
        <GestureHandlerRootView style={styles.root}>
          {/* Backdrop — tap to dismiss */}
          <AnimatedPressable
            style={[styles.backdrop, backdropStyle]}
            onPress={close}
          />

          <Animated.View
            onLayout={(e) => onSheetLayout(e.nativeEvent.layout.height)}
            style={[
              styles.sheet,
              {
                backgroundColor,
                paddingBottom: (insets.bottom || 16) + 12,
              },
              sheetStyle,
            ]}
          >
            {/* Drag handle — grabbing here pulls the sheet down */}
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleZone}>
                <View
                  style={[styles.handle, { backgroundColor: handleColor }]}
                />
              </View>
            </GestureDetector>

            {children}
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 24 },
    }),
  },
  handleZone: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 14,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
});
