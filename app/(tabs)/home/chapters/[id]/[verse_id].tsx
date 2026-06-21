import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo, useCallback } from "react";
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

// ─── PROGRESSIVE CURL CONSTANTS ──────────────────────────────────
// The curl is the visible "rolled-over" back of the page. Making it wider and
// shading it like a cylinder is what sells the illusion of real paper.
const CURL_MIN_WIDTH = 6;
const CURL_MAX_WIDTH = 72;
const SHADOW_MAX_WIDTH = 56;
const HIGHLIGHT_WIDTH = 2.5;
// Max perspective tilt (deg) applied to the lifted flap for genuine depth.
const FLAP_MAX_TILT = 22;

// ─── CONFETTI / CELEBRATION CONSTANTS ────────────────────────────
const PARTICLE_COUNT = 12;
const FAV_EMOJIS = ["❤️", "💖", "💕", "✨", "💗", "🌟", "💝", "♥️"];
const READ_EMOJIS = ["✅", "⭐", "🎉", "✨", "🌟", "💫", "🎊", "🏆"];

// ─── SHARED CURL WIDTH FUNCTION ──────────────────────────────────
// The curl starts tight and widens gradually in proportion to how much of the
// page has been turned, peaking near the end — this reads as a premium, real
// paper roll rather than a strip that pops to full size instantly.
function computeCurlWidth(absP: number): number {
  "worklet";
  return interpolate(
    absP,
    [
      0,
      CARD_WIDTH * 0.02,
      CARD_WIDTH * 0.15,
      CARD_WIDTH * 0.35,
      CARD_WIDTH * 0.6,
      CARD_WIDTH * 0.85,
      CARD_WIDTH * 0.95,
      CARD_WIDTH,
    ],
    [
      0,
      CURL_MIN_WIDTH,
      CURL_MAX_WIDTH * 0.2,
      CURL_MAX_WIDTH * 0.42,
      CURL_MAX_WIDTH * 0.68,
      CURL_MAX_WIDTH * 0.92,
      CURL_MAX_WIDTH,
      // Collapse as the page lies flat on the far side at the end of the turn.
      CURL_MAX_WIDTH * 0.12,
    ],
    Extrapolate.CLAMP,
  );
}

// Cast-shadow width also grows with the turn, tracking the rising curl.
function computeShadowWidth(absP: number): number {
  "worklet";
  return interpolate(
    absP,
    [
      0,
      CARD_WIDTH * 0.02,
      CARD_WIDTH * 0.15,
      CARD_WIDTH * 0.4,
      CARD_WIDTH * 0.7,
      CARD_WIDTH * 0.92,
      CARD_WIDTH,
    ],
    [
      0,
      3,
      SHADOW_MAX_WIDTH * 0.25,
      SHADOW_MAX_WIDTH * 0.55,
      SHADOW_MAX_WIDTH * 0.85,
      SHADOW_MAX_WIDTH,
      SHADOW_MAX_WIDTH * 0.8,
    ],
    Extrapolate.CLAMP,
  );
}

// Shading intensity ramps in quickly then holds, fading only at the very end.
function computeIntensity(absP: number): number {
  "worklet";
  return interpolate(
    absP,
    [
      0,
      CARD_WIDTH * 0.04,
      CARD_WIDTH * 0.2,
      CARD_WIDTH * 0.9,
      CARD_WIDTH,
    ],
    [0, 0.35, 1, 1, 0.6],
    Extrapolate.CLAMP,
  );
}

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
      foldBack: isDarkMode ? "#040C18" : "#E8D9C8",
      foldHighlight: isDarkMode
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.85)",
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

  // ─── Verse Change ──────────────────────────────────────────────
  const changeVerse = useCallback(
    async (direction: "next" | "prev") => {
      const nextId =
        direction === "next" ? currentVerseId + 1 : currentVerseId - 1;

      if (nextId < 1 || nextId > versesCount) {
        swipeProgress.value = withTiming(0, { duration: 250 });
        return;
      }

      // Soft tactile "page settle" tick.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setCurrentVerseId(nextId);
      await loadVerse(nextId);
      await loadAdjacentVerses(nextId);

      swipeProgress.value = 0;
    },
    [currentVerseId, versesCount, chapterId],
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

      swipeProgress.value = Math.max(-CARD_WIDTH, Math.min(CARD_WIDTH, tx));
    },
    [nextVerse, prevVerse],
  );

  const onGestureEnd = useCallback(
    (e: any) => {
      const ty = e.nativeEvent.translationY;
      const velocityX = e.nativeEvent.velocityX || 0;

      if (Math.abs(ty) > Math.abs(swipeProgress.value)) {
        swipeProgress.value = withTiming(0, { duration: 250 });
        return;
      }

      const absProgress = Math.abs(swipeProgress.value);
      const fastSwipe = Math.abs(velocityX) > 500;

      if (absProgress > SWIPE_THRESHOLD || fastSwipe) {
        const dir = swipeProgress.value < 0 ? "next" : "prev";
        const target = swipeProgress.value < 0 ? -CARD_WIDTH : CARD_WIDTH;

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
        swipeProgress.value = withTiming(0, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        });
      }
    },
    [changeVerse],
  );

  // ═══════════════════════════════════════════════════════════════
  //  PAGE CURL ANIMATED STYLES
  // ═══════════════════════════════════════════════════════════════

  // ─── UNIFIED PAGE-TURN MODEL ───────────────────────────────────
  // The page being turned is always anchored at the LEFT, with its lifted
  // (leading) edge on the RIGHT and the curl riding that edge. The destination
  // page sits static, full-width, underneath. This makes "next" and "prev" the
  // exact same physical motion — only which page turns and where its leading
  // edge travels differs:
  //   • next (swipe ←): the CURRENT page turns away; leading edge runs W → 0.
  //   • prev (swipe →): the PREVIOUS page sweeps in; leading edge runs 0 → W.
  const leadingEdgeFor = (p: number, absP: number) => {
    "worklet";
    return p < 0 ? CARD_WIDTH - absP : absP;
  };

  // CURRENT page: full-width at rest / when going back (it is the base for
  // prev). When going forward it becomes the turning page and shrinks.
  const currentPageClipStyle = useAnimatedStyle(() => {
    const p = swipeProgress.value;
    if (p >= 0) return { width: CARD_WIDTH, left: 0 };

    const absP = Math.min(-p, CARD_WIDTH);
    const curlW = computeCurlWidth(absP);
    const leadingEdge = CARD_WIDTH - absP;
    const flatW = Math.max(0, leadingEdge - curlW);
    return { width: flatW, left: 0 };
  });

  // PREVIOUS page: hidden at rest, sweeps in from the left when going back.
  const prevPageClipStyle = useAnimatedStyle(() => {
    const p = swipeProgress.value;
    if (p <= 0) return { width: 0, left: 0 };

    const absP = Math.min(p, CARD_WIDTH);
    const curlW = computeCurlWidth(absP);
    const flatW = Math.max(0, absP - curlW);
    return { width: flatW, left: 0 };
  });

  // The rolled-over back of the turning page — shaded like a paper cylinder
  // and tilted in 3D so its lifted edge reads with real depth.
  const curlStyle = useAnimatedStyle(() => {
    const p = swipeProgress.value;
    if (p === 0)
      return { opacity: 0, width: 0, left: -200, transform: [] };

    const absP = Math.min(Math.abs(p), CARD_WIDTH);
    const curlW = computeCurlWidth(absP);
    const intensity = computeIntensity(absP);
    const leadingEdge = leadingEdgeFor(p, absP);
    const left = Math.max(0, leadingEdge - curlW);

    return {
      opacity: absP > 2 ? 1 : 0,
      width: curlW,
      left,
      transform: [
        { perspective: 1000 },
        { rotateY: `${-FLAP_MAX_TILT * intensity}deg` },
      ],
    };
  });

  // Soft shadow the lifted page casts onto the page beneath it.
  const shadowStyle = useAnimatedStyle(() => {
    const p = swipeProgress.value;
    if (p === 0) return { opacity: 0, left: -200, width: 0 };

    const absP = Math.min(Math.abs(p), CARD_WIDTH);
    const shadowW = computeShadowWidth(absP);
    const intensity = computeIntensity(absP);
    const leadingEdge = leadingEdgeFor(p, absP);

    return {
      opacity: intensity,
      width: shadowW,
      left: leadingEdge,
    };
  });

  // Bright sheen along the very crest of the curl.
  const highlightStyle = useAnimatedStyle(() => {
    const p = swipeProgress.value;
    if (p === 0) return { opacity: 0, left: -200 };

    const absP = Math.min(Math.abs(p), CARD_WIDTH);
    const intensity = computeIntensity(absP);
    const leadingEdge = leadingEdgeFor(p, absP);

    return {
      opacity: intensity * 0.9,
      left: leadingEdge - HIGHLIGHT_WIDTH,
    };
  });

  // ═══════════════════════════════════════════════════════════════
  //  TOGGLE HANDLERS WITH CELEBRATION + GOAL NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  const toggleFavorite = async () => {
    const v = !isFavorite;

    if (v) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      favScale.value = withSequence(
        withTiming(0.7, { duration: 80 }),
        withSpring(1.2, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 8, stiffness: 200 }),
      );
      favGlow.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
      );
      setFavCelebration((c) => c + 1);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      favScale.value = withSequence(
        withTiming(0.85, { duration: 100 }),
        withSpring(1, { damping: 6, stiffness: 250 }),
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
        readScale.value = withSequence(
          withTiming(0.7, { duration: 80 }),
          withSpring(1.2, { damping: 4, stiffness: 300 }),
          withSpring(1, { damping: 8, stiffness: 200 }),
        );
        readGlow.value = withSequence(
          withTiming(0.8, { duration: 150 }),
          withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
        );
        setReadCelebration((c) => c + 1);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        readScale.value = withSequence(
          withTiming(0.85, { duration: 100 }),
          withSpring(1, { damping: 6, stiffness: 250 }),
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
                  <Text
                    className="ml-2 text-[13px] font-semibold"
                    style={{ color: isFavorite ? "#C41E3A" : palette.muted }}
                  >
                    {isFavorite ? t.favourited : t.favourite}
                  </Text>
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
                  <Text
                    className="ml-2 text-[13px] font-semibold"
                    style={{ color: isRead ? "#5BB974" : palette.muted }}
                  >
                    {isRead ? t.completed : t.markAsRead}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            PAGE CURL LAYERS
        ═══════════════════════════════════════════════════════ */}
        <View style={styles.pagesContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onEnded={onGestureEnd}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-15, 15]}
          >
            <Animated.View style={styles.gestureContainer}>
              {/* Base destination page — static, full width, underneath. */}
              {nextVerse && (
                <View style={[styles.clipLayer, styles.fullCard, { zIndex: 1 }]}>
                  <View style={[styles.innerCard, styles.fullCard]}>
                    {renderVerseCard(nextVerse, currentVerseId + 1)}
                  </View>
                </View>
              )}

              {/* Current page: base when going back, turning leaf when going forward. */}
              <Animated.View
                style={[styles.clipLayer, { zIndex: 2 }, currentPageClipStyle]}
              >
                <View style={[styles.innerCard, styles.fullCard]}>
                  {renderVerseCard(verse, currentVerseId, true)}
                </View>
              </Animated.View>

              {/* Previous page: sweeps in over the current page when going back. */}
              {prevVerse && (
                <Animated.View
                  style={[styles.clipLayer, { zIndex: 3 }, prevPageClipStyle]}
                >
                  <View style={[styles.innerCard, styles.fullCard]}>
                    {renderVerseCard(prevVerse, currentVerseId - 1)}
                  </View>
                </Animated.View>
              )}

              {/* Soft shadow the lifted leaf casts on the page beneath it */}
              <Animated.View
                style={[styles.foldShadow, { zIndex: 6 }, shadowStyle]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.4)",
                    "rgba(0,0,0,0.22)",
                    "rgba(0,0,0,0.1)",
                    "rgba(0,0,0,0.03)",
                    "rgba(0,0,0,0)",
                  ]}
                  locations={[0, 0.15, 0.35, 0.6, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* Rolled-over back of the turning leaf — shaded like a paper cylinder */}
              <Animated.View
                style={[
                  styles.foldBack,
                  { backgroundColor: palette.foldBack, zIndex: 8 },
                  curlStyle,
                ]}
                pointerEvents="none"
              >
                <LinearGradient
                  // crease (meets flat page) → lit apex → darkening underside
                  colors={
                    isDarkMode
                      ? [
                          "rgba(0,0,0,0.34)",
                          "rgba(255,255,255,0.16)",
                          "rgba(255,255,255,0.07)",
                          "rgba(0,0,0,0.22)",
                          "rgba(0,0,0,0.42)",
                          "rgba(0,0,0,0.62)",
                        ]
                      : [
                          "rgba(0,0,0,0.12)",
                          "rgba(255,255,255,0.8)",
                          "rgba(255,255,255,0.5)",
                          "rgba(0,0,0,0.05)",
                          "rgba(0,0,0,0.22)",
                          "rgba(0,0,0,0.44)",
                        ]
                  }
                  locations={[0, 0.22, 0.45, 0.68, 0.86, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* Bright sheen along the crest of the curl */}
              <Animated.View
                style={[styles.foldHighlight, { zIndex: 9 }, highlightStyle]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={
                    isDarkMode
                      ? ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.22)"]
                      : ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.97)"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
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
  },
  gestureContainer: {
    flex: 1,
    position: "relative",
  },
  clipLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  innerCard: {
    position: "absolute",
    top: 0,
    height: "100%",
  },
  // Full-width leaf anchored to the left edge (shared by every page layer).
  fullCard: {
    width: CARD_WIDTH,
    left: 0,
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
  foldBack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 1,
  },
  foldShadow: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  foldHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: HIGHLIGHT_WIDTH,
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