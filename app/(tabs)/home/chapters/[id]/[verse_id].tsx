import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  CheckSquare,
  Square,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { PanGestureHandler } from "react-native-gesture-handler";
import { getSlok } from "@/utils/gitaData";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/utils/translations";
import { useAchievements } from "@/context/AchievementContext";
import MaterialLoader from "@/components/MaterialLoader";
import { sendPracticeCompleteNotification } from "@/utils/notifications";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.25;

// ─── PAGE-CURL CONSTANTS ─────────────────────────────────────────
// How far a horizontal drag must travel before we treat it as a page turn and
// reveal the destination page behind the current one.
const TURN_START_PX = 12;

// The rolled cylinder starts tight and widens as more of the page lifts — like
// real paper arcing over — peaking near the end of the turn, then easing back
// as it lies flat on the far side. `t` is turn progress 0..1.
function computeCurlW(t: number): number {
  "worklet";
  return interpolate(
    t,
    [0, 0.05, 0.2, 0.5, 0.8, 1],
    [0, 12, 34, 60, 82, 70],
    Extrapolate.CLAMP,
  );
}

// ─── CONFETTI / CELEBRATION CONSTANTS ────────────────────────────
const PARTICLE_COUNT = 12;
const FAV_EMOJIS = ["❤️", "💖", "💕", "✨", "💗", "🌟", "💝", "♥️"];
const READ_EMOJIS = ["✅", "⭐", "🎉", "✨", "🌟", "💫", "🎊", "🏆"];

// ═══════════════════════════════════════════════════════════════════
//  CELEBRATION PARTICLE COMPONENT
// ═══════════════════════════════════════════════════════════════════
interface ParticleData {
  id: number;
  emoji: string;
  angle: number;
  distance: number;
  spinEnd: number;
  delay: number;
  scale: number;
}

function CelebrationParticle({
  particle,
  trigger,
}: {
  particle: ParticleData;
  trigger: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    progress.value = 0;
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: 900 + Math.random() * 400,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [trigger]);

  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(particle.angle) * particle.distance * p;
    const yBurst = Math.sin(particle.angle) * particle.distance * p;
    const gravity = 120 * p * p;
    const y = yBurst + gravity;

    const rotation = particle.spinEnd * p;
    const scale = interpolate(
      p,
      [0, 0.15, 0.5, 0.85, 1],
      [0, particle.scale * 1.3, particle.scale, particle.scale * 0.6, 0],
      Extrapolate.CLAMP,
    );
    const opacity = interpolate(
      p,
      [0, 0.1, 0.7, 1],
      [0, 1, 1, 0],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.particle, animStyle]}>
      <Text style={styles.particleEmoji}>{particle.emoji}</Text>
    </Animated.View>
  );
}

// ─── CELEBRATION BURST CONTAINER ─────────────────────────────────
function CelebrationBurst({
  type,
  trigger,
}: {
  type: "favorite" | "read";
  trigger: number;
}) {
  const emojis = type === "favorite" ? FAV_EMOJIS : READ_EMOJIS;

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angleSpread = Math.PI * 1.6;
      const baseAngle = -Math.PI / 2 - angleSpread / 2;
      const angle = baseAngle + (i / (PARTICLE_COUNT - 1)) * angleSpread;

      return {
        id: i,
        emoji: emojis[i % emojis.length],
        angle,
        distance: 55 + Math.random() * 75,
        spinEnd: (Math.random() - 0.5) * 540,
        delay: i * 30 + Math.random() * 50,
        scale: 0.7 + Math.random() * 0.6,
      };
    });
  }, [type]);

  return (
    <View style={styles.burstContainer} pointerEvents="none">
      {particles.map((p) => (
        <CelebrationParticle key={p.id} particle={p} trigger={trigger} />
      ))}
    </View>
  );
}

// ─── GLOW RING COMPONENT ─────────────────────────────────────────
function GlowRing({
  trigger,
  color,
}: {
  trigger: number;
  color: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [trigger]);

  const ringStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const scale = interpolate(p, [0, 1], [0.5, 2.8], Extrapolate.CLAMP);
    const opacity = interpolate(
      p,
      [0, 0.2, 0.6, 1],
      [0, 0.5, 0.2, 0],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
      borderColor: color,
    };
  });

  return (
    <Animated.View
      style={[styles.glowRing, ringStyle]}
      pointerEvents="none"
    />
  );
}

// ─── STABLE-WIDTH TOGGLE LABEL ───────────────────────────────────
// A button label whose two states have different text lengths would make the
// pill re-measure (and, in a centered row, shift both buttons) every tap. We
// reserve the width of the WIDER of the two states with invisible sizer texts,
// then paint the active label on top — so the pill width never changes.
function ToggleLabel({
  on,
  off,
  active,
  color,
}: {
  on: string;
  off: string;
  active: boolean;
  color: string;
}) {
  return (
    <View style={styles.labelSizer}>
      <Text style={styles.labelText} numberOfLines={1}>
        {on}
      </Text>
      <Text style={styles.labelText} numberOfLines={1}>
        {off}
      </Text>
      <Text
        style={[styles.labelText, styles.labelVisible, { color }]}
        numberOfLines={1}
      >
        {active ? on : off}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════

export default function VerseDetails() {
  const { id, verse_id, verses_count } = useLocalSearchParams();
  const chapterId = id as string;
  const versesCount = Number(verses_count);
  const initialVerseId = Number(verse_id);

  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const { checkAndUpdate, unlockSpecial } = useAchievements();

  const [verse, setVerse] = useState<any>(null);
  const [nextVerse, setNextVerse] = useState<any>(null);
  const [prevVerse, setPrevVerse] = useState<any>(null);
  const [currentVerseId, setCurrentVerseId] = useState(initialVerseId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

  // Celebration triggers
  const [favCelebration, setFavCelebration] = useState(0);
  const [readCelebration, setReadCelebration] = useState(0);

  // ─── Page-turn state ───────────────────────────────────────────
  // Once a horizontal drag is recognised we lock its direction, which renders
  // the destination page behind the current one. The current page then peels
  // away (live view, pure Reanimated transforms) to uncover it.
  const [turnDir, setTurnDir] = useState<"next" | "prev" | null>(null);
  const turnStartedRef = useRef(false);

  const swipeProgress = useSharedValue(0);
  const favScale = useSharedValue(1);
  const readScale = useSharedValue(1);
  const favGlow = useSharedValue(0);
  const readGlow = useSharedValue(0);

  const palette = useMemo(
    () => ({
      gradient: isDarkMode ? ["#040C18", "#081C30"] : ["#FFF3DC", "#FFE8B0"],
      page: isDarkMode ? "#0D2540" : "#FFF8ED",
      pageBorder: isDarkMode ? "#1A3550" : "#F0D080",
      text: isDarkMode ? "#E8F2FF" : "#1A0A00",
      muted: isDarkMode ? "#8AACC8" : "#7A5230",
      accent: isDarkMode ? "#FFB59D" : "#8A4D24",
      accentLight: isDarkMode ? "#FFCDB5" : "#A0522D",
      buttonBg: isDarkMode ? "#0D2540" : "#FFFDF8",
      innerCard: isDarkMode ? "#081C30" : "#FDF2E5",
      shadow: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(138,77,36,0.2)",
      bookmark: "#C41E3A",
    }),
    [isDarkMode],
  );


  const favAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favScale.value }],
  }));

  const readAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: readScale.value }],
  }));

  const favGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: favGlow.value,
      transform: [
        {
          scale: interpolate(
            favGlow.value,
            [0, 1],
            [1, 1.8],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  const readGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: readGlow.value,
      transform: [
        {
          scale: interpolate(
            readGlow.value,
            [0, 1],
            [1, 1.8],
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  });

  // ─── Rolled page curl ──────────────────────────────────────────
  // The page's leading edge rolls into a shaded paper cylinder that travels
  // across as you swipe: the flat part shrinks, the roll rides its edge, and
  // the destination page is uncovered beyond. Pure gradients on live views.
  // Symmetric geometry: the CURRENT page always curls off in the swipe
  // direction, uncovering the destination behind it.
  //   next (p<0): current curls off to the LEFT — fold runs W → 0, roll bulges
  //     to the RIGHT of the fold, next page revealed on the right.
  //   prev (p>0): current curls off to the RIGHT — fold runs 0 → W, roll bulges
  //     to the LEFT of the fold, previous page revealed on the left.
  // `fold` is the line where the flat page meets the roll.
  const foldPos = (p: number) => {
    "worklet";
    const t = Math.abs(p) / CARD_WIDTH;
    return p <= 0 ? CARD_WIDTH * (1 - t) : CARD_WIDTH * t;
  };

  // Roll size depends on how far the fold is from the leading edge, so the same
  // fold position gives the same bulge whichever way you turn:
  //   next: grows as the page lifts off (small → big, right → left).
  //   prev: un-turns, so it shrinks as the page flattens (big → small, left →
  //     right) — the bulge DECREASES as it reaches the right end.
  const curlOf = (p: number) => {
    "worklet";
    const t = Math.abs(p) / CARD_WIDTH;
    return computeCurlW(p > 0 ? 1 - t : t);
  };

  const flatClip = useAnimatedStyle(() => {
    const p = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, swipeProgress.value));
    const fold = foldPos(p);
    if (p > 0) return { left: fold, width: CARD_WIDTH - fold };
    return { left: 0, width: p < 0 ? fold : CARD_WIDTH };
  });

  // Counter-shift the card inside the clip so it stays FIXED while the clip
  // window moves (prev clips from the left, so the window's left edge travels).
  const flatContent = useAnimatedStyle(() => {
    const p = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, swipeProgress.value));
    return { left: p > 0 ? -foldPos(p) : 0 };
  });

  // Self-shadow where the flat page bends up into the roll (dark AT the fold).
  const foldSelfShadow = useAnimatedStyle(() => {
    const p = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, swipeProgress.value));
    const t = Math.abs(p) / CARD_WIDTH;
    const fold = foldPos(p);
    const w = 30;
    return { opacity: t * 0.9, width: w, left: p > 0 ? fold : fold - w };
  });

  // The rolled paper cylinder riding the fold.
  const rollStyle = useAnimatedStyle(() => {
    const p = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, swipeProgress.value));
    const t = Math.abs(p) / CARD_WIDTH;
    const curlW = curlOf(p);
    const fold = foldPos(p);
    return {
      opacity: t > 0.001 ? 1 : 0,
      width: curlW,
      left: p > 0 ? fold - curlW : fold,
    };
  });

  // Soft shadow the roll casts on the revealed page beyond it — tracks the roll.
  const rollShadow = useAnimatedStyle(() => {
    const p = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, swipeProgress.value));
    const t = Math.abs(p) / CARD_WIDTH;
    const curlW = curlOf(p);
    const shadowW = curlW * 0.95;
    const fold = foldPos(p);
    return {
      opacity: t,
      width: shadowW,
      left: p > 0 ? fold - curlW - shadowW : fold + curlW,
    };
  });

  // ─── Data Loading ──────────────────────────────────────────────
  const loadVerse = async (verseId: number) => {
    const data = await getSlok(chapterId, verseId);
    setVerse(data);

    const fav = await AsyncStorage.getItem(
      `favorite_verse_${chapterId}_${verseId}`,
    );
    const read = await AsyncStorage.getItem(
      `read_verse_${chapterId}_${verseId}`,
    );

    setIsFavorite(fav === "true");
    setIsRead(read === "true");
  };

  const loadAdjacentVerses = async (verseId: number) => {
    if (verseId < versesCount) {
      const next = await getSlok(chapterId, verseId + 1);
      setNextVerse(next);
    } else {
      setNextVerse(null);
    }

    if (verseId > 1) {
      const prev = await getSlok(chapterId, verseId - 1);
      setPrevVerse(prev);
    } else {
      setPrevVerse(null);
    }
  };

  useEffect(() => {
    (async () => {
      await loadVerse(initialVerseId);
      await loadAdjacentVerses(initialVerseId);
      setLoading(false);
    })();
  }, [initialVerseId]);

  useEffect(() => {
    if (!currentVerseId) return;

    const persistLastRead = async () => {
      try {
        await AsyncStorage.setItem(
          "last_read",
          JSON.stringify({
            chapter: chapterId,
            verse: currentVerseId,
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.log("Error saving last read:", e);
      }
    };

    const timeout = setTimeout(persistLastRead, 0);
    return () => clearTimeout(timeout);
  }, [currentVerseId]);

  // ─── Turn lifecycle ────────────────────────────────────────────
  const resetTurn = useCallback(() => {
    setTurnDir(null);
    turnStartedRef.current = false;
  }, []);

  // ─── Verse Change ──────────────────────────────────────────────
  const changeVerse = useCallback(
    async (direction: "next" | "prev") => {
      const nextId =
        direction === "next" ? currentVerseId + 1 : currentVerseId - 1;

      if (nextId < 1 || nextId > versesCount) {
        swipeProgress.value = withTiming(0, { duration: 250 });
        resetTurn();
        return;
      }

      setCurrentVerseId(nextId);
      await loadVerse(nextId);
      await loadAdjacentVerses(nextId);

      swipeProgress.value = 0;
      resetTurn();
    },
    [currentVerseId, versesCount, chapterId, resetTurn],
  );

  // ─── Gesture Handlers ──────────────────────────────────────────
  const onGestureEvent = useCallback(
    (e: any) => {
      const tx = e.nativeEvent.translationX;
      const ty = e.nativeEvent.translationY;

      if (Math.abs(ty) > Math.abs(tx) * 1.3) return;

      if (tx < 0 && !nextVerse) {
        swipeProgress.value = tx * 0.12;
        return;
      }
      if (tx > 0 && !prevVerse) {
        swipeProgress.value = tx * 0.12;
        return;
      }

      // Once the drag clears the threshold, lock the direction so the
      // destination page renders behind the current (peeling) page.
      if (
        !turnStartedRef.current &&
        Math.abs(tx) > TURN_START_PX &&
        Math.abs(tx) > Math.abs(ty)
      ) {
        turnStartedRef.current = true;
        setTurnDir(tx < 0 ? "next" : "prev");
      }

      swipeProgress.value = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, tx));
    },
    [nextVerse, prevVerse],
  );

  const onGestureEnd = useCallback(
    (e: any) => {
      const ty = e.nativeEvent.translationY;
      const velocityX = e.nativeEvent.velocityX || 0;

      if (Math.abs(ty) > Math.abs(swipeProgress.value)) {
        swipeProgress.value = withTiming(0, { duration: 250 }, () =>
          runOnJS(resetTurn)(),
        );
        return;
      }

      const progress = swipeProgress.value;
      const absProgress = Math.abs(progress);
      // A fling only counts if it's fast, moving in the SAME direction as the
      // drag, and past a small minimum — otherwise dragging out and returning
      // to the start (a fast reverse fling) would wrongly commit a turn.
      const fastSwipe =
        Math.abs(velocityX) > 500 &&
        absProgress > 24 &&
        Math.sign(velocityX) === Math.sign(progress);

      if (absProgress > SWIPE_THRESHOLD || fastSwipe) {
        const dir = progress < 0 ? "next" : "prev";
        const target = progress < 0 ? -CARD_WIDTH : CARD_WIDTH;

        swipeProgress.value = withTiming(
          target,
          {
            duration: interpolate(
              absProgress,
              [SWIPE_THRESHOLD, CARD_WIDTH],
              [350, 200],
              Extrapolate.CLAMP,
            ),
            easing: Easing.out(Easing.cubic),
          },
          () => runOnJS(changeVerse)(dir),
        );
      } else {
        swipeProgress.value = withTiming(
          0,
          {
            duration: 280,
            easing: Easing.out(Easing.cubic),
          },
          () => runOnJS(resetTurn)(),
        );
      }
    },
    [changeVerse, resetTurn],
  );

  // ═══════════════════════════════════════════════════════════════
  //  TOGGLE HANDLERS WITH CELEBRATION + GOAL NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  const toggleFavorite = async () => {
    const v = !isFavorite;

    if (v) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // One clean pop: quick scale-up, then a well-damped settle (no wobble).
      favScale.value = withSequence(
        withTiming(1.12, { duration: 120, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 15, stiffness: 200, mass: 0.5 }),
      );
      favGlow.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
      );
      setFavCelebration((c) => c + 1);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      favScale.value = withSequence(
        withTiming(0.94, { duration: 90 }),
        withSpring(1, { damping: 15, stiffness: 200, mass: 0.5 }),
      );
    }

    setIsFavorite(v);
    const key = `favorite_verse_${chapterId}_${currentVerseId}`;
    if (v) {
      await AsyncStorage.setItem(key, "true");
      // Check favorite-based achievements
      checkAndUpdate();
    } else {
      await AsyncStorage.removeItem(key);
    }
  };

  const toggleRead = async () => {
    try {
      const chapterKey = `read_chapter_${chapterId}`;
      const dailyKey = "daily_read_log";
      const targetKey = "daily_target";
      const today = new Date().toISOString().split("T")[0];
      const verseKey = `${chapterId}_${currentVerseId}`;

      const [[, existing], [, rawDaily]] = await AsyncStorage.multiGet([chapterKey, dailyKey]);
      let readVerses: number[] = existing ? JSON.parse(existing) : [];
      let dailyLog = rawDaily ? JSON.parse(rawDaily) : {};

      if (!dailyLog[today]) {
        dailyLog[today] = [];
      }

      let updatedReadState;

      if (readVerses.includes(currentVerseId)) {
        readVerses = readVerses.filter((v) => v !== currentVerseId);
        dailyLog[today] = dailyLog[today].filter(
          (v: string) => v !== verseKey,
        );
        updatedReadState = false;
      } else {
        readVerses.push(currentVerseId);
        if (!dailyLog[today].includes(verseKey)) {
          dailyLog[today].push(verseKey);
        }
        updatedReadState = true;
      }

      // Haptic + celebration animation
      if (updatedReadState) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // One clean pop: quick scale-up, then a well-damped settle (no wobble).
        readScale.value = withSequence(
          withTiming(1.12, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withSpring(1, { damping: 15, stiffness: 200, mass: 0.5 }),
        );
        readGlow.value = withSequence(
          withTiming(0.8, { duration: 150 }),
          withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
        );
        setReadCelebration((c) => c + 1);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        readScale.value = withSequence(
          withTiming(0.94, { duration: 90 }),
          withSpring(1, { damping: 15, stiffness: 200, mass: 0.5 }),
        );
      }

      setIsRead(updatedReadState);

      await AsyncStorage.setItem(chapterKey, JSON.stringify(readVerses));
      await AsyncStorage.setItem(dailyKey, JSON.stringify(dailyLog));

      const verseReadKey = `read_verse_${chapterId}_${currentVerseId}`;
      if (updatedReadState) {
        await AsyncStorage.setItem(verseReadKey, "true");
      } else {
        await AsyncStorage.removeItem(verseReadKey);
      }

      // ─── CHECK DAILY GOAL & FIRE NOTIFICATION ─────────────
      if (updatedReadState) {
        const rawTarget = await AsyncStorage.getItem(targetKey);
        const dailyTarget = rawTarget ? Number(rawTarget) : 3;
        const todayReadCount = (dailyLog[today] ?? []).length;

        if (todayReadCount >= dailyTarget) {
          await sendPracticeCompleteNotification();
        }

        // ─── CHECK ACHIEVEMENTS ──────────────────────────────
        // Time-based special achievements
        const hour = new Date().getHours();
        if (hour < 6) unlockSpecial("dawn_reader");
        if (hour >= 22) unlockSpecial("night_scholar");

        // General achievement check (reading milestones, chapters, streak)
        checkAndUpdate();
      }
    } catch (error) {
      console.log("Error updating read state:", error);
    }
  };

  // ─── Render Verse Card ─────────────────────────────────────────
  const renderVerseCard = (
    verseData: any,
    _verseId: number,
    isCurrent = false,
  ) => {
    if (!verseData) return null;

    return (
      <View
        style={[
          styles.pageContainer,
          {
            backgroundColor: palette.page,
            borderColor: palette.pageBorder,
          },
        ]}
      >
        {isCurrent && isFavorite && (
          <View
            style={[styles.bookmark, { backgroundColor: palette.bookmark }]}
          />
        )}

        <View
          style={[
            styles.cornerFold,
            { borderRightColor: palette.pageBorder },
          ]}
        />

        <ScrollView
          style={styles.cardContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
        >
          <View style={styles.verseSection}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.dot, { backgroundColor: palette.accentLight }]}
              />
              <Text style={[styles.sectionTitle, { color: palette.accent }]}>
                {t.sanskritHeader}
              </Text>
              <View
                style={[styles.dot, { backgroundColor: palette.accentLight }]}
              />
            </View>
            <Text style={[styles.sanskritText, { color: palette.text }]}>
              {verseData.slok}
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: palette.pageBorder }]}
          />
          <View
            style={[
              styles.meaningCard,
              {
                backgroundColor: palette.innerCard,
                borderColor: palette.pageBorder,
              },
            ]}
          >
            <Text style={[styles.meaningTitle, { color: palette.accent }]}>
              {t.hindiMeaning}
            </Text>
            <Text style={[styles.meaningText, { color: palette.text }]}>
              {verseData.tej.ht}
            </Text>
          </View>
          <View
            style={[
              styles.meaningCard,
              {
                backgroundColor: palette.innerCard,
                borderColor: palette.pageBorder,
              },
            ]}
          >
            <Text style={[styles.meaningTitle, { color: palette.accent }]}>
              {t.englishTranslation}
            </Text>
            <Text style={[styles.meaningText, { color: palette.text }]}>
              {verseData.siva.et}
            </Text>
          </View>
          <View style={styles.footer}>
            <View
              style={[styles.footerLine, { backgroundColor: palette.accent }]}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading || !verse) {
    return (
      <LinearGradient
        colors={palette.gradient as [string, string]}
        style={styles.loaderContainer}
      >
        <MaterialLoader size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={palette.gradient as [string, string]}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View className="mb-6">
          <Text
            className="text-[18px] font-semibold tracking-wide text-center"
            style={{ color: palette.accent }}
          >
            {t.chapter} {verse.chapter}
          </Text>

          <Text
            className="text-[14px] mt-1 text-center"
            style={{ color: palette.muted }}
          >
            {t.verse} {currentVerseId} / {versesCount}
          </Text>

          <View className="flex-row justify-center gap-4 mt-4">
            {/* ── FAVOURITE BUTTON WITH CELEBRATION ──────── */}
            <View style={styles.celebrationAnchor}>
              <CelebrationBurst type="favorite" trigger={favCelebration} />
              <GlowRing trigger={favCelebration} color="#C41E3A" />

              <Animated.View style={favAnimatedStyle}>
                <TouchableOpacity
                  onPress={toggleFavorite}
                  activeOpacity={0.9}
                  className={`flex-row items-center px-4 py-2 rounded-full border ${
                    isFavorite
                      ? "bg-[#C41E3A]/10 border-[#C41E3A]"
                      : isDarkMode
                        ? "border-[#1A3550]"
                        : "border-[#E8D5C4]"
                  }`}
                >
                  <View style={styles.iconWrapper}>
                    <Animated.View
                      style={[
                        styles.iconGlow,
                        { backgroundColor: "#C41E3A" },
                        favGlowStyle,
                      ]}
                    />
                    <Heart
                      size={18}
                      strokeWidth={2.2}
                      color={isFavorite ? "#C41E3A" : palette.muted}
                      fill={isFavorite ? "#C41E3A" : "transparent"}
                    />
                  </View>
                  <ToggleLabel
                    on={t.favourited}
                    off={t.favourite}
                    active={isFavorite}
                    color={isFavorite ? "#C41E3A" : palette.muted}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* ── MARK AS READ BUTTON WITH CELEBRATION ──── */}
            <View style={styles.celebrationAnchor}>
              <CelebrationBurst type="read" trigger={readCelebration} />
              <GlowRing trigger={readCelebration} color="#5BB974" />

              <Animated.View style={readAnimatedStyle}>
                <TouchableOpacity
                  onPress={toggleRead}
                  activeOpacity={0.9}
                  className={`flex-row items-center px-4 py-2 rounded-full border ${
                    isRead
                      ? "bg-[#5BB974]/10 border-[#5BB974]"
                      : isDarkMode
                        ? "border-[#1A3550]"
                        : "border-[#E8D5C4]"
                  }`}
                >
                  <View style={styles.iconWrapper}>
                    <Animated.View
                      style={[
                        styles.iconGlow,
                        { backgroundColor: "#5BB974" },
                        readGlowStyle,
                      ]}
                    />
                    {isRead ? (
                      <CheckSquare
                        size={18}
                        strokeWidth={2.2}
                        color="#5BB974"
                      />
                    ) : (
                      <Square
                        size={18}
                        strokeWidth={2.2}
                        color={palette.muted}
                      />
                    )}
                  </View>
                  <ToggleLabel
                    on={t.completed}
                    off={t.markAsRead}
                    active={isRead}
                    color={isRead ? "#5BB974" : palette.muted}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            PAGE CURL (Skia paper warp)
        ═══════════════════════════════════════════════════════ */}
        <View style={styles.pagesContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onEnded={onGestureEnd}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-15, 15]}
          >
            <Animated.View style={styles.gestureContainer}>
              {/* Destination page, revealed behind as the current page curls
                  off — next on the right, previous on the left. */}
              {turnDir === "next" && nextVerse && (
                <View style={styles.pageAbs}>
                  {renderVerseCard(nextVerse, currentVerseId + 1)}
                </View>
              )}
              {turnDir === "prev" && prevVerse && (
                <View style={styles.pageAbs}>
                  {renderVerseCard(prevVerse, currentVerseId - 1)}
                </View>
              )}

              {/* Shadow the roll casts on the revealed page (dark side sits
                  toward the roll). */}
              <Animated.View
                style={[styles.rollLayer, rollShadow]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.34)", "rgba(0,0,0,0)"]}
                  start={turnDir === "prev" ? { x: 1, y: 0 } : { x: 0, y: 0 }}
                  end={turnDir === "prev" ? { x: 0, y: 0 } : { x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* Flat part of the CURRENT page. Live/scrollable at rest. */}
              <Animated.View
                style={[styles.clipLayer, flatClip]}
                pointerEvents={turnDir ? "none" : "auto"}
              >
                <Animated.View style={[styles.flatContentInner, flatContent]}>
                  {renderVerseCard(verse, currentVerseId, true)}
                </Animated.View>
              </Animated.View>

              {/* Self-shadow where the flat page bends up into the roll (dark
                  edge sits AT the fold). */}
              <Animated.View
                style={[styles.rollLayer, foldSelfShadow]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]}
                  start={turnDir === "prev" ? { x: 1, y: 0 } : { x: 0, y: 0 }}
                  end={turnDir === "prev" ? { x: 0, y: 0 } : { x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* The rolled paper cylinder: a SOLID paper base with shading on
                  top — dark crease → bright crest → paper body → shadowed
                  underside → deep outer edge. Crease sits at the fold. */}
              <Animated.View
                style={[
                  styles.rollLayer,
                  { backgroundColor: palette.page },
                  rollStyle,
                ]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.4)",
                    "rgba(0,0,0,0.05)",
                    "rgba(255,255,255,0.55)",
                    "rgba(255,255,255,0)",
                    "rgba(0,0,0,0.28)",
                    "rgba(0,0,0,0.55)",
                  ]}
                  locations={[0, 0.16, 0.34, 0.56, 0.82, 1]}
                  start={turnDir === "prev" ? { x: 1, y: 0 } : { x: 0, y: 0 }}
                  end={turnDir === "prev" ? { x: 0, y: 0 } : { x: 1, y: 0 }}
                  style={styles.rollGradient}
                />
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 90,
  },
  pagesContainer: {
    flex: 1,
    overflow: "hidden",
  },
  gestureContainer: {
    flex: 1,
    position: "relative",
  },
  // A full-card page pinned to the left binding edge.
  pageAbs: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: CARD_WIDTH,
  },
  // Clip window for the still-flat part of the current page.
  clipLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  // Full-width card content positioned inside the clip window (anchored left).
  flatContentInner: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: CARD_WIDTH,
  },
  // The rolled paper cylinder / its cast shadow, riding the fold.
  rollLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: "hidden",
  },
  rollGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  pageContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
  },
  bookmark: {
    position: "absolute",
    top: -0.5,
    right: 40,
    width: 24,
    height: 80,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cornerFold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderRightWidth: 30,
    borderBottomWidth: 30,
    borderBottomColor: "transparent",
  },
  verseSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sanskritText: {
    fontSize: 26,
    lineHeight: 42,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.3,
  },
  meaningCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  meaningTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  meaningText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },

  // ─── CELEBRATION STYLES ──────────────────────────────────────
  celebrationAnchor: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  burstContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    zIndex: 100,
  },
  particle: {
    position: "absolute",
  },
  particleEmoji: {
    fontSize: 20,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  // Reserves the width of the longer label state so toggling never reflows.
  labelSizer: {
    marginLeft: 8,
    height: 18,
    overflow: "hidden",
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    opacity: 0,
  },
  labelVisible: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 1,
  },
  iconGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    top: "50%",
    left: "50%",
    marginTop: -14,
    marginLeft: -14,
  },
  glowRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    zIndex: 99,
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
  },
});